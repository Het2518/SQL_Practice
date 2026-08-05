/**
 * useInterviewDatabase.js
 *
 * A dedicated, self-contained sql.js (WASM) database hook exclusively for the
 * Interview Arena. It owns its dedicated Worker instance from mount to unmount.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import SqlWorker from '../../../workers/sql.worker.js?worker';

export function useInterviewDatabase() {
  const workerRef = useRef(null);
  const pendingRef = useRef(new Map()); // msgId → { resolve, reject }
  const counterRef = useRef(1);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'ready' | 'error'
  const [dbError, setDbError] = useState(null);

  const initSqlRef = useRef(null);
  const isReadyRef = useRef(false);
  const initPromiseRef = useRef(null);

  // ── Spawn & wire up the worker ──────────────────────────────────────────────
  useEffect(() => {
    const worker = new SqlWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { id, success, data, error, type } = e.data;
      if (type === 'PROGRESS') return;

      const pending = pendingRef.current.get(id);
      if (!pending) return;
      pendingRef.current.delete(id);

      if (success) {
        pending.resolve(data);
      } else {
        pending.reject(new Error(error || 'Worker operation failed'));
      }
    };

    worker.onerror = (err) => {
      console.error('[InterviewDB] Worker error:', err?.message);
      for (const { reject } of pendingRef.current.values()) {
        reject(new Error(err?.message || 'SQL Worker crashed'));
      }
      pendingRef.current.clear();
      isReadyRef.current = false;
      setStatus('error');
      setDbError('SQL Worker error.');
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
      isReadyRef.current = false;
    };
  }, []);

  // ── Low-level message dispatch ──────────────────────────────────────────────
  const sendMessage = useCallback((type, payload, timeoutMs = 25000) => {
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
          reject(new Error('Query execution timed out.'));
        }
      }, timeoutMs);

      pendingRef.current.set(id, {
        resolve: (data) => { clearTimeout(timeoutId); resolve(data); },
        reject: (err)  => { clearTimeout(timeoutId); reject(err); }
      });

      worker.postMessage({ type, payload, id });
    });
  }, []);

  // ── Init DB ─────────────────────────────────────────────────────────────────
  const initDb = useCallback(async (sql) => {
    if (!sql || !sql.trim() || sql.trim() === '-- init') {
      isReadyRef.current = true;
      setStatus('ready');
      return;
    }

    initSqlRef.current = sql;
    setStatus('loading');
    setDbError(null);

    const promise = (async () => {
      try {
        await sendMessage('INIT', { initSql: sql, forceFresh: true }, 30000);
        isReadyRef.current = true;
        setStatus('ready');
      } catch (err) {
        console.error('[InterviewDB] initDb failed:', err.message);
        setStatus('error');
        setDbError(err.message);
        throw err;
      } finally {
        if (initPromiseRef.current === promise) {
          initPromiseRef.current = null;
        }
      }
    })();

    initPromiseRef.current = promise;
    return promise;
  }, [sendMessage]);

  // ── Execute Query ───────────────────────────────────────────────────────────
  const executeQuery = useCallback(async (sql) => {
    if (!sql || !sql.trim()) {
      return { columns: [], rows: [], error: 'Please enter a SQL query.' };
    }

    // 1. Await any active initialization in progress
    if (initPromiseRef.current) {
      try {
        await initPromiseRef.current;
      } catch (err) {
        console.warn('[InterviewDB] In-flight init failed:', err.message);
      }
    }

    // 2. If worker hasn't been initialized yet, run init once
    if (!isReadyRef.current && initSqlRef.current) {
      try {
        await sendMessage('INIT', { initSql: initSqlRef.current, forceFresh: true }, 30000);
        isReadyRef.current = true;
        setStatus('ready');
      } catch (err) {
        console.warn('[InterviewDB] On-demand init failed:', err.message);
      }
    }

    // 3. Execute directly on the worker
    try {
      const result = await sendMessage('EXECUTE', { sql }, 15000);
      return result || { columns: [], rows: [] };
    } catch (err) {
      // If the worker threw because db wasn't initialized, attempt recovery and execute
      if (err.message && err.message.toLowerCase().includes('database not initialized') && initSqlRef.current) {
        try {
          await sendMessage('INIT', { initSql: initSqlRef.current, forceFresh: true }, 30000);
          isReadyRef.current = true;
          setStatus('ready');
          return await sendMessage('EXECUTE', { sql }, 15000);
        } catch (retryErr) {
          return { columns: [], rows: [], error: retryErr.message };
        }
      }
      return { columns: [], rows: [], error: err.message };
    }
  }, [sendMessage]);

  const resetDb = useCallback(async () => {
    if (initSqlRef.current) {
      await initDb(initSqlRef.current);
    }
  }, [initDb]);

  return {
    dbStatus: status,
    dbError,
    dbReady: status === 'ready',
    initDb,
    executeQuery,
    resetDb,
  };
}
