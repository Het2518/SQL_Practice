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

let sharedWorker = null;
let msgIdCounter = 1;
const sharedPendingRequests = new Map();

function initSharedWorker() {
  if (sharedWorker) return;
  sharedWorker = new SqlWorker();
  
  sharedWorker.onerror = (err) => {
    console.error("Worker error:", err);
    for (const { reject } of sharedPendingRequests.values()) {
      reject(new Error(err.message || 'Worker crashed or failed to load.'));
    }
    sharedPendingRequests.clear();
  };
  
  sharedWorker.onmessage = (e) => {
    const { id, success, data, error } = e.data;
    if (sharedPendingRequests.has(id)) {
      const { resolve, reject } = sharedPendingRequests.get(id);
      sharedPendingRequests.delete(id);
      if (success) {
        resolve(data);
      } else {
        reject(new Error(error));
      }
    }
  };
}

export function useSqlDatabase(dbInput) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentDbRef = useRef(null);

  useEffect(() => {
    initSharedWorker();
  }, []);

  const sendMessage = useCallback((type, payload) => {
    return new Promise((resolve, reject) => {
      initSharedWorker();
      const id = msgIdCounter++;
      sharedPendingRequests.set(id, { resolve, reject });
      sharedWorker.postMessage({ type, payload, id });
    });
  }, []);

  const initDb = useCallback(async input => {
    setIsLoading(true);
    setError(null);
    try {
      let payload = {};
      if (typeof input === 'string') {
        currentDbRef.current = input;
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
    if (dbInput) initDb(dbInput);
  }, [dbInput, initDb]);

  const executeQuery = useCallback(async sql => {
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

  const validateAnswer = useCallback(async (userSQL, solutionSQL, verificationSQL, requiresOrder) => {
    try {
      return await sendMessage('VERIFY_ANSWER', { userSQL, solutionSQL, verificationSQL, requiresOrder });
    } catch (err) {
      return {
        isCorrect: false,
        message: err.message
      };
    }
  }, [sendMessage]);
  return {
    isLoading,
    error,
    executeQuery,
    resetDb,
    validateAnswer,
    runVerification,
    getExpectedResultDynamic,
    getExplainPlan,

    dbInstance: null
  };
}