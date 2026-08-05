import SqlWorker from './sql.worker.js?worker';

// Bump this version when server-side database files (.sqlite) are updated to invalidate client caches
const CACHE_VERSION = 2;
const DB_NAME = `DataDesk_SQLite_Backup_v${CACHE_VERSION}`;
const STORE_NAME = 'db_backups';

function openIDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveToIDB(key, buffer) {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(buffer, key);
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e.target.error);
    });
  } catch(e) {
    console.error("IndexedDB Save Error:", e);
  }
}

async function loadFromIDB(key) {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch(e) { 
    return null; 
  }
}

class SqlWorkerManager {
  constructor() {
    this.worker = null;
    this.msgIdCounter = 1;
    this.pendingRequests = new Map();
    this.isRespawning = false;
    this.lastDbPayload = null; // Remember the last loaded DB to restore state
    this.currentDbKey = null;
  }

  init() {
    if (this.worker && !this.isRespawning) return;
    
    this.worker = new SqlWorker();
    
    this.worker.onerror = async (err) => {
      console.error("[DataDesk] SQL Worker crashed!", err);
      
      // Reject all pending requests
      for (const { reject } of this.pendingRequests.values()) {
        reject(new Error(err.message || 'SQL Worker crashed (likely Out Of Memory). Respawning...'));
      }
      this.pendingRequests.clear();
      
      // Attempt recovery
      await this.respawn();
    };
    
    this.worker.onmessage = (e) => {
      const { id, success, data, error, type, payload } = e.data;
      
      if (type === 'PROGRESS') {
        window.dispatchEvent(new CustomEvent('sql-worker-progress', { detail: payload }));
        return;
      }

      if (this.pendingRequests.has(id)) {
        const { resolve, reject } = this.pendingRequests.get(id);
        this.pendingRequests.delete(id);
        if (success) {
          if (data && data.exportedDb) {
            this.lastDbPayload = { binaryData: data.exportedDb };
            if (this.currentDbKey) {
              saveToIDB(this.currentDbKey, data.exportedDb).catch(e => console.error(e));
            }
          }
          resolve(data);
        } else {
          reject(new Error(error));
        }
      }
    };
    
    this.isRespawning = false;
  }

  async respawn() {
    if (this.isRespawning) return;
    this.isRespawning = true;
    console.warn("[DataDesk] Respawning SQL Worker...");
    
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.init();
    
    // If we had a database loaded, reload it automatically
    if (this.lastDbPayload) {
      try {
        console.warn("[DataDesk] Restoring database state after crash...");
        await this.sendMessage('INIT', this.lastDbPayload);
        console.info("[DataDesk] Worker recovered successfully.");
      } catch (err) {
        console.error("[DataDesk] Failed to restore database state after crash", err);
      }
    }
  }

  sendMessage(type, payload) {
    return new Promise((resolve, reject) => {
      this.init();
      
      if (type === 'INIT') {
        const dbKey = payload.dbKey || payload.dbPath || (payload.initSql ? 'custom_sql' : 'custom_binary');
        this.currentDbKey = dbKey;
        this.lastDbPayload = payload;

        // Automatically attempt to restore from IndexedDB if we are loading fresh
        if (!payload.binaryData && !payload.forceFresh) {
          loadFromIDB(dbKey).then(backup => {
            if (backup) {
              console.warn(`[DataDesk] Restored database '${dbKey}' from IndexedDB backup!`);
              this.lastDbPayload = { binaryData: backup };
              this.currentDbKey = dbKey;
              this._dispatchMessage(type, { binaryData: backup }, resolve, reject);
            } else {
              this._dispatchMessage(type, payload, resolve, reject);
            }
          }).catch(() => {
            this._dispatchMessage(type, payload, resolve, reject);
          });
          return;
        }
      }
      
      this._dispatchMessage(type, payload, resolve, reject);
    });
  }

  _dispatchMessage(type, payload, resolve, reject) {
    const id = this.msgIdCounter++;
    this.pendingRequests.set(id, { resolve, reject });
      
      // Add a safety timeout for infinite loops (15 seconds)
      const timeoutId = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Query timed out after 15 seconds. The worker may be stuck in an infinite loop.'));
          // Force respawn the worker because it's probably stuck
          this.respawn();
        }
      }, 15000);
      
      // Override resolve/reject to clear the timeout
      const originalResolve = resolve;
      const originalReject = reject;
      
      this.pendingRequests.set(id, {
        resolve: (data) => { clearTimeout(timeoutId); originalResolve(data); },
        reject: (err) => { clearTimeout(timeoutId); originalReject(err); }
      });

      this.worker.postMessage({ type, payload, id });
  }
}

// Singleton instance
export const sqlWorkerManager = new SqlWorkerManager();
