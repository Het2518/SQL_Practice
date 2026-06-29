import React, { useState } from 'react';



export const EdgeCaseTester = ({ getEdgeCaseResults, sql }) => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  const runTests = async () => {
    if (!getEdgeCaseResults || !sql) return;
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
      const testResults = await getEdgeCaseResults(sql, primaryTable);
      setResults(testResults);
    } catch (err) {
      console.error("Edge case testing failed", err);
      setResults([{ id: 'error', status: 'error', error: 'Failed to run tests.' }]);
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
