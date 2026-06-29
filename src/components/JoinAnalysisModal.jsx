import React, { useState, useEffect } from 'react';

// Enhanced parser to extract ON conditions and handle aliases properly
const detectTablesAndJoins = (sql) => {
  // Simplify subqueries to avoid parsing their internal joins
  let cleanSql = sql.replace(/\([^)]+\)/g, '(SUBQUERY)');
  
  // Extract all FROM and JOIN tables with optional aliases
  const tablePattern = /\b(?:FROM|JOIN)\s+([a-zA-Z0-9_.]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?\b/gi;
  const tables = [];
  let match;
  while ((match = tablePattern.exec(cleanSql)) !== null) {
    const rawAlias = match[2] || '';
    const isKeyword = ['ON', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LEFT', 'RIGHT', 'INNER', 'FULL', 'CROSS', 'JOIN'].includes(rawAlias.toUpperCase());
    tables.push({
      name: match[1].split('.').pop(),
      alias: isKeyword ? null : rawAlias,
      index: match.index
    });
  }

  // Extract Joins and their ON conditions
  const joinPattern = /\b(INNER\s+JOIN|LEFT\s+(?:OUTER\s+)?JOIN|RIGHT\s+(?:OUTER\s+)?JOIN|FULL\s+(?:OUTER\s+)?JOIN|CROSS\s+JOIN|JOIN)\b\s+([a-zA-Z0-9_.]+)(?:\s+(?:AS\s+)?[a-zA-Z0-9_]+)?(?:\s+ON\s+([\s\S]*?))?(?=\b(?:INNER|LEFT|RIGHT|FULL|CROSS|JOIN|WHERE|GROUP|ORDER|LIMIT)\b|$)/gi;
  const joins = [];
  while ((match = joinPattern.exec(cleanSql)) !== null) {
    joins.push({
      type: match[1].trim().toUpperCase().replace(/\s+OUTER\s+/, ' '),
      rightTable: match[2].split('.').pop(),
      condition: match[3] ? match[3].trim() : null,
      index: match.index
    });
  }
  return { tables, joins };
};

export function JoinAnalysisModal({ executeQuery, sql, onClose }) {
  const [joinNodes, setJoinNodes] = useState([]);
  const [error, setError] = useState(null);
  const [finalRows, setFinalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Split-View Simulator States
  const [activeStep, setActiveStep] = useState(null);
  const [simulatorData, setSimulatorData] = useState({ left: null, right: null, loading: false });
  const [hoveredLeftRow, setHoveredLeftRow] = useState(null);
  
  // Parse and analyze joins on mount
  useEffect(() => {
    let mounted = true;
    if (!executeQuery || !sql) return;
    
    const analyze = async () => {
      setIsLoading(true);
      try {
        const { tables, joins } = detectTablesAndJoins(sql);
        if (joins.length === 0 || tables.length < 2) {
          if (mounted) { setJoinNodes([]); setIsLoading(false); }
          return;
        }

        const nodes = [];
        let currentLeftTableAlias = tables[0].alias || tables[0].name;
        let currentLeftTableName = tables[0].name;

        for (let i = 0; i < joins.length; i++) {
          const join = joins[i];
          const rightTableMatch = tables.find(t => t.name === join.rightTable && t.index >= join.index);
          const rightTableName = join.rightTable;
          const rightTableAlias = rightTableMatch?.alias || rightTableName;
          
          const joinType = join.type === 'JOIN' ? 'INNER JOIN' : join.type;
          
          // Execute stats
          let leftTotal = 0, rightTotal = 0, matchTotal = 0;
          try {
            const lRes = await executeQuery(`SELECT COUNT(*) FROM ${currentLeftTableName}`);
            if (lRes?.rows) leftTotal = lRes.rows[0][0];
            const rRes = await executeQuery(`SELECT COUNT(*) FROM ${rightTableName}`);
            if (rRes?.rows) rightTotal = rRes.rows[0][0];
            
            // Calculate matches if condition exists
            if (join.condition) {
              const mRes = await executeQuery(`SELECT COUNT(*) FROM ${currentLeftTableName} ${currentLeftTableAlias !== currentLeftTableName ? `AS ${currentLeftTableAlias}` : ''} INNER JOIN ${rightTableName} ${rightTableAlias !== rightTableName ? `AS ${rightTableAlias}` : ''} ON ${join.condition}`);
              if (mRes?.rows) matchTotal = mRes.rows[0][0];
            } else if (joinType === 'CROSS JOIN') {
              matchTotal = leftTotal * rightTotal;
            }
          } catch(e) { console.error("Stats query failed", e); }

          nodes.push({
            id: i,
            joinType,
            leftTable: currentLeftTableName,
            leftAlias: currentLeftTableAlias,
            rightTable: rightTableName,
            rightAlias: rightTableAlias,
            condition: join.condition,
            stats: { leftTotal, rightTotal, matchTotal }
          });
          
          // For multi-joins, the new left side conceptually becomes the result of the previous join.
          // For visualization simplicity, we just use the original left table name if it's the primary anchor.
        }

        let fr = 0;
        try {
          const finalRes = await executeQuery(`SELECT COUNT(*) FROM (${sql}) AS _final_count`);
          if (finalRes?.rows) fr = finalRes.rows[0][0];
        } catch(e) {}
        
        if (mounted) {
          setFinalRows(fr);
          setJoinNodes(nodes);
          setError(null);
          setIsLoading(false);
          if (nodes.length > 0) handleStepClick(nodes[0]);
        }
      } catch (err) {
        console.error("Join Visualizer failed", err);
        if (mounted) {
          setJoinNodes([]);
          setError("Could not parse joins for visualization.");
          setIsLoading(false);
        }
      }
    };
    
    analyze();
    return () => { mounted = false; };
  }, [executeQuery, sql]);

  const handleStepClick = async (node) => {
    setActiveStep(node);
    setSimulatorData({ left: null, right: null, loading: true });
    try {
      const leftRes = await executeQuery(`SELECT * FROM ${node.leftTable} LIMIT 20`);
      const rightRes = await executeQuery(`SELECT * FROM ${node.rightTable} LIMIT 20`);
      
      setSimulatorData({
        left: { columns: leftRes?.columns || [], rows: leftRes?.rows || [] },
        right: { columns: rightRes?.columns || [], rows: rightRes?.rows || [] },
        loading: false
      });
    } catch(e) {
      setSimulatorData({ left: null, right: null, loading: false });
    }
  };

  // Basic evaluator to check if two values match a generic ON condition (simple A.id = B.id)
  const isRowMatch = (leftRow, leftCols, rightRow, rightCols, condition) => {
    if (!condition) return false;
    try {
      // Very naive matching for educational visual demo purposes (handles simple equalities)
      const parts = condition.split('=');
      if (parts.length === 2) {
        const leftColName = parts[0].split('.').pop().trim();
        const rightColName = parts[1].split('.').pop().trim();
        
        const lIdx = leftCols.indexOf(leftColName);
        const rIdx = rightCols.indexOf(rightColName);
        
        if (lIdx !== -1 && rIdx !== -1) {
          return leftRow[lIdx] == rightRow[rIdx]; // loose equality
        }
        
        // Reverse check
        const rIdxAlt = rightCols.indexOf(leftColName);
        const lIdxAlt = leftCols.indexOf(rightColName);
        if (lIdxAlt !== -1 && rIdxAlt !== -1) {
          return leftRow[lIdxAlt] == rightRow[rIdxAlt];
        }
      }
    } catch(e) {}
    return false;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 99999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease-out' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pulseGlow { 0% { filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4)); } 50% { filter: drop-shadow(0 0 16px rgba(99, 102, 241, 0.8)); } 100% { filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4)); } }
        @keyframes dashFlow { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
        .step-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: 2px solid transparent; }
        .step-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.1); }
        .step-card.active { border-color: var(--primary); box-shadow: 0 8px 30px rgba(var(--primary-rgb, 99, 102, 241), 0.2); }
        .sim-row { transition: all 0.2s ease; cursor: crosshair; }
        .sim-row:hover { background: var(--surface-2); transform: scale(1.01); z-index: 10; position: relative; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .sim-row.highlight-match { background: rgba(34, 197, 94, 0.15); border-left: 3px solid var(--success); }
        .join-connector { border-left: 2px dashed var(--primary-muted); }
      `}</style>

      <div className="modal-content" style={{ width: '95vw', height: '90vh', maxWidth: '1600px', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface)', borderRadius: '24px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', animation: 'slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 32px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
              🔗
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, background: 'linear-gradient(to right, var(--text), var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Join Simulator</h2>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Interactive visualizer for SQL relationships</div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 14, borderRadius: '50%', width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)' }}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden', background: 'var(--bg)' }}>
          
          {/* Left Column: Pipeline Steps */}
          <div style={{ width: '450px', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', background: 'var(--surface)', overflowY: 'auto', padding: '24px', position: 'relative' }}>
            {isLoading ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--muted)' }}>
                <div style={{ width: 30, height: 30, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                Analyzing Query...
              </div>
            ) : error ? (
               <div style={{ padding: 20, background: 'rgba(239,68,68,0.1)', color: 'var(--error)', borderRadius: 12 }}>{error}</div>
            ) : joinNodes.length === 0 ? (
               <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', background: 'var(--surface-2)', borderRadius: 16 }}>
                 <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>🤷</div>
                 No standard JOINs detected.<br/>Try querying multiple tables!
               </div>
            ) : (
              joinNodes.map((node, idx) => {
                const isActive = activeStep?.id === node.id;
                const { joinType, leftTable, rightTable, stats, condition } = node;
                
                return (
                  <div key={node.id} style={{ position: 'relative' }}>
                    <div 
                      className={`step-card ${isActive ? 'active' : ''}`}
                      onClick={() => handleStepClick(node)}
                      style={{ 
                        background: 'var(--bg)', borderRadius: '20px', padding: '24px', position: 'relative', zIndex: 2
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ background: 'var(--primary-muted)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '20px', fontSize: 12, fontWeight: 800, letterSpacing: '0.5px' }}>
                          STEP {idx + 1}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                          {joinType}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                        {/* Connecting line behind circles */}
                        <svg style={{ position: 'absolute', top: 30, left: 40, right: 40, height: 4, width: 'calc(100% - 80px)', zIndex: 0 }}>
                           <line x1="0" y1="2" x2="100%" y2="2" stroke="var(--primary-muted)" strokeWidth="4" strokeDasharray="8 6" style={{ animation: isActive ? 'dashFlow 1s linear infinite' : 'none' }} />
                        </svg>

                        {/* Left Node */}
                        <div style={{ textAlign: 'center', zIndex: 1, background: 'var(--bg)', padding: '0 8px' }}>
                          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface)', border: '3px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(59,130,246,0.2)' }}>
                            <span style={{ fontSize: 20, color: '#3b82f6', fontWeight: 800 }}>A</span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{leftTable}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{stats.leftTotal.toLocaleString()} rows</div>
                        </div>

                        {/* Intersection / Join Type */}
                        <div style={{ textAlign: 'center', zIndex: 1, background: 'var(--bg)', padding: '0 12px' }}>
                          <div style={{ width: 50, height: 50, borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', boxShadow: isActive ? '0 8px 16px rgba(99,102,241,0.4)' : '0 4px 10px rgba(99,102,241,0.2)', animation: isActive ? 'pulseGlow 2s infinite' : 'none' }}>
                            <span style={{ fontSize: 24 }}>⋈</span>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{stats.matchTotal.toLocaleString()}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>Matches</div>
                        </div>

                        {/* Right Node */}
                        <div style={{ textAlign: 'center', zIndex: 1, background: 'var(--bg)', padding: '0 8px' }}>
                          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface)', border: '3px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(16,185,129,0.2)' }}>
                            <span style={{ fontSize: 20, color: '#10b981', fontWeight: 800 }}>B</span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{rightTable}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{stats.rightTotal.toLocaleString()} rows</div>
                        </div>
                      </div>

                      {/* Condition snippet */}
                      {condition && (
                        <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>ON</span> {condition}
                        </div>
                      )}
                    </div>

                    {idx < joinNodes.length - 1 && (
                      <div style={{ height: 40, width: '100%', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 4, height: '100%', background: 'var(--border)' }} />
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)', width: 10, height: 10, borderBottom: '3px solid var(--border)', borderRight: '3px solid var(--border)' }} />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {!isLoading && !error && joinNodes.length > 0 && (
              <div style={{ marginTop: 40, background: 'linear-gradient(135deg, var(--success) 0%, #16a34a 100%)', borderRadius: '20px', padding: '24px', color: 'white', textAlign: 'center', boxShadow: '0 12px 30px rgba(34,197,94,0.3)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, left: -30, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: -30, right: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', position: 'relative', zIndex: 2 }}>Final Result</div>
                <div style={{ fontSize: 48, fontWeight: 900, marginTop: 8, position: 'relative', zIndex: 2 }}>{finalRows.toLocaleString()}</div>
                <div style={{ fontSize: 13, opacity: 0.8, position: 'relative', zIndex: 2 }}>Rows Generated</div>
              </div>
            )}
          </div>

          {/* Right Column: Split Simulator */}
          <div style={{ flex: 1, minWidth: 0, padding: '32px', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
            {!activeStep ? (
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', textAlign: 'center', background: 'var(--bg)', borderRadius: '24px', border: '2px dashed var(--border)' }}>
                 <div style={{ width: 80, height: 80, background: 'var(--surface-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 24 }}>👉</div>
                 <h3 style={{ fontSize: 20, color: 'var(--text)', marginBottom: 12 }}>Select a Join Step</h3>
                 <p style={{ maxWidth: 300, lineHeight: 1.6 }}>Click on any step in the pipeline to the left to inspect exactly how rows from Table A map to Table B.</p>
               </div>
            ) : (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexShrink: 0 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Data Simulator</h3>
                    <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Hover over rows in Table A to see matches in Table B (Top 20 rows limit)</div>
                  </div>
                  <div style={{ background: 'var(--primary-muted)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '12px', fontSize: 12, fontWeight: 700 }}>
                    {activeStep.joinType}
                  </div>
                </div>

                {simulatorData.loading ? (
                   <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ width: 40, height: 40, border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                   </div>
                ) : (
                  <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: '24px', position: 'relative' }}>
                    
                    {/* Visual connecting pipe graphic */}
                    <div style={{ position: 'absolute', top: 50, bottom: 50, left: '50%', width: 2, background: 'var(--border)', transform: 'translateX(-50%)', zIndex: 0 }} />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', width: 32, height: 32, background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: 14 }}>
                      ⋈
                    </div>

                    {/* Table A (Left) */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid #3b82f640', borderRadius: '16px', background: 'var(--bg)', overflow: 'hidden', boxShadow: '0 8px 24px rgba(59,130,246,0.05)', zIndex: 2 }}>
                      <div style={{ background: '#3b82f615', padding: '16px 20px', borderBottom: '1px solid #3b82f640', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 28, height: 28, background: '#3b82f6', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>A</div>
                        <span style={{ fontWeight: 700, color: '#1d4ed8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeStep.leftTable}</span>
                      </div>
                      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead style={{ position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <tr>
                              {simulatorData.left?.columns.map(c => <th key={c} style={{ padding: '12px 16px', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {simulatorData.left?.rows.map((row, i) => (
                              <tr 
                                key={i} 
                                className="sim-row"
                                onMouseEnter={() => setHoveredLeftRow(row)}
                                onMouseLeave={() => setHoveredLeftRow(null)}
                                style={{ borderBottom: '1px solid var(--border)' }}
                              >
                                {row.map((val, j) => (
                                  <td key={j} style={{ padding: '10px 16px', color: 'var(--text)' }}>
                                    {val === null ? <span style={{ color: 'var(--muted)', fontStyle: 'italic', background: 'var(--surface-3)', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>NULL</span> : String(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                            {(!simulatorData.left?.rows || simulatorData.left.rows.length === 0) && (
                              <tr><td colSpan={100} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No data</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Table B (Right) */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', border: '1px solid #10b98140', borderRadius: '16px', background: 'var(--bg)', overflow: 'hidden', boxShadow: '0 8px 24px rgba(16,185,129,0.05)', zIndex: 2 }}>
                      <div style={{ background: '#10b98115', padding: '16px 20px', borderBottom: '1px solid #10b98140', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 28, height: 28, background: '#10b981', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>B</div>
                        <span style={{ fontWeight: 700, color: '#047857', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeStep.rightTable}</span>
                      </div>
                      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead style={{ position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <tr>
                              {simulatorData.right?.columns.map(c => <th key={c} style={{ padding: '12px 16px', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {simulatorData.right?.rows.map((row, i) => {
                              const isMatch = hoveredLeftRow && isRowMatch(hoveredLeftRow, simulatorData.left.columns, row, simulatorData.right.columns, activeStep.condition);
                              return (
                                <tr 
                                  key={i} 
                                  className={`sim-row ${isMatch ? 'highlight-match' : ''}`}
                                  style={{ borderBottom: '1px solid var(--border)' }}
                                >
                                  {row.map((val, j) => (
                                    <td key={j} style={{ padding: '10px 16px', color: 'var(--text)', fontWeight: isMatch ? 700 : 400 }}>
                                      {val === null ? <span style={{ color: 'var(--muted)', fontStyle: 'italic', background: 'var(--surface-3)', padding: '2px 6px', borderRadius: 4, fontSize: 10 }}>NULL</span> : String(val)}
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                            {(!simulatorData.right?.rows || simulatorData.right.rows.length === 0) && (
                              <tr><td colSpan={100} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No data</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
