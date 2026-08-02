import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, X, AlertTriangle, SkipBack, SkipForward, FastForward } from 'lucide-react';
import { detectTablesAndJoins } from '@/utils/sqlJoinParser';

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-surface w-[500px] p-8 text-center rounded-2xl shadow-xl border border-border">
          <div className="bg-error/10 inline-flex items-center justify-center w-16 h-16 shrink-0 rounded-full mb-4">
            <AlertTriangle size={32} className="text-error" />
          </div>
          <h3 className="mb-3 text-xl font-bold">Cannot Animate Join</h3>
          <p className="text-muted mb-6">{error}</p>
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-surface w-[500px] p-10 text-center rounded-2xl shadow-xl border border-border">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-text">Analyzing SQL and buffering frames...</p>
        </div>
      </div>
    );
  }

  // Derived states for rendering
  const showCrossJoin = phase >= PHASES.CROSS_JOIN;
  const showFilter = phase >= PHASES.FILTER;
  const showOuter = phase >= PHASES.OUTER_RECOVERY;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-[90vw] max-w-[1200px] h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface">
          <div>
            <h2 className="text-lg font-bold m-0 flex items-center gap-2">
              ▶️ Cinematic Join Visualizer
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-primary-muted text-primary uppercase tracking-wider">{data.joinType}</span>
            </h2>
            <div className="text-[13px] text-muted mt-1 font-mono">ON {data.condition}</div>
          </div>
          <button className="btn btn-ghost w-10 h-10 rounded-full flex items-center justify-center p-0" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Cinematic Area */}
        <div className="flex-1 bg-slate-900 overflow-auto relative p-6 flex flex-col">
          
          {/* Top Phase Indicator */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/5 px-4 py-2 rounded-full flex gap-4 text-[13px] font-semibold text-slate-400">
              <span className={phase === PHASES.SETUP ? 'text-white' : ''}>1. Setup</span>
              <span>→</span>
              <span className={phase === PHASES.CROSS_JOIN ? 'text-white' : ''}>2. Cross Join</span>
              <span>→</span>
              <span className={phase === PHASES.SCAN ? 'text-blue-500' : ''}>3. Scan ON</span>
              <span>→</span>
              <span className={phase === PHASES.FILTER ? 'text-white' : ''}>4. Filter</span>
              {(data.joinType.includes('LEFT') || data.joinType.includes('RIGHT')) && (
                <>
                  <span>→</span>
                  <span className={phase === PHASES.OUTER_RECOVERY ? 'text-white' : ''}>5. Outer</span>
                </>
              )}
              <span>→</span>
              <span className={phase === PHASES.RESULT ? 'text-emerald-500' : ''}>Result</span>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-start">
            
            {/* Phase 0: Setup (Split Tables) */}
            {!showCrossJoin && (
              <div className="flex gap-16 items-center animate-[fadeIn_0.5s_ease]">
                <TablePreview name={data.leftTable} cols={data.leftCols} rows={data.leftRows} color="#3b82f6" />
                <div className="text-2xl text-muted font-bold">×</div>
                <TablePreview name={data.rightTable} cols={data.rightCols} rows={data.rightRows} color="#10b981" />
              </div>
            )}

            {/* Phase 1-5: Merged Grid (Cross Join -> Filter -> Outer -> Result) */}
            {showCrossJoin && (
              <div className="animate-[zoomIn_0.6s_cubic-bezier(0.16,1,0.3,1)] origin-top">
                <table className="border-collapse text-white text-[13px] bg-slate-800 rounded-lg overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                  <thead>
                    <tr>
                      <th colSpan={data.leftCols.length} className="bg-blue-900 p-2 border-r-2 border-slate-900">{data.leftTable}</th>
                      <th colSpan={data.rightCols.length} className="bg-emerald-900 p-2">{data.rightTable}</th>
                    </tr>
                    <tr className="bg-slate-700">
                      {data.leftCols.map((c, i) => <th key={`lc-${i}`} className={`px-3 py-2 border-b border-slate-600 ${i === data.leftCols.length-1 ? 'border-r-2 border-slate-900' : 'border-r border-slate-600'}`}>{c}</th>)}
                      {data.rightCols.map((c, i) => <th key={`rc-${i}`} className="px-3 py-2 border-b border-r border-slate-600">{c}</th>)}
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
                            <td key={`l-${i}`} className={`px-3 py-2 border-b border-slate-700 ${i === data.leftCols.length-1 ? 'border-r-2 border-slate-900' : 'border-r border-slate-700'}`}>
                              {String(c)}
                            </td>
                          ))}
                          {item.rightRow.map((c, i) => (
                            <td key={`r-${i}`} className={`px-3 py-2 border-b border-r border-slate-700 ${isLeftRecovered ? 'text-slate-500 italic' : ''}`}>
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
        <div className="px-8 py-5 bg-surface border-t border-border flex flex-col gap-5">
          
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted font-bold uppercase tracking-[0.05em]">Timeline</span>
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
              className="flex-1 cursor-pointer accent-primary h-1"
            />
          </div>

          <div className="flex items-center justify-between">
            
            {/* Speed Controls */}
            <div className="flex bg-bg rounded-full p-1 border border-border">
              {[0.5, 1, 2].map(s => (
                <button 
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 border-none ${
                    speedMultiplier === s 
                      ? 'bg-primary text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)]' 
                      : 'bg-transparent text-muted'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-4">
              <button 
                onClick={reset} 
                disabled={phase === PHASES.SETUP && !isPlaying} 
                className="bg-transparent border-none text-muted cursor-pointer p-2 transition-colors hover:text-text disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset Simulation"
              >
                <RotateCcw size={20} />
              </button>
              
              <button 
                onClick={stepBackward} 
                disabled={phase === PHASES.SETUP} 
                className={`bg-bg border border-border rounded-full p-3 text-text transition-all duration-200 ${
                  phase === PHASES.SETUP ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-surface-2'
                }`}
                title="Step Backward"
              >
                <SkipBack size={20} />
              </button>

              <button 
                onClick={togglePlay} 
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 border-none text-white cursor-pointer flex items-center justify-center shadow-[0_8px_24px_rgba(59,130,246,0.4)] transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
              
              <button 
                onClick={stepForward} 
                disabled={phase === PHASES.RESULT} 
                className={`bg-bg border border-border rounded-full p-3 text-text transition-all duration-200 ${
                  phase === PHASES.RESULT ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-surface-2'
                }`}
                title="Step Forward"
              >
                <SkipForward size={20} />
              </button>
            </div>
            
            <div className="w-[140px]"></div> {/* Spacer to balance speed controls */}

          </div>
        </div>

      </div>
    </div>
  );
}

const TablePreview = ({ name, cols, rows, color }) => (
  <div className="bg-slate-800 rounded-lg overflow-hidden shadow-xl" style={{ border: `1px solid ${color}40`, boxShadow: `0 10px 30px ${color}20` }}>
    <div className="px-3 py-2 font-bold text-sm text-center" style={{ background: `${color}20`, color, borderBottom: `1px solid ${color}40` }}>
      {name}
    </div>
    <table className="border-collapse text-white text-[13px]">
      <thead>
        <tr className="bg-slate-700">
          {cols.map((c, i) => <th key={i} className="px-3 py-1.5 border-b border-slate-600 font-semibold">{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => <td key={ci} className="px-3 py-1.5 border-b border-slate-700">{String(cell)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
