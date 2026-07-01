import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, X, AlertTriangle, SkipBack, SkipForward, FastForward } from 'lucide-react';

// Enhanced parser to extract ON conditions and handle aliases properly
const detectTablesAndJoins = (sql) => {
  let cleanSql = sql.replace(/\([^)]+\)/g, '(SUBQUERY)');
  
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

  const joinPattern = /\b(INNER\s+JOIN|LEFT\s+(?:OUTER\s+)?JOIN|RIGHT\s+(?:OUTER\s+)?JOIN|FULL\s+(?:OUTER\s+)?JOIN|CROSS\s+JOIN|JOIN)\b\s+([a-zA-Z0-9_.]+)(?:\s+(?:AS\s+)?[a-zA-Z0-9_]+)?(?:\s+ON\s+([\s\S]*?))?(?=\b(?:INNER|LEFT|RIGHT|FULL|CROSS|JOIN|WHERE|GROUP|ORDER|LIMIT)\b|$)/gi;
  const joins = [];
  while ((match = joinPattern.exec(cleanSql)) !== null) {
    joins.push({
      type: match[1].trim().toUpperCase().replace(/\s+OUTER\s+/, ' '),
      rightTable: match[2].split('.').pop(),
      condition: match[3] ? match[3].replace(/;+\s*$/, '').trim() : null,
      index: match.index
    });
  }
  return { tables, joins };
};

const PHASES = {
  SETUP: 0,
  CROSS_JOIN: 1,
  SCAN: 2,
  FILTER: 3,
  OUTER_RECOVERY: 4,
  RESULT: 5
};

export function AnimatedJoinVisualizer({ executeQuery, sql, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [scanIndex, setScanIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const timerRef = useRef(null);

  // Parse SQL and load sample data
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const { tables, joins } = detectTablesAndJoins(sql);
        if (joins.length === 0 || tables.length < 2) {
          throw new Error("No joins detected. Please write a query with at least one JOIN.");
        }

        // We only animate the FIRST join for simplicity
        const join = joins[0];
        const leftTable = tables[0].name;
        const leftAlias = tables[0].alias || leftTable;
        const rightTable = join.rightTable;
        const rightAlias = tables.find(t => t.name === rightTable)?.alias || rightTable;
        const joinType = join.type === 'JOIN' ? 'INNER JOIN' : join.type;
        const condition = join.condition || '1=1';

        // Fetch max 4 rows from left and 4 rows from right to keep animation manageable
        const lRes = await executeQuery(`SELECT * FROM ${leftTable} LIMIT 4`);
        const rRes = await executeQuery(`SELECT * FROM ${rightTable} LIMIT 4`);

        if (lRes.error || rRes.error) throw new Error("Failed to sample tables.");

        const leftRows = lRes.rows || [];
        const rightRows = rRes.rows || [];
        
        // Compute Cross Join locally
        const crossJoin = [];
        for (let i = 0; i < leftRows.length; i++) {
          for (let j = 0; j < rightRows.length; j++) {
            crossJoin.push({
              leftIndex: i,
              rightIndex: j,
              leftRow: leftRows[i],
              rightRow: rightRows[j],
              isMatch: false, // will evaluate in SQL
              id: `cross-${i}-${j}`
            });
          }
        }

        // Evaluate matches via SQL to avoid parsing complex conditions locally
        // Rewrite condition to use _left and _right
        let rewrittenCond = condition;
        const regexL = new RegExp(`\\b${leftAlias}\\.`, 'g');
        rewrittenCond = rewrittenCond.replace(regexL, '_left.');
        const regexR = new RegExp(`\\b${rightAlias}\\.`, 'g');
        rewrittenCond = rewrittenCond.replace(regexR, '_right.');

        const evalSql = `
          SELECT CASE WHEN (${rewrittenCond}) THEN 1 ELSE 0 END AS _is_match 
          FROM (SELECT * FROM ${leftTable} LIMIT 4) AS _left 
          CROSS JOIN (SELECT * FROM ${rightTable} LIMIT 4) AS _right
        `;
        const evalRes = await executeQuery(evalSql);
        
        if (!evalRes.error && evalRes.rows) {
          evalRes.rows.forEach((row, idx) => {
            if (crossJoin[idx]) {
              crossJoin[idx].isMatch = row[0] === 1;
            }
          });
        }

        if (mounted) {
          setData({
            leftTable, leftCols: lRes.columns || [], leftRows,
            rightTable, rightCols: rRes.columns || [], rightRows,
            crossJoin,
            joinType,
            condition
          });
        }

      } catch (err) {
        if (mounted) setError(err.message);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [sql, executeQuery]);

  // Animation Engine
  useEffect(() => {
    if (!isPlaying || !data) return;

    timerRef.current = setTimeout(() => {
      if (phase === PHASES.SETUP) {
        setPhase(PHASES.CROSS_JOIN);
      } 
      else if (phase === PHASES.CROSS_JOIN) {
        setPhase(PHASES.SCAN);
        setScanIndex(0);
      } 
      else if (phase === PHASES.SCAN) {
        if (scanIndex < data.crossJoin.length - 1) {
          setScanIndex(scanIndex + 1);
        } else {
          setPhase(PHASES.FILTER);
          setScanIndex(-1);
        }
      } 
      else if (phase === PHASES.FILTER) {
        if (data.joinType.includes('LEFT') || data.joinType.includes('RIGHT') || data.joinType.includes('FULL')) {
          setPhase(PHASES.OUTER_RECOVERY);
        } else {
          setPhase(PHASES.RESULT);
          setIsPlaying(false);
        }
      } 
      else if (phase === PHASES.OUTER_RECOVERY) {
        setPhase(PHASES.RESULT);
        setIsPlaying(false);
      }
    }, (phase === PHASES.SCAN ? 600 : 1500) / speedMultiplier);

    return () => clearTimeout(timerRef.current);
  }, [isPlaying, phase, scanIndex, data, speedMultiplier]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const stepForward = () => {
    setIsPlaying(false);
    if (phase === PHASES.SETUP) setPhase(PHASES.CROSS_JOIN);
    else if (phase === PHASES.CROSS_JOIN) { setPhase(PHASES.SCAN); setScanIndex(0); }
    else if (phase === PHASES.SCAN) {
      if (scanIndex < data.crossJoin.length - 1) setScanIndex(scanIndex + 1);
      else { setPhase(PHASES.FILTER); setScanIndex(-1); }
    }
    else if (phase === PHASES.FILTER) {
      if (data.joinType.includes('LEFT') || data.joinType.includes('RIGHT') || data.joinType.includes('FULL')) setPhase(PHASES.OUTER_RECOVERY);
      else setPhase(PHASES.RESULT);
    }
    else if (phase === PHASES.OUTER_RECOVERY) setPhase(PHASES.RESULT);
  };

  const stepBackward = () => {
    setIsPlaying(false);
    if (phase === PHASES.RESULT) {
      if (data.joinType.includes('LEFT') || data.joinType.includes('RIGHT') || data.joinType.includes('FULL')) setPhase(PHASES.OUTER_RECOVERY);
      else { setPhase(PHASES.FILTER); setScanIndex(-1); }
    }
    else if (phase === PHASES.OUTER_RECOVERY) { setPhase(PHASES.FILTER); setScanIndex(-1); }
    else if (phase === PHASES.FILTER) { setPhase(PHASES.SCAN); setScanIndex(data.crossJoin.length - 1); }
    else if (phase === PHASES.SCAN) {
      if (scanIndex > 0) setScanIndex(scanIndex - 1);
      else setPhase(PHASES.CROSS_JOIN);
    }
    else if (phase === PHASES.CROSS_JOIN) setPhase(PHASES.SETUP);
  };

  const reset = () => {
    setIsPlaying(false);
    setPhase(PHASES.SETUP);
    setScanIndex(-1);
  };

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ width: 500, padding: 30, textAlign: 'center' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', display: 'inline-flex', padding: 16, borderRadius: '50%', marginBottom: 16 }}>
            <AlertTriangle size={32} color="var(--error)" />
          </div>
          <h3 style={{ marginBottom: 12 }}>Cannot Animate Join</h3>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>{error}</p>
          <button className="btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ width: 500, padding: 40, textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 20px auto' }}></div>
          <p>Analyzing SQL and buffering frames...</p>
        </div>
      </div>
    );
  }

  // Derived states for rendering
  const showCrossJoin = phase >= PHASES.CROSS_JOIN;
  const showFilter = phase >= PHASES.FILTER;
  const showOuter = phase >= PHASES.OUTER_RECOVERY;

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="modal-content" style={{ width: '90vw', maxWidth: 1200, height: '85vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              ▶️ Cinematic Join Visualizer
              <span className="tag" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>{data.joinType}</span>
            </h2>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, fontFamily: 'monospace' }}>ON {data.condition}</div>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Cinematic Area */}
        <div style={{ flex: 1, backgroundColor: '#0f172a', overflow: 'auto', position: 'relative', padding: 24, display: 'flex', flexDirection: 'column' }}>
          
          {/* Top Phase Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: 99, display: 'flex', gap: 16, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span style={{ color: phase === PHASES.SETUP ? '#fff' : 'inherit' }}>1. Setup</span>
              <span>→</span>
              <span style={{ color: phase === PHASES.CROSS_JOIN ? '#fff' : 'inherit' }}>2. Cross Join</span>
              <span>→</span>
              <span style={{ color: phase === PHASES.SCAN ? '#3b82f6' : 'inherit' }}>3. Scan ON</span>
              <span>→</span>
              <span style={{ color: phase === PHASES.FILTER ? '#fff' : 'inherit' }}>4. Filter</span>
              {(data.joinType.includes('LEFT') || data.joinType.includes('RIGHT')) && (
                <>
                  <span>→</span>
                  <span style={{ color: phase === PHASES.OUTER_RECOVERY ? '#fff' : 'inherit' }}>5. Outer</span>
                </>
              )}
              <span>→</span>
              <span style={{ color: phase === PHASES.RESULT ? '#10b981' : 'inherit' }}>Result</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            
            {/* Phase 0: Setup (Split Tables) */}
            {!showCrossJoin && (
              <div style={{ display: 'flex', gap: 60, alignItems: 'center', animation: 'fadeIn 0.5s ease' }}>
                <TablePreview name={data.leftTable} cols={data.leftCols} rows={data.leftRows} color="#3b82f6" />
                <div style={{ fontSize: 24, color: 'var(--muted)', fontWeight: 'bold' }}>×</div>
                <TablePreview name={data.rightTable} cols={data.rightCols} rows={data.rightRows} color="#10b981" />
              </div>
            )}

            {/* Phase 1-5: Merged Grid (Cross Join -> Filter -> Outer -> Result) */}
            {showCrossJoin && (
              <div style={{ animation: 'zoomIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)', transformOrigin: 'top center' }}>
                <table style={{ borderCollapse: 'collapse', color: '#fff', fontSize: 13, background: '#1e293b', borderRadius: 8, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                  <thead>
                    <tr>
                      <th colSpan={data.leftCols.length} style={{ background: '#1e3a8a', padding: 8, borderRight: '2px solid #0f172a' }}>{data.leftTable}</th>
                      <th colSpan={data.rightCols.length} style={{ background: '#064e3b', padding: 8 }}>{data.rightTable}</th>
                    </tr>
                    <tr style={{ background: '#334155' }}>
                      {data.leftCols.map((c, i) => <th key={`lc-${i}`} style={{ padding: '8px 12px', borderBottom: '1px solid #475569', borderRight: i === data.leftCols.length-1 ? '2px solid #0f172a' : '1px solid #475569' }}>{c}</th>)}
                      {data.rightCols.map((c, i) => <th key={`rc-${i}`} style={{ padding: '8px 12px', borderBottom: '1px solid #475569', borderRight: '1px solid #475569' }}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.crossJoin.map((item, idx) => {
                      const isScanning = phase === PHASES.SCAN && scanIndex === idx;
                      const hasScanned = phase === PHASES.SCAN && scanIndex > idx;
                      const isFiltered = showFilter && !item.isMatch;
                      
                      // Handle Outer Join Recovery visually
                      const isLeftRecovered = showOuter && data.joinType.includes('LEFT') && !item.isMatch && 
                        // Only recover if this left row had NO matches in the entire cross join
                        !data.crossJoin.some(cj => cj.leftIndex === item.leftIndex && cj.isMatch);

                      // Hide row if filtered and not recovered
                      if (isFiltered && !isLeftRecovered) {
                         if (phase === PHASES.RESULT) return null; // completely remove from DOM in final phase
                      }

                      let rowBg = 'transparent';
                      let rowStyle = { transition: 'all 0.3s ease' };
                      
                      if (isScanning) {
                        rowBg = '#3b82f640'; // highlight blue while scanning
                        rowStyle.transform = 'scale(1.02)';
                        rowStyle.boxShadow = '0 0 20px rgba(59,130,246,0.5)';
                      } else if ((hasScanned || showFilter) && item.isMatch) {
                        rowBg = '#05966940'; // green if matched
                      } else if ((hasScanned || showFilter) && !item.isMatch) {
                        if (isLeftRecovered) {
                          rowBg = '#1e293b'; // reset bg
                        } else {
                          rowBg = '#ef444440'; // red if unmatched
                          if (showFilter) {
                            rowStyle.opacity = 0.2;
                            rowStyle.textDecoration = 'line-through';
                            rowStyle.height = phase === PHASES.RESULT ? 0 : 'auto';
                          }
                        }
                      }

                      return (
                        <tr key={item.id} style={{ backgroundColor: rowBg, ...rowStyle }}>
                          {item.leftRow.map((c, i) => (
                            <td key={`l-${i}`} style={{ padding: '8px 12px', borderBottom: '1px solid #334155', borderRight: i === data.leftCols.length-1 ? '2px solid #0f172a' : '1px solid #334155' }}>
                              {String(c)}
                            </td>
                          ))}
                          {item.rightRow.map((c, i) => (
                            <td key={`r-${i}`} style={{ padding: '8px 12px', borderBottom: '1px solid #334155', borderRight: '1px solid #334155', color: isLeftRecovered ? '#64748b' : 'inherit', fontStyle: isLeftRecovered ? 'italic' : 'normal' }}>
                              {isLeftRecovered ? 'NULL' : String(c)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Control Bar */}
        <div style={{ padding: '20px 32px', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline</span>
            <input 
              type="range" 
              min="0" 
              max="5" 
              value={phase} 
              onChange={(e) => {
                setIsPlaying(false);
                setPhase(Number(e.target.value));
                if (Number(e.target.value) === PHASES.SCAN) setScanIndex(0);
              }}
              style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--primary)', height: 4 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Speed Controls */}
            <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 99, padding: 4, border: '1px solid var(--border)' }}>
              {[0.5, 1, 2].map(s => (
                <button 
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  style={{ 
                    background: speedMultiplier === s ? 'var(--primary)' : 'transparent',
                    color: speedMultiplier === s ? '#fff' : 'var(--muted)',
                    border: 'none', padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: speedMultiplier === s ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Playback Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button 
                onClick={reset} 
                disabled={phase === PHASES.SETUP && !isPlaying} 
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 8, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                title="Reset Simulation"
              >
                <RotateCcw size={20} />
              </button>
              
              <button 
                onClick={stepBackward} 
                disabled={phase === PHASES.SETUP} 
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', padding: 12, color: 'var(--text)', cursor: phase === PHASES.SETUP ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: phase === PHASES.SETUP ? 0.5 : 1 }}
                onMouseEnter={e => { if (phase !== PHASES.SETUP) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (phase !== PHASES.SETUP) e.currentTarget.style.background = 'var(--bg)'; }}
                title="Step Backward"
              >
                <SkipBack size={20} />
              </button>

              <button 
                onClick={togglePlay} 
                style={{ 
                  width: 64, height: 64, borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--primary), #8b5cf6)', 
                  border: 'none', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1.05)'}
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" style={{ marginLeft: 4 }} />}
              </button>
              
              <button 
                onClick={stepForward} 
                disabled={phase === PHASES.RESULT} 
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '50%', padding: 12, color: 'var(--text)', cursor: phase === PHASES.RESULT ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: phase === PHASES.RESULT ? 0.5 : 1 }}
                onMouseEnter={e => { if (phase !== PHASES.RESULT) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (phase !== PHASES.RESULT) e.currentTarget.style.background = 'var(--bg)'; }}
                title="Step Forward"
              >
                <SkipForward size={20} />
              </button>
            </div>
            
            <div style={{ width: 140 }}></div> {/* Spacer to balance speed controls */}

          </div>
        </div>

      </div>
    </div>
  );
}

const TablePreview = ({ name, cols, rows, color }) => (
  <div style={{ background: '#1e293b', borderRadius: 8, overflow: 'hidden', border: `1px solid ${color}40`, boxShadow: `0 10px 30px ${color}20` }}>
    <div style={{ padding: '8px 12px', background: `${color}20`, color, fontWeight: 'bold', fontSize: 14, textAlign: 'center', borderBottom: `1px solid ${color}40` }}>
      {name}
    </div>
    <table style={{ borderCollapse: 'collapse', color: '#fff', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#334155' }}>
          {cols.map((c, i) => <th key={i} style={{ padding: '6px 12px', borderBottom: '1px solid #475569', fontWeight: 600 }}>{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => <td key={ci} style={{ padding: '6px 12px', borderBottom: '1px solid #334155' }}>{String(cell)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
