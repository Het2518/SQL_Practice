/**
 * useInterviewDatabase.js
 *
 * A DEDICATED, self-contained sql.js (WASM) database hook exclusively for the
 * Interview Arena. It spawns its OWN Worker instance completely separate from
 * the global SqlWorkerManager singleton used by the Practice/Custom pages.
 *
 * Why? The root cause of "Database not initialized" was that SqlWorkerManager
 * is a module-level singleton. All pages share one worker, so whichever page
 * last called INIT wins. The Interview Arena's INIT was being clobbered by
 * navigations or vice-versa. This hook owns its worker from mount to unmount.
 *
 * Lifecycle:
 *  - on mount: spawn worker, load sql-wasm.js
 *  - initDb(sql):  run INIT message, set dbReady = true
 *  - executeQuery(sql): waits for dbReady, then runs EXECUTE
 *  - on unmount: terminate worker
 */
import { useState, useEffect, useRef, useCallback } from 'react';
// Import the worker using Vite's ?worker syntax so it's correctly bundled
import SqlWorker from '../../../workers/sql.worker.js?worker';

const BASE_URL = import.meta.env.BASE_URL || '/';

// ─── Small helper: create a new dedicated worker instance ────────────────────
function createSqlWorker() {
  return new SqlWorker();
}

// ─── State machine: 'idle' | 'loading' | 'ready' | 'error' ──────────────────
export function useInterviewDatabase() {
  const workerRef = useRef(null);
  const pendingRef = useRef(new Map()); // msgId → { resolve, reject }
  const counterRef = useRef(1);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
  const [dbError, setDbError] = useState(null);
  const initSqlRef = useRef(null); // keep for recovery

  // ── Spawn & wire up the worker ──────────────────────────────────────────────
  useEffect(() => {
    const worker = createSqlWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { id, success, data, error, type, payload } = e.data;

      // Progress messages have no pending promise entry
      if (type === 'PROGRESS') return;

      const pending = pendingRef.current.get(id);
      if (!pending) return;
      pendingRef.current.delete(id);

      if (success) {
        pending.resolve(data);
      } else {
        pending.reject(new Error(error || 'Unknown worker error'));
      }
    };

    worker.onerror = (err) => {
      console.error('[InterviewDB] Worker crashed:', err.message);
      // Reject all pending
      for (const { reject } of pendingRef.current.values()) {
        reject(new Error('SQL Worker crashed. Please refresh the page.'));
      }
      pendingRef.current.clear();
      setStatus('error');
      setDbError('SQL Worker crashed unexpectedly.');
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []); // run once on mount

  // ── Low-level message dispatch ──────────────────────────────────────────────
  const sendMessage = useCallback((type, payload, timeoutMs = 20000) => {
    return new Promise((resolve, reject) => {
      const worker = workerRef.current;
      if (!worker) {
        reject(new Error('Interview SQL Worker not available.'));
        return;
      }

      const id = counterRef.current++;
      const timeoutId = setTimeout(() => {
        if (pendingRef.current.has(id)) {
          pendingRef.current.delete(id);
          reject(new Error('Query timed out after 20 seconds.'));
        }
      }, timeoutMs);

      pendingRef.current.set(id, {
        resolve: (data) => { clearTimeout(timeoutId); resolve(data); },
        reject: (err)  => { clearTimeout(timeoutId); reject(err); }
      });

      worker.postMessage({ type, payload, id });
    });
  }, []);

  // ── Public API ──────────────────────────────────────────────────────────────

  const initPromiseRef = useRef(null); // in-flight init promise to await

  /**
   * Initialize the in-memory SQLite database with a SQL script.
   * Strips markdown fences, then runs INIT message on worker.
   * @param {string} sql - CREATE TABLE + INSERT INTO statements
   * @returns {Promise<void>}
   */
  const initDb = useCallback(async (sql) => {
    if (!sql || !sql.trim() || sql.trim() === '-- init') {
      console.warn('[InterviewDB] initDb called with empty/placeholder SQL. Skipping.');
      setStatus('ready');
      return;
    }

    setStatus('loading');
    setDbError(null);
    initSqlRef.current = sql;

    const initPromise = (async () => {
      try {
        await sendMessage('INIT', { initSql: sql, forceFresh: true }, 30000);
        setStatus('ready');
      } catch (err) {
        console.error('[InterviewDB] initDb failed:', err.message);
        setStatus('error');
        setDbError(err.message);
        throw err;
      } finally {
        if (initPromiseRef.current === initPromise) {
          initPromiseRef.current = null;
        }
      }
    })();

    initPromiseRef.current = initPromise;
    return initPromise;
  }, [sendMessage]);

  /**
   * Execute a SQL query against the interview database.
   * Automatically awaits in-flight database initialization if one is currently in progress.
   * Returns { columns, rows, error?, execTimeMs? }
   * @param {string} sql
   */
  const executeQuery = useCallback(async (sql) => {
    if (!sql || !sql.trim()) {
      return { columns: [], rows: [], error: 'Please enter a SQL query.' };
    }

    // 1. If currently initializing, smoothly await initialization to finish
    if (initPromiseRef.current) {
      try {
        await initPromiseRef.current;
      } catch (initErr) {
        return { columns: [], rows: [], error: `Database initialization failed: ${initErr.message}` };
      }
    }

    // 2. If status is still not ready, attempt immediate recovery init
    if (status !== 'ready') {
      if (initSqlRef.current) {
        console.warn('[InterviewDB] DB not ready on executeQuery, running recovery init...');
        try {
          await initDb(initSqlRef.current);
        } catch {
          return { columns: [], rows: [], error: 'Database is still initializing. Please try again.' };
        }
      }
    }

    try {
      const result = await sendMessage('EXECUTE', { sql }, 15000);
      return result;
    } catch (err) {
      // If the worker lost the db, try recovery once
      if (err.message && err.message.toLowerCase().includes('database not initialized') && initSqlRef.current) {
        console.warn('[InterviewDB] Worker lost db, attempting hot recovery...');
        try {
          await sendMessage('INIT', { initSql: initSqlRef.current, forceFresh: true }, 30000);
          setStatus('ready');
          const retry = await sendMessage('EXECUTE', { sql }, 15000);
          return retry;
        } catch (recErr) {
          return { columns: [], rows: [], error: recErr.message };
        }
      }
      return { columns: [], rows: [], error: err.message };
    }
  }, [sendMessage, status, initDb]);

  /**
   * Reset the database back to its initial state (re-runs initSql).
   */
  const resetDb = useCallback(async () => {
    if (initSqlRef.current) {
      await initDb(initSqlRef.current);
    }
  }, [initDb]);

  return {
    /** 'idle' | 'loading' | 'ready' | 'error' */
    dbStatus: status,
    dbError,
    dbReady: status === 'ready',
    initDb,
    executeQuery,
    resetDb,
  };
}
