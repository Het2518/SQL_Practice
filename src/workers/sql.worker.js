let db = null;
let SQL = null;

// Beast Optimization: LRU Cache for query results
const queryCache = new Map();
const MAX_CACHE_SIZE = 50;

function getCachedResult(sql) {
  if (queryCache.has(sql)) {
    const result = queryCache.get(sql);
    queryCache.delete(sql);
    queryCache.set(sql, result);
    return result;
  }
  return null;
}

function setCachedResult(sql, result) {
  if (queryCache.size >= MAX_CACHE_SIZE) {
    const firstKey = queryCache.keys().next().value;
    queryCache.delete(firstKey);
  }
  queryCache.set(sql, result);
}

async function loadSqlJs() {
  if (SQL) return SQL;
  
  try {
    importScripts('/sql-wasm.js');
  } catch (e) {
    // If we're in a module worker in Vite dev server, importScripts fails.
    const res = await fetch('/sql-wasm.js');
    let code = await res.text();
    code += '\nreturn initSqlJs;';
    self.initSqlJs = (new Function(code))();
  }

  SQL = await self.initSqlJs({
    locateFile: file => `/${file}`
  });
  return SQL;
}

self.onmessage = async (e) => {
  const { type, payload, id } = e.data;
  
  try {
    if (type === 'INIT') {
      const sqlJS = await loadSqlJs();
      if (db) {
        db.close();
        db = null;
      }
      queryCache.clear();
      
      if (payload.dbPath) {
        // Fetch from origin
        const response = await fetch(payload.dbPath);
        if (!response.ok) throw new Error(`Failed to fetch database file`);
        const buffer = await response.arrayBuffer();
        db = new sqlJS.Database(new Uint8Array(buffer));
      } else if (payload.initSql) {
        db = new sqlJS.Database();
        db.run(payload.initSql);
      }
      self.postMessage({ id, success: true });
    }
    
    else if (type === 'EXECUTE') {
      if (!db) throw new Error("Database not initialized");
      
      const isDML = /^\s*(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE)/i.test(payload.sql);
      
      if (!isDML) {
        const cached = getCachedResult(payload.sql);
        if (cached) {
          self.postMessage({ id, success: true, data: { ...cached, execTimeMs: 0, cached: true } });
          return;
        }
      }

      const start = performance.now();
      const results = db.exec(payload.sql);
      const end = performance.now();
      const execTimeMs = end - start;
      
      if (isDML) {
        queryCache.clear();
      }
      
      if (results.length === 0) {
         const isDML = /^\s*(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE)/i.test(payload.sql);
         const data = { 
           columns: [], 
           rows: [], 
           affectedRows: isDML ? db.getRowsModified() : 0, 
           execTimeMs, 
           isDML 
         };
         self.postMessage({ id, success: true, data });
      } else {
         const { columns, values } = results[results.length - 1];
         // Limit returned rows for safety
         const limitedValues = values.slice(0, 1000);
         const data = { 
           columns, 
           rows: limitedValues, 
           execTimeMs, 
           totalRows: values.length 
         };
         
         if (!isDML) setCachedResult(payload.sql, data);
         
         self.postMessage({ id, success: true, data });
      }
    }
    
    else if (type === 'GET_EXPECTED_RESULT') {
       if (!db) throw new Error("Database not initialized");
       db.run('SAVEPOINT check_solution');
       try {
         let finalResult;
         const solResults = db.exec(payload.solutionSQL);
         if (payload.verificationSQL) {
           const verResults = db.exec(payload.verificationSQL);
           if (verResults.length === 0) finalResult = { columns: [], rows: [] };
           else {
             const { columns, values } = verResults[verResults.length - 1];
             finalResult = { columns, rows: values.slice(0, 1000) };
           }
         } else {
           if (solResults.length === 0) finalResult = { columns: [], rows: [] };
           else {
             const { columns, values } = solResults[solResults.length - 1];
             finalResult = { columns, rows: values.slice(0, 1000) };
           }
         }
         self.postMessage({ id, success: true, data: finalResult });
       } finally {
         try {
           db.run('ROLLBACK TO check_solution');
         } catch(e) {}
       }
    }
    
    else if (type === 'EXPLAIN_PLAN') {
      if (!db) throw new Error("Database not initialized");
      const results = db.exec(`EXPLAIN QUERY PLAN ${payload.sql}`);
      if (results.length > 0) {
        self.postMessage({ id, success: true, data: { columns: results[0].columns, rows: results[0].values }});
      } else {
        self.postMessage({ id, success: true, data: { columns: [], rows: [] }});
      }
    }

    
  } catch (err) {
    self.postMessage({ id, success: false, error: err.message });
  }
};
