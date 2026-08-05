/**
 * useInterviewSession.js — Multi-Question Interview Session Manager
 *
 * Manages a structured 10-question interview:
 *   Q1–Q5  → SQL coding questions (each has its own dedicated SQLite DB)
 *   Q6–Q10 → MCQ conceptual questions (auto-graded, no DB needed)
 *
 * Key design:
 *  - One dedicated SQL worker (via useInterviewDatabase) shared across all SQL questions
 *  - When navigating to a SQL question, the worker re-initializes with that question's initSql
 *  - answers[index] = { sql: '...', queryResult: {...} } for SQL, { selectedIndex: N } for MCQ
 *  - Full session is generated in one AI call at startup (generateFullInterviewSession)
 *  - Session state is persisted to localStorage every 5 seconds
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateFullInterviewSession } from '@/lib/groq';
import { useInterviewDatabase } from './useInterviewDatabase';

// ─── SQLite helpers (shared with DB init) ─────────────────────────────────────

const mapToSqliteType = (type = 'TEXT') => {
  const t = String(type).toUpperCase().trim();
  if (t.includes('INT') || t.includes('SERIAL') || t.includes('BOOL')) return 'INTEGER';
  if (t.includes('FLOAT') || t.includes('DOUBLE') || t.includes('DEC') || t.includes('NUM') || t.includes('REAL')) return 'REAL';
  if (t.includes('BLOB') || t.includes('BYTE') || t.includes('BINARY')) return 'BLOB';
  return 'TEXT';
};

const formatSqlValue = (val) => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return isNaN(val) ? 'NULL' : String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  return `'${String(val).replace(/'/g, "''")}'`;
};

export const buildInitSqlFromTables = (tables) => {
  if (!Array.isArray(tables) || tables.length === 0) return null;
  let sql = '';
  for (const t of tables) {
    if (!t || typeof t.name !== 'string') continue;
    const tableName = t.name.trim().replace(/"/g, '');
    if (!tableName) continue;

    let colDefs = '';
    if (Array.isArray(t.columns) && t.columns.length > 0) {
      const defs = t.columns
        .filter(c => c && (typeof c === 'string' || typeof c.name === 'string'))
        .map(c => {
          const name = (typeof c === 'string' ? c : c.name).trim().replace(/"/g, '');
          const type = typeof c === 'object' && c.type ? mapToSqliteType(c.type) : 'TEXT';
          return `"${name}" ${type}`;
        });
      colDefs = defs.join(', ');
    }
    if (!colDefs && Array.isArray(t.sampleData) && t.sampleData.length > 0) {
      const firstRow = t.sampleData[0];
      if (firstRow && typeof firstRow === 'object' && !Array.isArray(firstRow)) {
        colDefs = Object.keys(firstRow).map(k => `"${k.replace(/"/g, '')}" TEXT`).join(', ');
      }
    }
    if (!colDefs) colDefs = '"id" INTEGER';

    sql += `CREATE TABLE IF NOT EXISTS "${tableName}" (${colDefs});\n`;
    if (Array.isArray(t.sampleData)) {
      for (const row of t.sampleData) {
        if (!row) continue;
        if (Array.isArray(row)) {
          sql += `INSERT INTO "${tableName}" VALUES (${row.map(formatSqlValue).join(', ')});\n`;
        } else if (typeof row === 'object') {
          const keys = Object.keys(row);
          if (keys.length > 0) {
            const ks = keys.map(k => `"${k.replace(/"/g, '')}"`).join(', ');
            const vs = keys.map(k => formatSqlValue(row[k])).join(', ');
            sql += `INSERT INTO "${tableName}" (${ks}) VALUES (${vs});\n`;
          }
        }
      }
    }
  }
  return sql || null;
};

const sanitizeInitSql = (rawSql, tables) => {
  let sql = rawSql
    ? rawSql.replace(/```(?:sql|sqlite)?\s*/gi, '').replace(/```/g, '').trim()
    : null;
  if (!sql || !sql.toLowerCase().includes('create table')) {
    sql = buildInitSqlFromTables(tables);
  }
  return sql || null;
};

// ─── Fallback session if AI completely fails ──────────────────────────────────
const buildFallbackSession = () => {
  const sqlQ1 = {
    problemStatement: 'Find all orders placed in January 2024 and return the order_id, customer_name, and total_amount, sorted by total_amount descending.',
    explanation: 'Filter orders by date range and join with customers to get the name.',
    tables: [
      {
        name: 'customers',
        columns: [{ name: 'customer_id', type: 'INTEGER' }, { name: 'name', type: 'TEXT' }],
        sampleData: [{ customer_id: 1, name: 'Alice' }, { customer_id: 2, name: 'Bob' }, { customer_id: 3, name: 'Carol' }],
      },
      {
        name: 'orders',
        columns: [{ name: 'order_id', type: 'INTEGER' }, { name: 'customer_id', type: 'INTEGER' }, { name: 'total_amount', type: 'REAL' }, { name: 'order_date', type: 'TEXT' }],
        sampleData: [
          { order_id: 1, customer_id: 1, total_amount: 250, order_date: '2024-01-05' },
          { order_id: 2, customer_id: 2, total_amount: 180, order_date: '2024-01-12' },
          { order_id: 3, customer_id: 3, total_amount: 420, order_date: '2024-02-03' },
        ],
      },
    ],
    expectedOutput: [{ name: 'Alice', total_amount: 250 }, { name: 'Bob', total_amount: 180 }],
    constraints: 'Only January 2024. Order by total_amount DESC.',
  };
  sqlQ1.initSql = buildInitSqlFromTables(sqlQ1.tables);

  const fallbackSqlQuestions = [
    sqlQ1,
    { ...sqlQ1, problemStatement: 'Count the number of orders per customer. Return customer name and order count, sorted by count descending.' },
    { ...sqlQ1, problemStatement: 'Find the top customer by total spending across all orders. Return name and total_spent.' },
    { ...sqlQ1, problemStatement: 'List customers who have placed more than 1 order.' },
    { ...sqlQ1, problemStatement: 'Return the average order amount per customer.' },
  ];

  const fallbackMcqQuestions = [
    { question: 'What does LEFT JOIN return when there is no matching row in the right table?', options: ['NULL for right table columns', 'The row is excluded', 'An error is raised', 'Zero for numeric columns'], correctIndex: 0, explanation: 'LEFT JOIN preserves all rows from the left table and fills right table columns with NULL if no match exists.' },
    { question: 'Which SQL clause is used to filter aggregated results?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correctIndex: 1, explanation: 'HAVING filters after aggregation (GROUP BY), while WHERE filters individual rows before aggregation.' },
    { question: 'What is the result of NULL = NULL in SQL?', options: ['TRUE', 'FALSE', 'NULL', 'Error'], correctIndex: 2, explanation: 'Any comparison with NULL yields NULL (unknown), not TRUE or FALSE. Use IS NULL to check for NULL.' },
    { question: 'Which window function assigns a sequential integer rank without gaps to each row?', options: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'NTILE()'], correctIndex: 2, explanation: 'DENSE_RANK() assigns consecutive ranks with no gaps when there are ties, unlike RANK() which skips numbers.' },
    { question: 'What is a covering index?', options: ['An index on every column', 'An index that includes all columns needed by a query, avoiding a table lookup', 'An index on the primary key', 'An index used in a JOIN'], correctIndex: 1, explanation: 'A covering index includes all columns needed for a query so the DB engine can answer it from the index alone without reading the table.' },
  ];

  return { sql_questions: fallbackSqlQuestions, mcq_questions: fallbackMcqQuestions };
};

// ─────────────────────────────────────────────────────────────────────────────
// Main hook
// ─────────────────────────────────────────────────────────────────────────────

export function useInterviewSession({
  duration,
  difficulty,
  companyName,
  candidateName,
  roleName,
  restoreSessionState,
  saveSessionState,
  isTerminated,
  handleFinalSubmit,
  toast,
}) {
  // Dedicated DB for all SQL questions in this session
  const { dbStatus, dbError, initDb, executeQuery } = useInterviewDatabase();

  // ── Session state ─────────────────────────────────────────────────────────
  const [sessionData, setSessionData]       = useState(null); // { sql_questions: [], mcq_questions: [] }
  const [currentIndex, setCurrentIndex]     = useState(0);    // 0-9
  const [answers, setAnswers]               = useState(Array(10).fill(null));
  // answers[0..4] = { sql: '...', queryResult: {...} } | null
  // answers[5..9] = { selectedIndex: N } | null

  const [generating, setGenerating]         = useState(true);
  const [dbSwitching, setDbSwitching]       = useState(false);
  const [timeLeft, setTimeLeft]             = useState(duration * 60);
  const [chatMessages, setChatMessages]     = useState([]); // shared AI chat

  const isSubmittedRef = useRef(false);
  const questionInitSqlsRef = useRef([]); // initSql per SQL question [0..4]

  // ── Derived helpers ───────────────────────────────────────────────────────
  const isMCQ       = currentIndex >= 5;
  const sqlIndex    = isMCQ ? null : currentIndex;
  const mcqIndex    = isMCQ ? currentIndex - 5 : null;
  const currentQuestion = sessionData
    ? (isMCQ ? sessionData.mcq_questions?.[mcqIndex] : sessionData.sql_questions?.[sqlIndex])
    : null;
  const totalQuestions = 10;

  // ── Switch DB when navigating between SQL questions ───────────────────────
  useEffect(() => {
    if (!sessionData || isMCQ) return;
    const initSql = questionInitSqlsRef.current[currentIndex];
    if (!initSql) return;

    setDbSwitching(true);
    initDb(initSql).catch(err => {
      console.error('[InterviewSession] DB switch failed:', err.message);
      toast({ title: 'Database Error', message: `Could not load schema for Q${currentIndex + 1}.`, type: 'error' });
    }).finally(() => setDbSwitching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, sessionData]);

  // ── Parse and validate AI response ───────────────────────────────────────
  const parseSessionData = (raw) => {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/```json\s*/i, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    if (!parsed?.sql_questions || !Array.isArray(parsed.sql_questions)) throw new Error('Missing sql_questions');
    if (!parsed?.mcq_questions || !Array.isArray(parsed.mcq_questions)) throw new Error('Missing mcq_questions');

    // Ensure we have exactly 5 of each (trim or pad)
    const sqlQs = parsed.sql_questions.slice(0, 5);
    const mcqQs = parsed.mcq_questions.slice(0, 5);

    // Sanitize each SQL question's initSql
    const sanitizedSqlQs = sqlQs.map(q => ({
      ...q,
      initSql: sanitizeInitSql(q.initSql, q.tables),
    }));

    return { sql_questions: sanitizedSqlQs, mcq_questions: mcqQs };
  };

  // ── Main initialization ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // 1. Try to restore saved session
      const saved = restoreSessionState();
      if (saved?.sessionData?.sql_questions) {
        if (!cancelled) {
          setSessionData(saved.sessionData);
          setCurrentIndex(saved.currentIndex ?? 0);
          setAnswers(saved.answers ?? Array(10).fill(null));
          setTimeLeft(saved.timeLeft ?? duration * 60);
          setChatMessages(saved.chatMessages ?? []);

          // Rebuild initSql refs
          saved.sessionData.sql_questions.forEach((q, i) => {
            questionInitSqlsRef.current[i] = q.initSql || null;
          });

          // Load DB for the restored current question
          const restoredIndex = saved.currentIndex ?? 0;
          const isRestoredMCQ = restoredIndex >= 5;
          if (!isRestoredMCQ) {
            const initSql = questionInitSqlsRef.current[restoredIndex];
            if (initSql) {
              setDbSwitching(true);
              await initDb(initSql).catch(err => console.error('DB restore error:', err.message));
              if (!cancelled) setDbSwitching(false);
            }
          }

          if (!cancelled) setGenerating(false);
        }
        return;
      }

      // 2. Generate fresh session
      try {
        const raw = await generateFullInterviewSession({ difficulty, companyName, candidateName, roleName });
        if (cancelled) return;
        if (!raw) throw new Error('Empty AI response');

        const data = parseSessionData(raw);

        // Store initSqls
        data.sql_questions.forEach((q, i) => {
          questionInitSqlsRef.current[i] = q.initSql || null;
        });

        if (!cancelled) {
          setSessionData(data);

          // Load DB for Q1
          const firstInitSql = data.sql_questions[0]?.initSql;
          if (firstInitSql) {
            setDbSwitching(true);
            await initDb(firstInitSql).catch(err => {
              console.error('[InterviewSession] Q1 DB init failed:', err.message);
            });
            if (!cancelled) setDbSwitching(false);
          }

          const welcomeMsg = {
            role: 'assistant',
            content: `Welcome to your **${companyName}** ${difficulty.toUpperCase()} interview, **${candidateName}**! 🎯\n\nThis session has **5 SQL coding questions** and **5 multiple-choice questions** (10 total).\n\n- Questions 1–5 are SQL coding challenges. Each has its own live database you can query.\n- Questions 6–10 are conceptual MCQ questions.\n\nYou can navigate freely between questions. Your answers are auto-saved. Good luck! 💪`,
          };
          setChatMessages([welcomeMsg]);

          saveSessionState({
            sessionData: data,
            currentIndex: 0,
            answers: Array(10).fill(null),
            timeLeft: duration * 60,
            chatMessages: [welcomeMsg],
          });
        }
      } catch (err) {
        console.error('[InterviewSession] Session generation failed, using fallback:', err.message);
        if (!cancelled) {
          const fallback = buildFallbackSession();
          fallback.sql_questions.forEach((q, i) => {
            questionInitSqlsRef.current[i] = q.initSql || null;
          });
          setSessionData(fallback);
          if (fallback.sql_questions[0]?.initSql) {
            await initDb(fallback.sql_questions[0].initSql).catch(() => {});
          }
          setChatMessages([{ role: 'assistant', content: `Welcome to your interview! Note: AI generation failed (check your API key). A fallback session has been loaded.` }]);
          toast({ title: 'AI Generation Failed', message: 'A fallback interview session has been loaded.', type: 'warning' });
        }
      } finally {
        if (!cancelled) setGenerating(false);
      }
    };

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigate between questions ────────────────────────────────────────────
  const navigateTo = useCallback((index) => {
    if (index < 0 || index >= totalQuestions) return;
    setCurrentIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, totalQuestions - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  // ── Save an answer for current question ───────────────────────────────────
  const saveAnswer = useCallback((answer) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = answer;
      return next;
    });
  }, [currentIndex]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isSubmittedRef.current || generating || isTerminated) return;

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

    return () => clearInterval(timer);
  }, [generating, isTerminated, handleFinalSubmit]);

  // ── Auto-save every 5 s ───────────────────────────────────────────────────
  useEffect(() => {
    if (generating || isTerminated || isSubmittedRef.current || !sessionData) return;

    const interval = setInterval(() => {
      if (!isSubmittedRef.current && !isTerminated) {
        saveSessionState({ sessionData, currentIndex, answers, timeLeft, chatMessages });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [generating, sessionData, currentIndex, answers, timeLeft, chatMessages, isTerminated, saveSessionState]);

  return {
    // Session data
    sessionData,
    currentIndex,
    currentQuestion,
    isMCQ,
    sqlIndex,
    mcqIndex,
    totalQuestions,
    answers,
    saveAnswer,

    // Navigation
    navigateTo,
    goNext,
    goPrev,

    // Status
    generating,
    dbStatus,
    dbError,
    dbSwitching,
    timeLeft,

    // Chat
    chatMessages,
    setChatMessages,

    // Refs & DB ops
    isSubmittedRef,
    executeQuery,
  };
}
