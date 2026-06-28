import React, { useState } from 'react';

// Use the globally loaded initSqlJs from the CDN (loaded in useSqlDatabase)

const getNullableColumns = (db, tableName) => {
  const colInfo = db.exec(`PRAGMA table_info(${tableName})`);
  if (!colInfo.length) return [];
  // column format: [cid, name, type, notnull, dflt_value, pk]
  return colInfo[0].values.filter(col => col[3] === 0 && col[5] === 0).map(col => col[1]);
};

const getNumericColumns = (db, tableName) => {
  const colInfo = db.exec(`PRAGMA table_info(${tableName})`);
  if (!colInfo.length) return [];
  return colInfo[0].values
    .filter(col => col[5] === 0 && (col[2].toUpperCase().includes('INT') || col[2].toUpperCase().includes('NUM')))
    .map(col => col[1]);
};

const EDGE_CASE_VARIANTS = [
  {
    id: 'empty_table',
    label: 'Empty Table',
    description: 'All rows deleted from the primary table',
    transform: (db, tableName) => db.exec(`DELETE FROM ${tableName}`)
  },
  {
    id: 'single_row',
    label: 'Single Row',
    description: 'Only one row remains in the primary table',
    transform: (db, tableName) => {
      const firstIdRes = db.exec(`SELECT rowid FROM ${tableName} LIMIT 1`);
      if (firstIdRes.length && firstIdRes[0].values.length) {
        const firstId = firstIdRes[0].values[0][0];
        db.exec(`DELETE FROM ${tableName} WHERE rowid != ${firstId}`);
      }
    }
  },
  {
    id: 'all_nulls',
    label: 'NULL-heavy Data',
    description: 'Non-PK/FK columns set to NULL',
    transform: (db, tableName) => {
      const nullableCols = getNullableColumns(db, tableName);
      nullableCols.forEach(col => {
        try { db.exec(`UPDATE ${tableName} SET ${col} = NULL`); } catch (e) {}
      });
    }
  },
  {
    id: 'duplicates',
    label: 'Duplicate Rows',
    description: '50% of rows duplicated',
    transform: (db, tableName) => {
      try {
        db.exec(`INSERT INTO ${tableName} SELECT * FROM ${tableName} LIMIT (SELECT COUNT(*)/2 FROM ${tableName})`);
      } catch(e) {}
    }
  },
  {
    id: 'extreme_values',
    label: 'Extreme Values',
    description: 'Numeric columns set to 0, and max integer',
    transform: (db, tableName) => {
      const numericCols = getNumericColumns(db, tableName);
      if (numericCols.length > 0) {
        try { db.exec(`UPDATE ${tableName} SET ${numericCols[0]} = 0 WHERE rowid = (SELECT rowid FROM ${tableName} LIMIT 1)`); } catch (e) {}
        try { db.exec(`UPDATE ${tableName} SET ${numericCols[0]} = 9999999 WHERE rowid = (SELECT rowid FROM ${tableName} LIMIT 1 OFFSET 1)`); } catch (e) {}
      }
    }
  }
];

export const EdgeCaseTester = ({ db, sql }) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  const runTests = async () => {
    if (!db || !sql) return;
    setTesting(true);
    setResults(null);

    // Heuristic: Extract the primary table from the query to mutate
    const fromMatch = sql.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    const primaryTable = fromMatch ? fromMatch[1] : null;

    if (!primaryTable) {
      setResults([{ id: 'error', status: 'error', error: 'Could not determine primary table from query.' }]);
      setTesting(false);
      return;
    }

    try {
      const SQL = await window.initSqlJs({ locateFile: () => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.wasm' });
      const testResults = [];

      for (const variant of EDGE_CASE_VARIANTS) {
        // Export current DB to create a fresh isolated clone
        const dbExport = db.export();
        const dbCopy = new SQL.Database(dbExport);

        try {
          variant.transform(dbCopy, primaryTable);
          const res = dbCopy.exec(sql);
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
        }
        
        dbCopy.close(); // Free WASM memory to prevent leaks
      }

      setResults(testResults);
    } catch (err) {
      console.error("Edge case testing failed", err);
      setResults([{ id: 'error', status: 'error', error: 'Failed to initialize testing environment.' }]);
    }
    
    setTesting(false);
  };

  return (
    <div style={{ marginLeft: '12px' }}>
      <button 
        className="btn btn-secondary" 
        onClick={runTests} 
        disabled={testing || !sql}
        title="Run your query against extreme data scenarios"
        style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        {testing ? <span className="animate-pulse-glow" style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} /> : '🧪'} 
        {testing ? 'Testing Edge Cases...' : 'Test Edge Cases'}
      </button>

      {results && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '16px',
          width: '320px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 100,
          marginTop: '8px',
          padding: '12px',
          color: 'var(--text)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '13px' }}>Edge Case Results</span>
            <button onClick={() => setResults(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>✖</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {results.map(r => (
              <div key={r.id} style={{ 
                background: r.status === 'passed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${r.status === 'passed' ? 'var(--success)' : 'var(--error)'}`,
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: r.status === 'passed' ? 'var(--success)' : 'var(--error)' }}>
                    {r.status === 'passed' ? '✓ ' : '✗ '}{r.label || 'Error'}
                  </strong>
                  {r.status === 'passed' && <span>{r.rowCount} rows</span>}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                  {r.status === 'passed' ? r.description : r.error}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
