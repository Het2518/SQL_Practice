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

// ─── Multi-Domain Dynamic Fallback Pools ─────────────────────────────────────
const FALLBACK_SQL_POOLS = {
  easy: [
    {
      problemStatement: 'Find all flights departing from JFK that were delayed by more than 15 minutes. Return flight_id, airline_code, origin_airport, and delay_minutes, sorted by delay_minutes descending.',
      explanation: 'Filter flight_logs where origin_airport is JFK and delay_minutes > 15, then sort by delay_minutes DESC.',
      constraints: 'Include only flights with delay_minutes > 15. Sort by delay_minutes in descending order.',
      tables: [
        {
          name: 'flight_logs',
          columns: [{ name: 'flight_id', type: 'INTEGER' }, { name: 'airline_code', type: 'TEXT' }, { name: 'origin_airport', type: 'TEXT' }, { name: 'delay_minutes', type: 'INTEGER' }],
          sampleData: [
            { flight_id: 101, airline_code: 'AA', origin_airport: 'JFK', delay_minutes: 45 },
            { flight_id: 102, airline_code: 'DL', origin_airport: 'LAX', delay_minutes: 10 },
            { flight_id: 103, airline_code: 'UA', origin_airport: 'JFK', delay_minutes: 25 },
            { flight_id: 104, airline_code: 'B6', origin_airport: 'JFK', delay_minutes: 5 },
            { flight_id: 105, airline_code: 'DL', origin_airport: 'JFK', delay_minutes: 80 },
          ],
        },
      ],
      expectedOutput: [
        { flight_id: 105, airline_code: 'DL', origin_airport: 'JFK', delay_minutes: 80 },
        { flight_id: 101, airline_code: 'AA', origin_airport: 'JFK', delay_minutes: 45 },
        { flight_id: 103, airline_code: 'UA', origin_airport: 'JFK', delay_minutes: 25 },
      ],
    },
    {
      problemStatement: 'Find all medical patients admitted with an admission cost greater than $5,000. Return patient_id, diagnosis, and billing_cost, sorted by billing_cost descending.',
      explanation: 'Query clinical_encounters with a WHERE filter on billing_cost > 5000 and sort the results.',
      constraints: 'Filter billing_cost > 5000. Order by billing_cost DESC.',
      tables: [
        {
          name: 'clinical_encounters',
          columns: [{ name: 'encounter_id', type: 'INTEGER' }, { name: 'patient_id', type: 'INTEGER' }, { name: 'diagnosis', type: 'TEXT' }, { name: 'billing_cost', type: 'REAL' }],
          sampleData: [
            { encounter_id: 1, patient_id: 201, diagnosis: 'Cardiology', billing_cost: 8400.0 },
            { encounter_id: 2, patient_id: 202, diagnosis: 'Orthopedics', billing_cost: 3200.0 },
            { encounter_id: 3, patient_id: 203, diagnosis: 'Neurology', billing_cost: 11500.0 },
            { encounter_id: 4, patient_id: 204, diagnosis: 'Dermatology', billing_cost: 1400.0 },
          ],
        },
      ],
      expectedOutput: [
        { patient_id: 203, diagnosis: 'Neurology', billing_cost: 11500.0 },
        { patient_id: 201, diagnosis: 'Cardiology', billing_cost: 8400.0 },
      ],
    },
  ],
  joins: [
    {
      problemStatement: 'Calculate the total streaming revenue for each music artist. Return artist_name and total_payout, sorted by total_payout descending.',
      explanation: 'Join artists with streaming_events on artist_id, group by artist_name, and compute SUM(streams * rate_per_stream).',
      constraints: 'Only include artists with at least one stream. Sort by total_payout DESC.',
      tables: [
        {
          name: 'artists',
          columns: [{ name: 'artist_id', type: 'INTEGER' }, { name: 'artist_name', type: 'TEXT' }, { name: 'rate_per_stream', type: 'REAL' }],
          sampleData: [
            { artist_id: 1, artist_name: 'Luna Ray', rate_per_stream: 0.004 },
            { artist_id: 2, artist_name: 'The Echoes', rate_per_stream: 0.005 },
            { artist_id: 3, artist_name: 'Solaris', rate_per_stream: 0.0035 },
          ],
        },
        {
          name: 'streaming_events',
          columns: [{ name: 'event_id', type: 'INTEGER' }, { name: 'artist_id', type: 'INTEGER' }, { name: 'streams_count', type: 'INTEGER' }],
          sampleData: [
            { event_id: 10, artist_id: 1, streams_count: 50000 },
            { event_id: 11, artist_id: 2, streams_count: 80000 },
            { event_id: 12, artist_id: 1, streams_count: 20000 },
            { event_id: 13, artist_id: 3, streams_count: 10000 },
          ],
        },
      ],
      expectedOutput: [
        { artist_name: 'The Echoes', total_payout: 400.0 },
        { artist_name: 'Luna Ray', total_payout: 280.0 },
        { artist_name: 'Solaris', total_payout: 35.0 },
      ],
    },
  ],
  window: [
    {
      problemStatement: 'Rank the top 2 highest scoring esports players within each tournament team. Return team_name, player_name, and total_points.',
      explanation: 'Use DENSE_RANK() or ROW_NUMBER() partitioned by team_id ordered by total_points descending, then filter rank <= 2.',
      constraints: 'Order by team_name ASC, total_points DESC.',
      tables: [
        {
          name: 'teams',
          columns: [{ name: 'team_id', type: 'INTEGER' }, { name: 'team_name', type: 'TEXT' }],
          sampleData: [
            { team_id: 1, team_name: 'Vortex Gaming' },
            { team_id: 2, team_name: 'Titan Syndicate' },
          ],
        },
        {
          name: 'player_stats',
          columns: [{ name: 'player_id', type: 'INTEGER' }, { name: 'team_id', type: 'INTEGER' }, { name: 'player_name', type: 'TEXT' }, { name: 'total_points', type: 'INTEGER' }],
          sampleData: [
            { player_id: 1, team_id: 1, player_name: 'Zephyr', total_points: 3400 },
            { player_id: 2, team_id: 1, player_name: 'Blaze', total_points: 3100 },
            { player_id: 3, team_id: 1, player_name: 'Frost', total_points: 2700 },
            { player_id: 4, team_id: 2, player_name: 'Shadow', total_points: 4200 },
            { player_id: 5, team_id: 2, player_name: 'Viper', total_points: 3900 },
            { player_id: 6, team_id: 2, player_name: 'Rogue', total_points: 3500 },
          ],
        },
      ],
      expectedOutput: [
        { team_name: 'Titan Syndicate', player_name: 'Shadow', total_points: 4200 },
        { team_name: 'Titan Syndicate', player_name: 'Viper', total_points: 3900 },
        { team_name: 'Vortex Gaming', player_name: 'Zephyr', total_points: 3400 },
        { team_name: 'Vortex Gaming', player_name: 'Blaze', total_points: 3100 },
      ],
    },
  ],
  analytics: [
    {
      problemStatement: 'Identify ride-sharing drivers who have completed at least 2 trips with a surge multiplier >= 1.5 and an average passenger rating >= 4.8. Return driver_name, qualified_trips, and avg_rating.',
      explanation: 'Filter trips by surge >= 1.5, group by driver, and apply HAVING COUNT(*) >= 2 AND AVG(rating) >= 4.8.',
      constraints: 'Round avg_rating to 2 decimal places. Sort by qualified_trips DESC, avg_rating DESC.',
      tables: [
        {
          name: 'drivers',
          columns: [{ name: 'driver_id', type: 'INTEGER' }, { name: 'driver_name', type: 'TEXT' }],
          sampleData: [
            { driver_id: 1, driver_name: 'Marcus Chen' },
            { driver_id: 2, driver_name: 'Elena Rostova' },
            { driver_id: 3, driver_name: 'David Kim' },
          ],
        },
        {
          name: 'trips',
          columns: [{ name: 'trip_id', type: 'INTEGER' }, { name: 'driver_id', type: 'INTEGER' }, { name: 'surge_multiplier', type: 'REAL' }, { name: 'passenger_rating', type: 'REAL' }],
          sampleData: [
            { trip_id: 101, driver_id: 1, surge_multiplier: 1.8, passenger_rating: 5.0 },
            { trip_id: 102, driver_id: 1, surge_multiplier: 2.0, passenger_rating: 4.9 },
            { trip_id: 103, driver_id: 2, surge_multiplier: 1.6, passenger_rating: 4.2 },
            { trip_id: 104, driver_id: 2, surge_multiplier: 1.5, passenger_rating: 4.5 },
            { trip_id: 105, driver_id: 3, surge_multiplier: 1.7, passenger_rating: 5.0 },
            { trip_id: 106, driver_id: 3, surge_multiplier: 1.9, passenger_rating: 4.8 },
            { trip_id: 107, driver_id: 3, surge_multiplier: 1.5, passenger_rating: 4.9 },
          ],
        },
      ],
      expectedOutput: [
        { driver_name: 'David Kim', qualified_trips: 3, avg_rating: 4.9 },
        { driver_name: 'Marcus Chen', qualified_trips: 2, avg_rating: 4.95 },
      ],
    },
  ],
  advanced: [
    {
      problemStatement: 'Calculate month-over-month active SaaS subscriber growth percentage for 2024. Return billing_month, active_subscribers, and mom_growth_pct.',
      explanation: 'Count distinct active subscribers by month, then use LAG() to compute ((current - previous) / previous) * 100.',
      constraints: 'Order chronologically by billing_month ASC. Format growth percentage rounded to 2 decimal places.',
      tables: [
        {
          name: 'subscription_logs',
          columns: [{ name: 'tenant_id', type: 'INTEGER' }, { name: 'billing_month', type: 'TEXT' }],
          sampleData: [
            { tenant_id: 1, billing_month: '2024-01' },
            { tenant_id: 2, billing_month: '2024-01' },
            { tenant_id: 1, billing_month: '2024-02' },
            { tenant_id: 2, billing_month: '2024-02' },
            { tenant_id: 3, billing_month: '2024-02' },
            { tenant_id: 1, billing_month: '2024-03' },
            { tenant_id: 2, billing_month: '2024-03' },
            { tenant_id: 3, billing_month: '2024-03' },
            { tenant_id: 4, billing_month: '2024-03' },
          ],
        },
      ],
      expectedOutput: [
        { billing_month: '2024-01', active_subscribers: 2, mom_growth_pct: null },
        { billing_month: '2024-02', active_subscribers: 3, mom_growth_pct: 50.0 },
        { billing_month: '2024-03', active_subscribers: 4, mom_growth_pct: 33.33 },
      ],
    },
  ],
};

const buildFallbackSession = () => {
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const q1 = { ...pickRandom(FALLBACK_SQL_POOLS.easy) };
  q1.initSql = buildInitSqlFromTables(q1.tables);

  const q2 = { ...pickRandom(FALLBACK_SQL_POOLS.joins) };
  q2.initSql = buildInitSqlFromTables(q2.tables);

  const q3 = { ...pickRandom(FALLBACK_SQL_POOLS.window) };
  q3.initSql = buildInitSqlFromTables(q3.tables);

  const q4 = { ...pickRandom(FALLBACK_SQL_POOLS.analytics) };
  q4.initSql = buildInitSqlFromTables(q4.tables);

  const q5 = { ...pickRandom(FALLBACK_SQL_POOLS.advanced) };
  q5.initSql = buildInitSqlFromTables(q5.tables);

  const fallbackMcqQuestions = [
    { question: 'What does LEFT JOIN return when there is no matching row in the right table?', options: ['NULL for right table columns', 'The row is excluded', 'An error is raised', 'Zero for numeric columns'], correctIndex: 0, explanation: 'LEFT JOIN preserves all rows from the left table and fills right table columns with NULL if no match exists.' },
    { question: 'Which SQL clause is used to filter aggregated results?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], correctIndex: 1, explanation: 'HAVING filters after aggregation (GROUP BY), while WHERE filters individual rows before aggregation.' },
    { question: 'What is the result of NULL = NULL in SQL?', options: ['TRUE', 'FALSE', 'NULL', 'Error'], correctIndex: 2, explanation: 'Any comparison with NULL yields NULL (unknown), not TRUE or FALSE. Use IS NULL to check for NULL.' },
    { question: 'Which window function assigns a sequential integer rank without gaps to each row?', options: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'NTILE()'], correctIndex: 2, explanation: 'DENSE_RANK() assigns consecutive ranks with no gaps when there are ties, unlike RANK() which skips numbers.' },
    { question: 'What is a covering index?', options: ['An index on every column', 'An index that includes all columns needed by a query, avoiding a table lookup', 'An index on the primary key', 'An index used in a JOIN'], correctIndex: 1, explanation: 'A covering index includes all columns needed for a query so the DB engine can answer it from the index alone without reading the table.' },
  ];

  return { sql_questions: [q1, q2, q3, q4, q5], mcq_questions: fallbackMcqQuestions };
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
      const urlParams = new URLSearchParams(window.location.search);
      const isExplicitNewSession = urlParams.get('newSession') === '1';

      // 1. Try to restore saved session if NOT explicitly requested as new
      if (!isExplicitNewSession && typeof restoreSessionState === 'function') {
        const saved = restoreSessionState();
        if (saved?.sessionData?.sql_questions && saved.sessionData.sql_questions.length === 5) {
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
