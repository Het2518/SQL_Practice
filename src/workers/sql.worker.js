let db = null;
let SQL = null;

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
      const start = performance.now();
      const results = db.exec(payload.sql);
      const end = performance.now();
      const execTimeMs = end - start;
      
      if (results.length === 0) {
         const isDML = /^\s*(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|REPLACE)/i.test(payload.sql);
         self.postMessage({ 
           id, 
           success: true, 
           data: { 
             columns: [], 
             rows: [], 
             affectedRows: isDML ? db.getRowsModified() : 0, 
             execTimeMs, 
             isDML 
           } 
         });
      } else {
         const { columns, values } = results[results.length - 1];
         // Limit returned rows for safety
         const limitedValues = values.slice(0, 1000);
         self.postMessage({ 
           id, 
           success: true, 
           data: { 
             columns, 
             rows: limitedValues, 
             execTimeMs, 
             totalRows: values.length 
           } 
         });
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
    else if (type === 'TEST_EDGE_CASES') {
      if (!db) throw new Error("Database not initialized");
      const { sql, primaryTable } = payload;
      
      const getNullableColumns = (tableName) => {
        const colInfo = db.exec(`PRAGMA table_info(${tableName})`);
        if (!colInfo.length) return [];
        return colInfo[0].values.filter(col => col[3] === 0 && col[5] === 0).map(col => col[1]);
      };
      const getNumericColumns = (tableName) => {
        const colInfo = db.exec(`PRAGMA table_info(${tableName})`);
        if (!colInfo.length) return [];
        return colInfo[0].values
          .filter(col => col[5] === 0 && (col[2].toUpperCase().includes('INT') || col[2].toUpperCase().includes('NUM')))
          .map(col => col[1]);
      };

      const variants = [
        { id: 'empty_table', label: 'Empty Table', description: 'All rows deleted from the primary table' },
        { id: 'single_row', label: 'Single Row', description: 'Only one row remains in the primary table' },
        { id: 'all_nulls', label: 'NULL-heavy Data', description: 'Non-PK/FK columns set to NULL' },
        { id: 'duplicates', label: 'Duplicate Rows', description: '50% of rows duplicated' },
        { id: 'extreme_values', label: 'Extreme Values', description: 'Numeric columns set to 0, and max integer' }
      ];

      const testResults = [];

      for (const variant of variants) {
        db.run(`SAVEPOINT edge_${variant.id}`);
        try {
          if (variant.id === 'empty_table') {
            db.exec(`DELETE FROM ${primaryTable}`);
          } else if (variant.id === 'single_row') {
            const firstIdRes = db.exec(`SELECT rowid FROM ${primaryTable} LIMIT 1`);
            if (firstIdRes.length && firstIdRes[0].values.length) {
              const firstId = firstIdRes[0].values[0][0];
              db.exec(`DELETE FROM ${primaryTable} WHERE rowid != ${firstId}`);
            }
          } else if (variant.id === 'all_nulls') {
            const nullableCols = getNullableColumns(primaryTable);
            nullableCols.forEach(col => { try { db.exec(`UPDATE ${primaryTable} SET ${col} = NULL`); } catch(e){} });
          } else if (variant.id === 'duplicates') {
            try { db.exec(`INSERT INTO ${primaryTable} SELECT * FROM ${primaryTable} LIMIT (SELECT COUNT(*)/2 FROM ${primaryTable})`); } catch(e){}
          } else if (variant.id === 'extreme_values') {
            const numericCols = getNumericColumns(primaryTable);
            if (numericCols.length > 0) {
              try { db.exec(`UPDATE ${primaryTable} SET ${numericCols[0]} = 0 WHERE rowid = (SELECT rowid FROM ${primaryTable} LIMIT 1)`); } catch(e){}
              try { db.exec(`UPDATE ${primaryTable} SET ${numericCols[0]} = 9999999 WHERE rowid = (SELECT rowid FROM ${primaryTable} LIMIT 1 OFFSET 1)`); } catch(e){}
            }
          }

          const res = db.exec(sql);
          testResults.push({
            ...variant,
            status: 'passed',
            rowCount: res.length > 0 ? res[0].values.length : 0
          });
        } catch (err) {
          testResults.push({
            ...variant,
            status: 'failed',
            error: err.message
          });
        } finally {
          db.run(`ROLLBACK TO edge_${variant.id}`);
        }
      }
      
      self.postMessage({ id, success: true, data: testResults });
    }
    
  } catch (err) {
    self.postMessage({ id, success: false, error: err.message });
  }
};
