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
        { transaction_id: 2, user_id: 2, amount: 150, date: '2023-10-02' }
      ]
    }
  ],
  expectedOutput: [
    { name: "Alice", total_volume: 300 }
  ],
  constraints: "Do not include users with no transactions. If there is a tie, return any valid combination.",
  notes: "Assume all dates are within the last 30 days for this sample.",
  initSql: "CREATE TABLE users (user_id INT, name TEXT); CREATE TABLE transactions (transaction_id INT, user_id INT, amount DECIMAL, date DATE); INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie'); INSERT INTO transactions VALUES (1, 1, 100, '2023-10-01'), (2, 2, 150, '2023-10-02');"
};

const generateInitSqlFromTables = (tables) => {
  if (!tables || !Array.isArray(tables)) return '-- init';
  let sql = '';
  for (const t of tables) {
    if (!t.name || !t.columns) continue;
    const cols = t.columns.map(c => `"${c.name}" ${c.type || 'TEXT'}`).join(', ');
    sql += `CREATE TABLE "${t.name}" (${cols});\n`;
    
    if (t.sampleData && Array.isArray(t.sampleData) && t.sampleData.length > 0) {
      for (const row of t.sampleData) {
        const keys = Object.keys(row).map(k => `"${k}"`).join(', ');
        const vals = Object.values(row).map(v => {
          if (typeof v === 'number') return v;
          if (v === null) return 'NULL';
          return `'${String(v).replace(/'/g, "''")}'`;
        }).join(', ');
        sql += `INSERT INTO "${t.name}" (${keys}) VALUES (${vals});\n`;
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
      if (!cleanInitSql || cleanInitSql === '-- init') {
         cleanInitSql = generateInitSqlFromTables(saved.initialTask?.tables);
      } else {
         cleanInitSql = cleanInitSql.replace(/```sql/ig, '').replace(/```/g, '').trim();
      }
      
      initWithSql(cleanInitSql, { 
        dbKey: `interview_${state.initialTask?.id || 'session'}`, 
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
          messages, sql, scratchpad, timeLeft
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
    isSubmittedRef
  };
}
