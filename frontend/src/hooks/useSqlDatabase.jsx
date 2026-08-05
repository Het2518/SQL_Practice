import { useState, useEffect, useCallback, useRef } from 'react';
import { sqlWorkerManager } from '../workers/SqlWorkerManager';

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
  const [downloadProgress, setDownloadProgress] = useState(null);
  const currentDbRef = useRef(null);

  useEffect(() => {
    sqlWorkerManager.init();
    
    const handleProgress = (e) => {
      setDownloadProgress(e.detail);
    };
    window.addEventListener('sql-worker-progress', handleProgress);

    return () => {
      window.removeEventListener('sql-worker-progress', handleProgress);
    };
  }, []);

  const sendMessage = useCallback((type, payload) => {
    return sqlWorkerManager.sendMessage(type, payload);
  }, []);

  const initDb = useCallback(async input => {
    setIsLoading(true);
    setError(null);
    try {
      let payload = {};
      if (typeof input === 'string') {
        if (dbPaths[input]) {
          currentDbRef.current = input;
          payload = { dbPath: dbPaths[input] };
        } else if (input.startsWith('interview_') || input === 'custom_sql') {
           // We cannot re-initialize without the actual SQL string
           throw new Error('Cannot reset a custom database without its initialization string.');
        } else if (input === '__custom__') {
           throw new Error('Cannot reset a custom binary database without the file.');
        } else {
           throw new Error('Invalid database input');
        }
      } else if (input && input.initSql) {
        currentDbRef.current = input.id || 'custom_sql';
        payload = { initSql: input.initSql };
      } else {
        throw new Error('Invalid database input');
      }
      
      setDownloadProgress({ loaded: 0, total: 1, percent: 0 });
      await sendMessage('INIT', payload);
      setDownloadProgress(null);
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to load database: ${err.message}`);
      setDownloadProgress(null);
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
      const result = await sendMessage('EXECUTE', { sql });
      return result;
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

  const initWithBinary = useCallback(async (uint8Array) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendMessage('INIT', { binaryData: uint8Array.buffer });
      currentDbRef.current = '__custom__';
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to load database: ${err.message}`);
      setIsLoading(false);
      throw err;
    }
  }, [sendMessage]);

  const initWithSql = useCallback(async (initSql, options = {}) => {
    const { dbKey = 'custom_sql', forceFresh = false } = options;
    setIsLoading(true);
    setError(null);
    try {
      await sendMessage('INIT', { initSql, dbKey, forceFresh });
      currentDbRef.current = dbKey;
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to build database from SQL: ${err.message}`);
      setIsLoading(false);
      throw err;
    }
  }, [sendMessage]);

  const getSchema = useCallback(async () => {
    try {
      return await sendMessage('GET_SCHEMA', {});
    } catch (err) {
      return { tables: [] };
    }
  }, [sendMessage]);

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
    initWithBinary,
    initWithSql,
    getSchema,
    validateAnswer,
    runVerification,
    getExpectedResultDynamic,
    getExplainPlan,
    downloadProgress,
    dbInstance: null
  };
}