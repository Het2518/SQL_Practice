import SqlWorker from './sql.worker.js?worker';

class SqlWorkerManager {
  constructor() {
    this.worker = null;
    this.msgIdCounter = 1;
    this.pendingRequests = new Map();
    this.isRespawning = false;
    this.lastDbPayload = null; // Remember the last loaded DB to restore state
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
      
      // Keep track of the INIT payload so we can recover it if the worker crashes
      if (type === 'INIT') {
        this.lastDbPayload = payload;
      }
      
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
    });
  }
}

// Singleton instance
export const sqlWorkerManager = new SqlWorkerManager();
