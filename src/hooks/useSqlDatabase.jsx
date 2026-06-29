import { useState, useEffect, useCallback, useRef } from 'react';
import SqlWorker from '../workers/sql.worker.js?worker';

const dbPaths = {
  hospital: '/databases/hospital.sqlite',
  ecommerce: '/databases/ecommerce.sqlite',
  university: '/databases/university.sqlite',
  airlines: '/databases/airlines.sqlite',
  banking: '/databases/banking.sqlite',
  hr: '/databases/hr.sqlite',
  movies: '/databases/movies.sqlite',
  library: '/databases/library.sqlite',
  sports: '/databases/sports.sqlite',
  music: '/databases/music.sqlite'
};

export function useSqlDatabase(dbInput) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const workerRef = useRef(null);
  const currentDbRef = useRef(null);
  const msgIdRef = useRef(1);
  const pendingRequests = useRef(new Map());

  useEffect(() => {
    workerRef.current = new SqlWorker();
    
    workerRef.current.onerror = (err) => {
      console.error("Worker error:", err);
      // Reject any pending requests
      for (const { reject } of pendingRequests.current.values()) {
        reject(new Error(err.message || 'Worker crashed or failed to load.'));
      }
      pendingRequests.current.clear();
      setError(err.message || 'Worker crashed or failed to load.');
      setIsLoading(false);
    };
    
    workerRef.current.onmessage = (e) => {
      const { id, success, data, error } = e.data;
      if (pendingRequests.current.has(id)) {
        const { resolve, reject } = pendingRequests.current.get(id);
        pendingRequests.current.delete(id);
        if (success) {
          resolve(data);
        } else {
          reject(new Error(error));
        }
      }
    };
    
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const sendMessage = useCallback((type, payload) => {
    return new Promise((resolve, reject) => {
      const id = msgIdRef.current++;
      pendingRequests.current.set(id, { resolve, reject });
      workerRef.current.postMessage({ type, payload, id });
    });
  }, []);

  const initDb = useCallback(async input => {
    if (!workerRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      let payload = {};
      if (typeof input === 'string') {
        currentDbRef.current = input;
        // In Vite, absolute path from root works for fetch
        payload = { dbPath: dbPaths[input] };
      } else if (input && input.initSql) {
        currentDbRef.current = input.id;
        payload = { initSql: input.initSql };
      } else {
        throw new Error('Invalid database input');
      }
      
      await sendMessage('INIT', payload);
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to load database: ${err.message}`);
      setIsLoading(false);
    }
  }, [sendMessage]);

  useEffect(() => {
    if (dbInput && workerRef.current) initDb(dbInput);
  }, [dbInput, initDb]);

  const executeQuery = useCallback(async sql => {
    if (!workerRef.current) {
      return { columns: [], rows: [], error: 'Database not loaded yet.' };
    }
    if (!sql.trim()) {
      return { columns: [], rows: [], error: 'Please enter a SQL query.' };
    }
    try {
      return await sendMessage('EXECUTE', { sql });
    } catch (err) {
      return { columns: [], rows: [], error: err.message };
    }
  }, [sendMessage]);

  const runVerification = useCallback(async verificationSQL => {
    return executeQuery(verificationSQL);
  }, [executeQuery]);

  const getExplainPlan = useCallback(async sql => {
    if (!sql.trim()) return null;
    try {
      return await sendMessage('EXPLAIN_PLAN', { sql });
    } catch (err) {
      return { error: err.message };
    }
  }, [sendMessage]);

  const getEdgeCaseResults = useCallback(async (sql, primaryTable) => {
    if (!sql.trim() || !primaryTable) return null;
    try {
      return await sendMessage('TEST_EDGE_CASES', { sql, primaryTable });
    } catch (err) {
      return [{ id: 'error', status: 'error', error: err.message }];
    }
  }, [sendMessage]);

  const resetDb = useCallback(async () => {
    if (currentDbRef.current) {
      await initDb(currentDbRef.current);
    }
  }, [initDb]);

  const getExpectedResultDynamic = useCallback(async (solutionSQL, verificationSQL) => {
    try {
      return await sendMessage('GET_EXPECTED_RESULT', { solutionSQL, verificationSQL });
    } catch (err) {
      return { columns: [], rows: [], error: err.message };
    }
  }, [sendMessage]);

  const validateAnswer = useCallback((userResult, expectedResult, requiresOrder) => {
    if (userResult.error) {
      return {
        isCorrect: false,
        message: `SQL Error: ${userResult.error}`
      };
    }
    if (expectedResult.error) {
      return {
        isCorrect: false,
        message: `System Error: Solution SQL failed to execute. ${expectedResult.error}`
      };
    }
    const expectedColumns = expectedResult.columns;
    const expectedRows = expectedResult.rows;

    // Normalize values for robust comparison
    const normalize = v => {
      if (v === null || v === undefined) return '__NULL__';
      if (typeof v === 'number') return String(Math.round(v * 10000) / 10000);
      return String(v).trim();
    };

    const computeDiff = (expected, user) => {
      const rowToString = row => row.map(normalize).join('|||');
      const expectedMap = new Map();
      const userMap = new Map();

      expected.forEach(row => {
        const key = rowToString(row);
        expectedMap.set(key, (expectedMap.get(key) || 0) + 1);
      });
      user.forEach(row => {
        const key = rowToString(row);
        userMap.set(key, (userMap.get(key) || 0) + 1);
      });

      const missingRows = [];
      const extraRows = [];
      const matchedRows = [];

      expectedMap.forEach((count, key) => {
        const userCount = userMap.get(key) || 0;
        const rowData = key.split('|||').map(v => v === '__NULL__' ? null : v);
        
        // Add to matchedRows
        const matchCount = Math.min(count, userCount);
        for (let i = 0; i < matchCount; i++) matchedRows.push(rowData);
        
        // Add to missingRows
        if (count > userCount) {
          for (let i = 0; i < count - userCount; i++) missingRows.push(rowData);
        }
      });
      
      userMap.forEach((count, key) => {
        const expectedCount = expectedMap.get(key) || 0;
        if (count > expectedCount) {
          const rowData = key.split('|||').map(v => v === '__NULL__' ? null : v);
          for (let i = 0; i < count - expectedCount; i++) extraRows.push(rowData);
        }
      });

      return { missingRows, extraRows, matchedRows, mismatchedRows: [] };
    };

    // Check column count
    if (userResult.columns.length !== expectedColumns.length) {
      return {
        isCorrect: false,
        message: `Expected ${expectedColumns.length} column(s), got ${userResult.columns.length}.`
      };
    }

    // Check row count
    if (userResult.rows.length !== expectedRows.length) {
      return {
        isCorrect: false,
        message: `Expected ${expectedRows.length} row(s), got ${userResult.rows.length}.`
      };
    }

    // Return diff regardless of requiresOrder for educational purposes
    const diff = computeDiff(expectedRows, userResult.rows);
    
    // Order-agnostic comparison (Multiset)
    if (!requiresOrder) {
      if (diff.missingRows.length > 0 || diff.extraRows.length > 0 || diff.mismatchedRows.length > 0) {
        return {
          isCorrect: false,
          message: `Result set does not match. Missing: ${diff.missingRows.length}, Extra: ${diff.extraRows.length}, Mismatched: ${diff.mismatchedRows.length}`,
          diff,
          expectedColumns
        };
      }
    } else {
      // Strict order comparison
      const rowToString = row => row.map(normalize).join('|||');
      const orderMismatches = [];
      const orderMatches = [];

      for (let i = 0; i < expectedRows.length; i++) {
        if (rowToString(userResult.rows[i]) !== rowToString(expectedRows[i])) {
          orderMismatches.push({
            expected: expectedRows[i],
            actual: userResult.rows[i]
          });
        } else {
          orderMatches.push(expectedRows[i]);
        }
      }

      if (orderMismatches.length > 0) {
        return {
          isCorrect: false,
          message: `${orderMismatches.length} row(s) are in the wrong order or have incorrect values. Order matters for this question.`,
          diff: {
            missingRows: [],
            extraRows: [],
            mismatchedRows: orderMismatches,
            matchedRows: orderMatches
          },
          expectedColumns
        };
      }
    }

    return {
      isCorrect: true,
      message: 'Correct! Great work!',
      diff,
      expectedColumns
    };
  }, []);
  return {
    isLoading,
    error,
    executeQuery,
    resetDb,
    validateAnswer,
    runVerification,
    getExpectedResultDynamic,
    getExplainPlan,
    getEdgeCaseResults,
    dbInstance: null
  };
}