let db = null;
let SQL = null;
let currentSchema = null; // Caches GET_SCHEMA results to avoid repetitive O(N) COUNT(*) scans

// Beast Optimization: LRU Cache for query results
const queryCache = new Map();
const MAX_CACHE_SIZE = 50;

function normalizeSql(sql) {
  return typeof sql === 'string' ? sql.trim().toLowerCase() : String(sql);
}

function getCachedResult(sql) {
  const key = normalizeSql(sql);
  if (queryCache.has(key)) {
    const result = queryCache.get(key);
    queryCache.delete(key);
    queryCache.set(key, result);
    return result;
  }
  return null;
}

function setCachedResult(sql, result) {
  const key = normalizeSql(sql);
  if (queryCache.size >= MAX_CACHE_SIZE) {
    const firstKey = queryCache.keys().next().value;
    queryCache.delete(firstKey);
  }
  queryCache.set(key, result);
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

function getColumnsFromEmptyQuery(db, sql) {
  try {
    const stmt = db.prepare(sql);
    const cols = stmt.getColumnNames();
    stmt.free();
    return cols;
  } catch (e) {
    return [];
  }
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
      currentSchema = null;
      
      if (payload.dbPath) {
        // Fetch from origin
        const response = await fetch(payload.dbPath);
        if (!response.ok) throw new Error(`Failed to fetch database file`);
        
        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        
        let loaded = 0;
        const reader = response.body.getReader();
        const chunks = [];
        
        while(true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          if (total) {
            self.postMessage({ type: 'PROGRESS', id, payload: { loaded, total, percent: Math.round((loaded / total) * 100) } });
          }
        }
        
        const buffer = new Uint8Array(loaded);
        let offset = 0;
        for (const chunk of chunks) {
          buffer.set(chunk, offset);
          offset += chunk.length;
        }
        
        db = new sqlJS.Database(buffer);
      } else if (payload.initSql) {
        db = new sqlJS.Database();
        db.run(payload.initSql);
      } else if (payload.binaryData) {
        // Direct binary upload (e.g. user-uploaded .sqlite file)
        db = new sqlJS.Database(new Uint8Array(payload.binaryData));
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
        currentSchema = null;
      }
      
      if (results.length === 0) {
         const isDML = /^\s*(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE)/i.test(payload.sql);
         const cols = !isDML ? getColumnsFromEmptyQuery(db, payload.sql) : [];
         const data = { 
           columns: cols, 
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
         
         if (payload.sql.trim().toUpperCase().startsWith('SELECT')) {
           try {
             const explainRes = db.exec(`EXPLAIN QUERY PLAN ${payload.sql}`);
             if (explainRes.length > 0) {
               data.explainPlan = explainRes[explainRes.length - 1].values;
             }
           } catch(e) {}
         }
         
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
           if (verResults.length === 0) finalResult = { columns: getColumnsFromEmptyQuery(db, payload.verificationSQL), rows: [] };
           else {
             const { columns, values } = verResults[verResults.length - 1];
             finalResult = { columns, rows: values.slice(0, 1000) };
           }
         } else {
           if (solResults.length === 0) finalResult = { columns: getColumnsFromEmptyQuery(db, payload.solutionSQL), rows: [] };
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
    
    else if (type === 'VERIFY_ANSWER') {
      if (!db) throw new Error("Database not initialized");
      
      let expectedResult;
      let userResult;
      
      // 1. Get expected result
      db.run('SAVEPOINT check_solution');
      try {
        const solResults = db.exec(payload.solutionSQL);
        if (payload.verificationSQL) {
          const verResults = db.exec(payload.verificationSQL);
          if (verResults.length === 0) {
             expectedResult = { columns: getColumnsFromEmptyQuery(db, payload.verificationSQL), rows: [] };
          } else {
            const { columns, values } = verResults[verResults.length - 1];
            expectedResult = { columns, rows: values.slice(0, 5000) };
          }
        } else {
          if (solResults.length === 0) {
             expectedResult = { columns: getColumnsFromEmptyQuery(db, payload.solutionSQL), rows: [] };
          } else {
            const { columns, values } = solResults[solResults.length - 1];
            expectedResult = { columns, rows: values.slice(0, 5000) };
          }
        }
      } catch (err) {
        self.postMessage({ id, success: true, data: { isCorrect: false, message: `System Error: Solution SQL failed to execute. ${err.message}` }});
        return;
      } finally {
        try { db.run('ROLLBACK TO check_solution'); } catch(e) {}
      }
      
      // 2. Get user result
      db.run('SAVEPOINT check_user');
      try {
        const usrResults = db.exec(payload.userSQL);
        if (payload.verificationSQL) {
          const verResults = db.exec(payload.verificationSQL);
          if (verResults.length === 0) {
             userResult = { columns: getColumnsFromEmptyQuery(db, payload.verificationSQL), rows: [] };
          } else {
             const { columns, values } = verResults[verResults.length - 1];
             userResult = { columns, rows: values.slice(0, 5000) };
          }
        } else {
          if (usrResults.length === 0) {
             userResult = { columns: getColumnsFromEmptyQuery(db, payload.userSQL), rows: [] };
          } else {
             const { columns, values } = usrResults[usrResults.length - 1];
             userResult = { columns, rows: values.slice(0, 5000) };
          }
        }
      } catch (err) {
         self.postMessage({ id, success: true, data: { isCorrect: false, message: `SQL Error: ${err.message}` }});
         return;
      } finally {
         try { db.run('ROLLBACK TO check_user'); } catch(e) {}
      }
      
      // 3. Diffing logic
      const expectedColumns = expectedResult.columns;
      const expectedRows = expectedResult.rows;
      
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
          const matchCount = Math.min(count, userCount);
          for (let i = 0; i < matchCount; i++) matchedRows.push(rowData);
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

      if (userResult.columns.length !== expectedColumns.length) {
        self.postMessage({ id, success: true, data: { isCorrect: false, message: `Expected ${expectedColumns.length} column(s), got ${userResult.columns.length}.`, userResult }});
        return;
      }
      if (userResult.rows.length !== expectedRows.length) {
        self.postMessage({ id, success: true, data: { isCorrect: false, message: `Expected ${expectedRows.length} row(s), got ${userResult.rows.length}.`, userResult }});
        return;
      }

      const diff = computeDiff(expectedRows, userResult.rows);
      
      if (!payload.requiresOrder) {
        if (diff.missingRows.length > 0 || diff.extraRows.length > 0 || diff.mismatchedRows.length > 0) {
          self.postMessage({ id, success: true, data: { isCorrect: false, message: `Result set does not match. Missing: ${diff.missingRows.length}, Extra: ${diff.extraRows.length}, Mismatched: ${diff.mismatchedRows.length}`, diff, expectedColumns, userResult }});
          return;
        }
      } else {
        const rowToString = row => row.map(normalize).join('|||');
        const orderMismatches = [];
        const orderMatches = [];

        for (let i = 0; i < expectedRows.length; i++) {
          if (rowToString(userResult.rows[i]) !== rowToString(expectedRows[i])) {
            orderMismatches.push({ expected: expectedRows[i], actual: userResult.rows[i] });
          } else {
            orderMatches.push(expectedRows[i]);
          }
        }
        if (orderMismatches.length > 0) {
           self.postMessage({ id, success: true, data: { isCorrect: false, message: `${orderMismatches.length} row(s) are in the wrong order or have incorrect values. Order matters for this question.`, diff: { missingRows: [], extraRows: [], mismatchedRows: orderMismatches, matchedRows: orderMatches }, expectedColumns, userResult }});
           return;
        }
      }

      self.postMessage({ id, success: true, data: { isCorrect: true, message: 'Correct! Great work!', diff, expectedColumns, userResult }});
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

    else if (type === 'GET_SCHEMA') {
      if (!db) throw new Error("Database not initialized");
      
      if (currentSchema) {
        self.postMessage({ id, success: true, data: { tables: currentSchema } });
        return;
      }

      // Get all user-created tables (exclude sqlite internal ones)
      const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
      const tableNames = tablesResult.length > 0 ? tablesResult[0].values.map(r => r[0]) : [];
      const schema = [];
      for (const tableName of tableNames) {
        const colResult = db.exec(`PRAGMA table_info("${tableName}")`);
        const columns = colResult.length > 0
          ? colResult[0].values.map(row => ({
              name: row[1],
              type: row[2] || 'TEXT',
              pk: row[5] === 1,
              notNull: row[3] === 1,
            }))
          : [];
        // Get row count for display
        let rowCount = 0;
        try {
          const countResult = db.exec(`SELECT COUNT(*) FROM "${tableName}"`);
          rowCount = countResult.length > 0 ? countResult[0].values[0][0] : 0;
        } catch {}
        schema.push({ name: tableName, columns, rowCount });
      }
      currentSchema = schema;
      self.postMessage({ id, success: true, data: { tables: schema } });
    }
  } catch (err) {
    self.postMessage({ id, success: false, error: err.message });
  }
};
