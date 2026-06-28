import { useState, useEffect, useCallback, useRef } from 'react';
import { computeDiff } from '../utils/sqlAnalysis';

// Declare sql.js types

// Lazy-load sql.js once
let sqlJsPromise = null;
function loadSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = new Promise((resolve, reject) => {
      // Load sql.js from CDN (simplest approach for Vite)
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js';
      script.onload = () => {
        window.initSqlJs({
          locateFile: () => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.wasm'
        }).then(resolve).catch(reject);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return sqlJsPromise;
}

// Import all SQL seed files as raw strings
const seedModules = {
  hospital: () => import('../data/databases/hospital.sql?raw').then(m => m.default),
  ecommerce: () => import('../data/databases/ecommerce.sql?raw').then(m => m.default),
  university: () => import('../data/databases/university.sql?raw').then(m => m.default),
  airlines: () => import('../data/databases/airlines.sql?raw').then(m => m.default),
  banking: () => import('../data/databases/banking.sql?raw').then(m => m.default),
  hr: () => import('../data/databases/hr.sql?raw').then(m => m.default),
  movies: () => import('../data/databases/movies.sql?raw').then(m => m.default),
  library: () => import('../data/databases/library.sql?raw').then(m => m.default),
  sports: () => import('../data/databases/sports.sql?raw').then(m => m.default),
  music: () => import('../data/databases/music.sql?raw').then(m => m.default)
};
export function useSqlDatabase(dbInput) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const dbRef = useRef(null);
  const sqlJsRef = useRef(null);
  const currentDbRef = useRef(null);
  const initDb = useCallback(async input => {
    setIsLoading(true);
    setError(null);
    try {
      // Load sql.js if not already loaded
      if (!sqlJsRef.current) {
        sqlJsRef.current = await loadSqlJs();
      }

      // Close existing DB
      if (dbRef.current) {
        dbRef.current.close();
        dbRef.current = null;
      }

      let seedSql = '';
      let dbName = '';
      if (typeof input === 'string') {
        seedSql = await seedModules[input]();
        dbName = input;
      } else if (input && input.initSql) {
        seedSql = input.initSql;
        dbName = input.id;
      } else {
        throw new Error('Invalid database input');
      }

      // Create new DB and run seed
      const db = new sqlJsRef.current.Database();
      db.run(seedSql);
      dbRef.current = db;
      currentDbRef.current = dbName;
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to load database: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    if (dbInput) initDb(dbInput);
  }, [dbInput, initDb]);
  const executeQuery = useCallback(sql => {
    if (!dbRef.current) {
      return {
        columns: [],
        rows: [],
        error: 'Database not loaded yet.'
      };
    }
    if (!sql.trim()) {
      return {
        columns: [],
        rows: [],
        error: 'Please enter a SQL query.'
      };
    }
    try {
      const start = performance.now();
      const results = dbRef.current.exec(sql);
      const end = performance.now();
      const execTimeMs = end - start;
      if (results.length === 0) {
        // DML statement (no rows returned)
        return {
          columns: [],
          rows: [],
          affectedRows: dbRef.current.getRowsModified(),
          execTimeMs
        };
      }
      const {
        columns,
        values
      } = results[results.length - 1];
      return {
        columns,
        rows: values,
        execTimeMs
      };
    } catch (err) {
      return {
        columns: [],
        rows: [],
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }, []);
  const runVerification = useCallback(verificationSQL => {
    return executeQuery(verificationSQL);
  }, [executeQuery]);

  const getExplainPlan = useCallback(sql => {
    if (!sql.trim()) return null;
    try {
      // EXPLAIN QUERY PLAN returns rows with id, parent, notused, detail (in SQLite)
      const results = dbRef.current.exec(`EXPLAIN QUERY PLAN ${sql}`);
      if (results.length > 0) {
        return {
          columns: results[0].columns,
          rows: results[0].values
        };
      }
      return { columns: [], rows: [] };
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) };
    }
  }, []);
  const resetDb = useCallback(async () => {
    if (currentDbRef.current) {
      await initDb(currentDbRef.current);
    }
  }, [initDb]);
  const getExpectedResultDynamic = useCallback((solutionSQL, verificationSQL) => {
    if (!dbRef.current || !sqlJsRef.current) {
      return {
        columns: [],
        rows: [],
        error: 'Database not loaded.'
      };
    }
    try {
      const dbData = dbRef.current.export();
      const cloneDb = new sqlJsRef.current.Database(dbData);
      let finalResult;
      const solResults = cloneDb.exec(solutionSQL);
      if (verificationSQL) {
        const verResults = cloneDb.exec(verificationSQL);
        if (verResults.length === 0) {
          finalResult = {
            columns: [],
            rows: []
          };
        } else {
          const {
            columns,
            values
          } = verResults[verResults.length - 1];
          finalResult = {
            columns,
            rows: values
          };
        }
      } else {
        if (solResults.length === 0) {
          finalResult = {
            columns: [],
            rows: []
          };
        } else {
          const {
            columns,
            values
          } = solResults[solResults.length - 1];
          finalResult = {
            columns,
            rows: values
          };
        }
      }
      cloneDb.close();
      return finalResult;
    } catch (err) {
      return {
        columns: [],
        rows: [],
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }, []);
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
      const mismatchedRows = [];
      for (let i = 0; i < expectedRows.length; i++) {
        if (rowToString(userResult.rows[i]) !== rowToString(expectedRows[i])) {
          mismatchedRows.push(i);
        }
      }
      if (mismatchedRows.length > 0) {
        return {
          isCorrect: false,
          message: `${mismatchedRows.length} row(s) don't match the expected result. Order matters for this question.`,
          mismatchedRows,
          diff,
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
    dbInstance: dbRef.current
  };
}