import React, { useState, useEffect } from 'react';

const detectTablesAndJoins = (sql) => {
  let cleanSql = sql.replace(/\([^)]+\)/g, '()');
  const tablePattern = /\b(?:FROM|JOIN)\s+([a-zA-Z0-9_.]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?\b/gi;
  const tables = [];
  let match;
  while ((match = tablePattern.exec(cleanSql)) !== null) {
    tables.push({
      full: match[0],
      name: match[1].split('.').pop(),
      alias: match[2] || null,
      index: match.index
    });
  }

  const joinPattern = /\b(INNER\s+JOIN|LEFT\s+(?:OUTER\s+)?JOIN|RIGHT\s+(?:OUTER\s+)?JOIN|FULL\s+(?:OUTER\s+)?JOIN|CROSS\s+JOIN|JOIN)\b/gi;
  const joins = [];
  while ((match = joinPattern.exec(cleanSql)) !== null) {
    joins.push({
      type: match[1].trim().toUpperCase().replace(/\s+OUTER\s+/, ' '),
      index: match.index
    });
  }
  return { tables, joins };
};

export function JoinAnalysisModal({ executeQuery, sql, onClose }) {
  const [joinNodes, setJoinNodes] = useState([]);
  const [error, setError] = useState(null);
  const [finalRows, setFinalRows] = useState(0);

  // Data Preview states
  const [previewTable, setPreviewTable] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!executeQuery || !sql) return;
    
    const analyze = async () => {
      try {
        const { tables, joins } = detectTablesAndJoins(sql);
        if (joins.length === 0 || tables.length < 2) {
          if (mounted) setJoinNodes([]);
          return;
        }

        const nodes = [];
        for (let i = 0; i < joins.length; i++) {
          const join = joins[i];
          const leftTable = tables[i] ? tables[i].name : 'Left';
          const rightTable = tables[i + 1] ? tables[i + 1].name : 'Right';
          const joinType = join.type === 'JOIN' ? 'INNER JOIN' : join.type;

          let leftTotal = 0;
          let rightTotal = 0;
          try {
            const lRes = await executeQuery(`SELECT COUNT(*) FROM ${leftTable}`);
            if (lRes && lRes.rows && lRes.rows.length) leftTotal = lRes.rows[0][0];
          } catch(e) {}
          try {
            const rRes = await executeQuery(`SELECT COUNT(*) FROM ${rightTable}`);
            if (rRes && rRes.rows && rRes.rows.length) rightTotal = rRes.rows[0][0];
          } catch(e) {}

          nodes.push({
            id: i,
            joinType,
            leftTable,
            rightTable,
            leftTotal,
            rightTotal,
          });
        }

        let fr = 0;
        try {
          const finalRes = await executeQuery(`SELECT COUNT(*) FROM (${sql})`);
          if (finalRes && finalRes.rows && finalRes.rows.length) fr = finalRes.rows[0][0];
        } catch(e) {}
        
        if (mounted) {
          setFinalRows(fr);
          setJoinNodes(nodes);
          setError(null);
        }
      } catch (err) {
        console.error("Join Visualizer failed", err);
        if (mounted) {
          setJoinNodes([]);
          setError("Could not parse joins for visualization.");
        }
      }
    };
    
    analyze();
    return () => { mounted = false; };
  }, [executeQuery, sql]);

  const loadPreview = async (tableName) => {
    try {
      const res = await executeQuery(`SELECT * FROM ${tableName} LIMIT 5`);
      if (res && res.rows && res.rows.length > 0) {
        setPreviewData({ columns: res.columns, values: res.rows });
        setPreviewTable(tableName);
      } else {
        setPreviewData({ columns: [], values: [] });
        setPreviewTable(tableName);
      }
    } catch (e) {
      console.error(e);
    }

  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 99999 }}>
      <div className="modal-content" style={{ width: '90vw', height: '90vh', maxWidth: '1400px', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🔗</span>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Advanced Join Analysis</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 14 }}>
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px', display: 'flex', gap: '32px' }}>
          
          {/* Left Column: Visuals */}
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '8px' }}>
            {error ? (
               <div style={{ color: 'var(--error)' }}>{error}</div>
            ) : joinNodes.length === 0 ? (
               <div style={{ color: 'var(--muted)', textAlign: 'center', marginTop: 40 }}>No standard JOINs detected in this query.</div>
            ) : (
              joinNodes.map((node, idx) => {
                const { joinType, leftTable, rightTable, leftTotal, rightTotal } = node;
                const isLeftFilled = ['LEFT JOIN', 'FULL JOIN'].includes(joinType);
                const isRightFilled = ['RIGHT JOIN', 'FULL JOIN'].includes(joinType);
                const isCross = joinType === 'CROSS JOIN';

                return (
                  <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    
                    {/* The Node Box */}
                    <div 
                      className="join-node-card"
                      style={{ 
                        background: 'var(--surface)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '16px', 
                        padding: '32px 24px', 
                        position: 'relative', 
                        width: '100%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{ position: 'absolute', top: -12, left: 32, background: 'linear-gradient(135deg, var(--primary), #3b82f6)', color: 'white', padding: '6px 16px', borderRadius: '16px', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
                        Step {idx + 1}: {joinType}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: 8 }}>
                        {/* Left Table Stats */}
                        <div style={{ textAlign: 'center', minWidth: 120 }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{leftTable}</div>
                          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{leftTotal.toLocaleString()} total rows</div>
                          <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, borderRadius: '20px', padding: '6px 16px' }} onClick={() => loadPreview(leftTable)}>👀 Preview</button>
                        </div>

                        {/* Venn Diagram SVG */}
                        <div style={{ width: '300px', height: '200px', flexShrink: 0, position: 'relative' }}>
                          <svg viewBox="0 0 400 250" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.08))' }}>
                            <defs>
                              <clipPath id={`leftCircleFull-${node.id}`}>
                                <circle cx="150" cy="120" r="100" />
                              </clipPath>
                              
                              <linearGradient id="gradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
                              </linearGradient>
                              
                              <linearGradient id="gradSuccess" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--success)" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#16a34a" stopOpacity="0.4" />
                              </linearGradient>

                              <linearGradient id="gradIntersection" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
                              </linearGradient>
                            </defs>

                            {isCross ? (
                              <g transform="translate(0, 10)">
                                <rect x="50" y="20" width="100" height="180" rx="16" fill="url(#gradPrimary)" stroke="var(--primary)" strokeWidth="2" />
                                <rect x="250" y="20" width="100" height="180" rx="16" fill="url(#gradSuccess)" stroke="var(--success)" strokeWidth="2" />
                                <text x="100" y="115" textAnchor="middle" fill="white" fontWeight="bold" fontSize="40">×</text>
                                <text x="200" y="115" textAnchor="middle" fill="var(--text)" fontSize="20">=</text>
                                <text x="300" y="115" textAnchor="middle" fill="white" fontWeight="bold" fontSize="24">M×N</text>
                              </g>
                            ) : (
                              <>
                                <circle 
                                  cx="150" cy="120" r="100" 
                                  fill={isLeftFilled ? "url(#gradPrimary)" : "transparent"} 
                                  stroke={isLeftFilled ? "none" : "var(--primary)"} 
                                  strokeWidth="2" 
                                />
                                <circle 
                                  cx="250" cy="120" r="100" 
                                  fill={isRightFilled ? "url(#gradSuccess)" : "transparent"} 
                                  stroke={isRightFilled ? "none" : "var(--success)"} 
                                  strokeWidth="2" 
                                />
                                <circle 
                                  cx="250" cy="120" r="100" 
                                  fill={"url(#gradIntersection)"} 
                                  clipPath={`url(#leftCircleFull-${node.id})`} 
                                />
                              </>
                            )}
                          </svg>
                        </div>

                        {/* Right Table Stats */}
                        <div style={{ textAlign: 'center', minWidth: 120 }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{rightTable}</div>
                          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{rightTotal.toLocaleString()} total rows</div>
                          <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, borderRadius: '20px', padding: '6px 16px' }} onClick={() => loadPreview(rightTable)}>👀 Preview</button>
                        </div>
                      </div>
                    </div>

                    {/* Connecting Arrow Pipeline to next node (if not last) */}
                    {idx < joinNodes.length - 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0' }}>
                        <div style={{ width: 2, height: 24, background: 'linear-gradient(to bottom, var(--primary), var(--primary-muted))' }} />
                        <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid var(--primary-muted)' }} />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Final Outcome */}
            {!error && joinNodes.length > 0 && (
              <div 
                style={{ 
                  background: 'var(--surface)', 
                  border: '1px solid var(--success)', 
                  borderRadius: '16px', 
                  padding: '32px', 
                  textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%)' }} />
                
                <h3 style={{ margin: '0 0 12px 0', color: 'var(--success)', fontSize: 22, fontWeight: 700 }}>Final Result Set</h3>
                <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--text)', textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  {finalRows.toLocaleString()} Rows
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Data Inspector */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '16px', 
              padding: '24px', 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🔎</span>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Data Inspector</h3>
              </div>
              
              {previewTable ? (
                <>
                  <div style={{ marginBottom: 16, fontSize: 14, color: 'var(--text)', background: 'var(--surface-2)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                    Previewing top 5 rows of <strong>{previewTable}</strong>
                  </div>
                  <div style={{ flex: 1, overflow: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <table className="results-table" style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'var(--surface-2)', position: 'sticky', top: 0, zIndex: 2 }}>
                        <tr>
                          {previewData?.columns.map(c => <th key={c} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)' }}>{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData?.values.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {row.map((val, j) => (
                              <td key={j} style={{ padding: '12px 16px' }}>
                                {val === null ? <span style={{ color: 'var(--muted)', fontStyle: 'italic', background: 'var(--surface-3)', padding: '2px 6px', borderRadius: '4px', fontSize: 11 }}>NULL</span> : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', textAlign: 'center' }}>
                  <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 16 }}>👀</div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>No Table Selected</div>
                  <div style={{ fontSize: 14, maxWidth: 200 }}>
                    Click <strong>"Preview"</strong> on any table in the pipeline to inspect its raw data.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
