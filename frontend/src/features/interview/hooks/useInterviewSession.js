import { useState, useEffect, useRef } from 'react';
import { generateInterviewTask } from '@/lib/groq';

// Fallback task in case AI fails
const FALLBACK_TASK = {
  problemStatement: "Identify the top 3 users by total transaction volume in the last 30 days.",
  explanation: "You need to join the users and transactions tables, aggregate the total amount per user, and limit the result to the top 3.",
  tables: [
    {
      name: "users",
      columns: [
        { name: "user_id", type: "INT", description: "Unique identifier for the user" },
        { name: "name", type: "TEXT", description: "Name of the user" }
      ],
      sampleData: [
        { user_id: 1, name: 'Alice' }, { user_id: 2, name: 'Bob' }, { user_id: 3, name: 'Charlie' }
      ]
    },
    {
      name: "transactions",
      columns: [
        { name: "transaction_id", type: "INT", description: "Unique identifier for the transaction" },
        { name: "user_id", type: "INT", description: "User who made the transaction" },
        { name: "amount", type: "DECIMAL", description: "Transaction amount" },
        { name: "date", type: "DATE", description: "Transaction date" }
      ],
      sampleData: [
        { transaction_id: 1, user_id: 1, amount: 100, date: '2023-10-01' },
        { transaction_id: 2, user_id: 2, amount: 150, date: '2023-10-02' },
        { transaction_id: 3, user_id: 1, amount: 200, date: '2023-10-03' },
        { transaction_id: 4, user_id: 3, amount: 50, date: '2023-10-04' }
      ]
    }
  ],
  expectedOutput: [
    { name: "Alice", total_volume: 300 },
    { name: "Bob", total_volume: 150 },
    { name: "Charlie", total_volume: 50 }
  ],
  constraints: "Do not include users with no transactions. If there is a tie, return any valid combination.",
  notes: "Assume all dates are within the last 30 days for this sample.",
  initSql: `CREATE TABLE IF NOT EXISTS "users" ("user_id" INTEGER, "name" TEXT);
CREATE TABLE IF NOT EXISTS "transactions" ("transaction_id" INTEGER, "user_id" INTEGER, "amount" REAL, "date" TEXT);
INSERT INTO "users" ("user_id", "name") VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie');
INSERT INTO "transactions" ("transaction_id", "user_id", "amount", "date") VALUES (1, 1, 100, '2023-10-01'), (2, 2, 150, '2023-10-02'), (3, 1, 200, '2023-10-03'), (4, 3, 50, '2023-10-04');`
};

const mapToSqliteType = (type = 'TEXT') => {
  const t = String(type).toUpperCase().trim();
  if (t.includes('INT') || t.includes('SERIAL')) return 'INTEGER';
  if (t.includes('CHAR') || t.includes('TEXT') || t.includes('STR') || t.includes('VARCHAR') || t.includes('DATE') || t.includes('TIME')) return 'TEXT';
  if (t.includes('FLOAT') || t.includes('DOUBLE') || t.includes('DEC') || t.includes('NUM') || t.includes('REAL')) return 'REAL';
  if (t.includes('BOOL')) return 'INTEGER';
  if (t.includes('BLOB') || t.includes('BYTE')) return 'BLOB';
  return 'TEXT';
};

const formatSqlValue = (val) => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return isNaN(val) ? 'NULL' : String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  return `'${String(val).replace(/'/g, "''")}'`;
};

const generateInitSqlFromTables = (tables) => {
  if (!tables || !Array.isArray(tables)) return '-- init';
  let sql = '';
  for (const t of tables) {
    if (!t || !t.name) continue;
    const tableName = String(t.name).trim().replace(/"/g, '');
    
    // Columns
    let colsDefs = '';
    let colNames = [];
    if (Array.isArray(t.columns) && t.columns.length > 0) {
      colsDefs = t.columns.map(c => {
        const colName = typeof c === 'string' ? c.trim() : (c.name || 'col').trim();
        colNames.push(colName);
        const colType = typeof c === 'object' && c.type ? mapToSqliteType(c.type) : 'TEXT';
        return `"${colName.replace(/"/g, '')}" ${colType}`;
      }).join(', ');
    } else if (Array.isArray(t.sampleData) && t.sampleData.length > 0 && typeof t.sampleData[0] === 'object') {
      colNames = Object.keys(t.sampleData[0]);
      colsDefs = colNames.map(k => `"${k.replace(/"/g, '')}" TEXT`).join(', ');
    } else {
      colsDefs = '"id" INTEGER';
      colNames = ['id'];
    }

    sql += `CREATE TABLE IF NOT EXISTS "${tableName}" (${colsDefs});\n`;
    
    // Sample Data
    if (Array.isArray(t.sampleData) && t.sampleData.length > 0) {
      for (const row of t.sampleData) {
        if (!row) continue;
        if (Array.isArray(row)) {
          const vals = row.map(formatSqlValue).join(', ');
          sql += `INSERT INTO "${tableName}" VALUES (${vals});\n`;
        } else if (typeof row === 'object') {
          const rowKeys = Object.keys(row);
          if (rowKeys.length > 0) {
            const keysStr = rowKeys.map(k => `"${k.replace(/"/g, '')}"`).join(', ');
            const valsStr = rowKeys.map(k => formatSqlValue(row[k])).join(', ');
            sql += `INSERT INTO "${tableName}" (${keysStr}) VALUES (${valsStr});\n`;
          }
        }
      }
    }
  }
  return sql || '-- init';
};

export function useInterviewSession({
  duration,
  difficulty,
  companyName,
  candidateName,
  roleName,
  restoreSessionState,
  saveSessionState,
  initWithSql,
  isTerminated,
  handleFinalSubmit,
  toast,
}) {
  const [messages, setMessages] = useState([]);
  const [sql, setSql] = useState('-- Write your solution here once you understand the requirements...\n\n');
  const [scratchpad, setScratchpad] = useState('-- Use this scratchpad for notes or intermediate queries...\n\n');
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [initialTask, setInitialTask] = useState(null);
  const [generatingQuestion, setGeneratingQuestion] = useState(true);
  const isSubmittedRef = useRef(false);
  const savedInitSqlRef = useRef(null);

  useEffect(() => {
    const saved = restoreSessionState();
    
    if (saved && (saved.initSql || saved.initialTask?.tables)) {
      setInitialTask(saved.initialTask);
      setMessages(saved.messages || []);
      setSql(saved.sql || '');
      setScratchpad(saved.scratchpad || '');
      setTimeLeft(saved.timeLeft || duration * 60);
      setGeneratingQuestion(false);
      
      let cleanInitSql = saved.initSql;
      if (cleanInitSql) {
         cleanInitSql = cleanInitSql.replace(/```sql/ig, '').replace(/```/g, '').trim();
      }
      if (!cleanInitSql || cleanInitSql === '-- init' || !cleanInitSql.toLowerCase().includes('create table')) {
         cleanInitSql = generateInitSqlFromTables(saved.initialTask?.tables);
      }
      
      savedInitSqlRef.current = cleanInitSql;
      
      initWithSql(cleanInitSql, { 
        dbKey: `interview_${saved.initialTask?.id || 'session'}`, 
        forceFresh: true 
      }).catch(err => {
        console.error('Failed to init DB from saved state:', err);
        toast({ title: 'Database Error', message: err.message, type: 'error' });
      });
    } else {
      const fetchQuestion = async () => {
        try {
          const taskText = await generateInterviewTask({
            difficulty,
            companyName,
            candidateName,
            roleName
          });
          
          if (!taskText) throw new Error('Empty response');

          let taskData;
          try {
            taskData = JSON.parse(taskText);
          } catch(e) {
            const cleaned = taskText.replace(/```json/i, '').replace(/```/g, '').trim();
            taskData = JSON.parse(cleaned);
          }

          setInitialTask(taskData);
          
          let cleanInitSql = taskData.initSql;
          if (!cleanInitSql || cleanInitSql.trim() === '') {
             cleanInitSql = generateInitSqlFromTables(taskData.tables);
          } else {
             cleanInitSql = cleanInitSql.replace(/```sql/ig, '').replace(/```/g, '').trim();
             if (!cleanInitSql.toLowerCase().includes('create table')) {
               cleanInitSql = generateInitSqlFromTables(taskData.tables);
             }
          }
          
          savedInitSqlRef.current = cleanInitSql;
          
          await initWithSql(cleanInitSql, {
            dbKey: `interview_${taskData.id || 'session'}`,
            forceFresh: true
          });
          
          const welcomeMsg = {
            role: 'assistant',
            content: `Welcome to your ${companyName} interview, ${candidateName}! I'm your interviewer today.\n\nHere is your task:\n\n---\n\n${taskData.markdown}\n\n---\n\nBefore you start writing SQL, please ask me any clarifying questions about the data schema or edge cases.`
          };
          setMessages([welcomeMsg]);
          
          saveSessionState({
            difficulty, companyName, roleName, candidateName, initialTask: taskData,
            initSql: cleanInitSql, messages: [welcomeMsg], sql: '', scratchpad: '', timeLeft: duration * 60
          });
        } catch (err) {
          console.error(err);
          setInitialTask(FALLBACK_TASK);
          savedInitSqlRef.current = FALLBACK_TASK.initSql;
          await initWithSql(FALLBACK_TASK.initSql, {
            dbKey: 'interview_fallback',
            forceFresh: true
          });
        } finally {
          setGeneratingQuestion(false);
        }
      };
      fetchQuestion();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isSubmittedRef.current || generatingQuestion || isTerminated) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const saveInterval = setInterval(() => {
      if (!isSubmittedRef.current && !isTerminated) {
        saveSessionState({
          difficulty, companyName, roleName, candidateName, initialTask,
          messages, sql, scratchpad, timeLeft, initSql: savedInitSqlRef.current
        });
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(saveInterval);
    };
  }, [generatingQuestion, messages, sql, scratchpad, isTerminated, difficulty, companyName, roleName, candidateName, initialTask, timeLeft, handleFinalSubmit, saveSessionState]);

  return {
    messages,
    setMessages,
    sql,
    setSql,
    scratchpad,
    setScratchpad,
    timeLeft,
    initialTask,
    generatingQuestion,
    isSubmittedRef,
    savedInitSqlRef
  };
}
