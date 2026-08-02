import React, { useState, useEffect } from 'react';

import { detectTablesAndJoins } from '@/utils/sqlJoinParser';
import { JoinVennDiagram } from './JoinVennDiagram';

export function JoinAnalysisModal({ executeQuery, sql, onClose }) {
  const [joinNodes, setJoinNodes] = useState([]);
  const [error, setError] = useState(null);
  const [finalRows, setFinalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Split-View Simulator States
  const [activeStep, setActiveStep] = useState(null);
  const [simulatorData, setSimulatorData] = useState({ left: null, right: null, loading: false });

  
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
        let cumulativeJoinSql = `${tables[0].name} ${tables[0].alias !== tables[0].name ? `AS ${tables[0].alias}` : ''}`;
        let cumulativeAliases = [tables[0].alias || tables[0].name];

        for (let i = 0; i < joins.length; i++) {
          const join = joins[i];
          const rightTableMatch = tables.find(t => t.name === join.rightTable && t.index >= join.index);
          const rightTableName = join.rightTable;
          const rightTableAlias = rightTableMatch?.alias || rightTableName;
          
          const joinType = join.type === 'JOIN' ? 'INNER JOIN' : join.type;
          
          let currentJoinSql = `${cumulativeJoinSql} ${joinType} ${rightTableName} ${rightTableAlias !== rightTableName ? `AS ${rightTableAlias}` : ''}`;
          if (join.condition) currentJoinSql += ` ON ${join.condition}`;
          
          // Execute stats
          // Execute stats with a 1500ms bailout timeout to prevent blocking the worker on huge joins
          let leftTotal = 0, rightTotal = 0, matchTotal = 0;
          
          const executeWithTimeout = async (query) => {
            return Promise.race([
              executeQuery(query),
              new Promise((resolve) => setTimeout(() => resolve(null), 1500))
            ]);
          };

          try {
            const lRes = await executeWithTimeout(`SELECT COUNT(*) FROM ${cumulativeJoinSql}`);
            if (lRes?.rows) leftTotal = lRes.rows[0][0];
            const rRes = await executeWithTimeout(`SELECT COUNT(*) FROM ${rightTableName}`);
            if (rRes?.rows) rightTotal = rRes.rows[0][0];
            
            const mRes = await executeWithTimeout(`SELECT COUNT(*) FROM ${currentJoinSql}`);
            if (mRes?.rows) matchTotal = mRes.rows[0][0];
          } catch(e) { console.error("Stats query failed", e); }

          nodes.push({
            id: i,
            joinType,
            leftTable: i === 0 ? tables[0].name : `Step ${i} Result`,
            leftAlias: null,
            rightTable: rightTableName,
            rightAlias: rightTableAlias,
            condition: join.condition,
            stats: { leftTotal, rightTotal, matchTotal },
            leftSql: cumulativeJoinSql,
            leftAliases: [...cumulativeAliases]
          });
          
          cumulativeJoinSql = currentJoinSql;
          cumulativeAliases.push(rightTableAlias);
        }

        let fr = 0;
        try {
          const cleanForSubquery = sql.trim().replace(/;+\s*$/, '');
          const finalRes = await executeQuery(`SELECT COUNT(*) FROM (${cleanForSubquery}) AS _final_count`);
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

  const [activeSubStep, setActiveSubStep] = useState(1);

  const handleStepClick = async (node) => {
    setActiveStep(node);
    setActiveSubStep(1);
    setSimulatorData({ left: null, right: null, loading: true });
    
    try {
      const limit = 5;
      const lAlias = node.leftAlias || node.leftTable;
      const rAlias = node.rightAlias || node.rightTable;
      const cond = node.condition || '1=1';

      // Smart Sampling using EXISTS to isolate columns without polluting aliases
      // Left side: sample from cumulative leftSql, filtering for matches in rightTable
      const aSub = `
        SELECT * FROM (SELECT * FROM ${node.leftSql} 
        WHERE EXISTS (SELECT 1 FROM ${node.rightTable} AS ${rAlias} WHERE ${cond}) 
        LIMIT 3)
        UNION ALL
        SELECT * FROM (SELECT * FROM ${node.leftSql} 
        WHERE NOT EXISTS (SELECT 1 FROM ${node.rightTable} AS ${rAlias} WHERE ${cond}) 
        LIMIT 2)
      `;

      // Right side: sample from rightTable, filtering for matches in leftSql
      const bSub = `
        SELECT * FROM (SELECT * FROM ${node.rightTable} AS ${rAlias}
        WHERE EXISTS (SELECT 1 FROM ${node.leftSql} WHERE ${cond})
        LIMIT 3)
        UNION ALL
        SELECT * FROM (SELECT * FROM ${node.rightTable} AS ${rAlias}
        WHERE NOT EXISTS (SELECT 1 FROM ${node.leftSql} WHERE ${cond})
        LIMIT 2)
      `;

      const leftRes = await executeQuery(aSub);
      const rightRes = await executeQuery(bSub);
      
      const aSubAliased = `(${aSub})`;
      const bSubAliased = `(${bSub})`;

      const leftCols = leftRes?.columns || [];
      const leftRows = leftRes?.rows || [];
      const rightCols = rightRes?.columns || [];
      const rightRows = rightRes?.rows || [];

      let crossCols = [], crossRows = [];
      let evalCols = [], evalRows = [];
      let finalCols = [], finalRows = [];

      if (leftRows.length > 0 && rightRows.length > 0) {
        // Rewrite condition to use _left and _right for cross join evaluation
        let rewrittenCond = cond;
        if (node.leftAliases) {
          node.leftAliases.forEach(alias => {
            const regex = new RegExp(`\\b${alias}\\.`, 'g');
            rewrittenCond = rewrittenCond.replace(regex, '_left.');
          });
        }
        const regexR = new RegExp(`\\b${rAlias}\\.`, 'g');
        rewrittenCond = rewrittenCond.replace(regexR, '_right.');

        // Cross Join
        const crossSql = `SELECT _left.*, _right.* FROM ${aSubAliased} AS _left CROSS JOIN ${bSubAliased} AS _right`;
        const safeCrossRes = await executeQuery(crossSql);
        if (!safeCrossRes?.error) {
           crossCols = safeCrossRes.columns || [];
           crossRows = safeCrossRes.rows || [];
        }

        // Eval ON Condition
        const evalSql = `SELECT _left.*, _right.*, CASE WHEN (${rewrittenCond}) THEN 1 ELSE 0 END AS _is_match FROM ${aSubAliased} AS _left CROSS JOIN ${bSubAliased} AS _right`;
        const safeEvalRes = await executeQuery(evalSql);
        if (!safeEvalRes?.error) {
           evalCols = safeEvalRes.columns || [];
           evalRows = safeEvalRes.rows || [];
        }

        // Final Result
        const finalSql = `SELECT _left.*, _right.* FROM ${aSubAliased} AS _left ${node.joinType} ${bSubAliased} AS _right ${node.condition ? `ON ${rewrittenCond}` : ''}`;
        const safeFinalRes = await executeQuery(finalSql);
        if (!safeFinalRes?.error) {
           finalCols = safeFinalRes.columns || [];
           finalRows = safeFinalRes.rows || [];
        }
      }

      setSimulatorData({
        left: { columns: leftCols, rows: leftRows },
        right: { columns: rightCols, rows: rightRows },
        cross: { columns: crossCols, rows: crossRows },
        evaluated: { columns: evalCols, rows: evalRows },
        finalResult: { columns: finalCols, rows: finalRows },
        loading: false
      });
    } catch(e) {
      setSimulatorData({ left: null, right: null, loading: false });
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]" onClick={e => e.target === e.currentTarget && onClose()}>
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

      <div className="modal-content w-[95vw] h-[90vh] max-w-[1600px] p-0 flex flex-col overflow-hidden bg-surface rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.2)] animate-[slideUp_0.4s_cubic-bezier(0.2,0.8,0.2,1)]">
        
        {/* Header */}
        <div className="px-8 py-5 bg-surface border-b border-border flex justify-between items-center shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-surface-2 text-primary flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            </div>
            <div>
              <h2 className="m-0 text-[22px] font-extrabold bg-gradient-to-r from-text to-text-secondary bg-clip-text text-transparent">Join Simulator</h2>
              <div className="text-[13px] text-muted mt-1">Interactive visualizer for SQL relationships</div>
            </div>
          </div>
          <button className="btn btn-ghost w-10 h-10 rounded-full flex items-center justify-center bg-surface-2 p-0 text-sm" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex overflow-hidden bg-bg">
          
          {/* Left Column: Pipeline Steps */}
          <div className="w-[450px] shrink-0 flex flex-col border-r border-border bg-surface overflow-y-auto p-6 relative">
            {isLoading ? (
              <div className="m-auto text-center text-muted">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                Analyzing Query...
              </div>
            ) : error ? (
               <div className="p-5 bg-error/10 text-error rounded-xl">{error}</div>
            ) : joinNodes.length === 0 ? (
               <div className="p-10 text-center text-muted bg-surface-2 rounded-2xl">
                 <svg className="w-12 h-12 mx-auto mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                 No standard JOINs detected.<br/>Try querying multiple tables!
               </div>
            ) : (
              joinNodes.map((node, idx) => {
                const isActive = activeStep?.id === node.id;
                const { joinType, leftTable, rightTable, stats, condition } = node;
                
                return (
                  <div key={node.id} className="relative">
                    <div 
                      className={`step-card bg-bg rounded-2xl p-6 relative z-10 ${isActive ? 'active' : ''}`}
                      onClick={() => handleStepClick(node)}
                    >
                      <div className="flex justify-between items-center mb-5">
                        <div className="bg-primary-muted text-primary px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-[0.5px]">
                          STEP {idx + 1}
                        </div>
                        <div className="text-sm font-extrabold text-text">
                          {joinType}
                        </div>
                      </div>

                      <div className="flex items-center justify-between relative">
                        {/* Connecting line behind circles */}
                        <svg className="absolute top-[30px] left-[40px] right-[40px] h-1 w-[calc(100%-80px)] z-0">
                           <line x1="0" y1="2" x2="100%" y2="2" stroke="var(--primary-muted)" strokeWidth="4" strokeDasharray="8 6" style={{ animation: isActive ? 'dashFlow 1s linear infinite' : 'none' }} />
                        </svg>

                        {/* Left Node */}
                        <div className="text-center z-10 bg-bg px-2">
                          <div className="w-16 h-16 rounded-full bg-surface border-4 border-blue-500 flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(59,130,246,0.2)]">
                            <span className="text-xl text-blue-500 font-extrabold">A</span>
                          </div>
                          <div className="text-[13px] font-bold text-text">{leftTable}</div>
                          <div className="text-[11px] text-muted">{stats.leftTotal.toLocaleString()} rows</div>
                        </div>

                        {/* Intersection / Join Type */}
                        <div className="text-center z-10 bg-bg px-3">
                          <div className={`w-12 h-12 rounded-2xl bg-surface-2 text-primary border-2 border-primary flex items-center justify-center mx-auto mb-2 transition-all ${isActive ? 'shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : ''}`}>
                            <span className="text-2xl">⋈</span>
                          </div>
                          <div className="text-xs font-bold text-primary">{stats.matchTotal.toLocaleString()}</div>
                          <div className="text-[10px] text-muted">Matches</div>
                        </div>

                        {/* Right Node */}
                        <div className="text-center z-10 bg-bg px-2">
                          <div className="w-16 h-16 rounded-full bg-surface border-4 border-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-[0_4px_12px_rgba(16,185,129,0.2)]">
                            <span className="text-xl text-emerald-500 font-extrabold">B</span>
                          </div>
                          <div className="text-[13px] font-bold text-text">{rightTable}</div>
                          <div className="text-[11px] text-muted">{stats.rightTotal.toLocaleString()} rows</div>
                        </div>
                      </div>

                      {/* Condition snippet */}
                      {condition && (
                        <div className="mt-6 px-4 py-3 bg-surface rounded-xl border border-border text-xs font-mono text-text-secondary">
                          <span className="text-primary font-bold">ON</span> {condition}
                        </div>
                      )}
                    </div>

                    {idx < joinNodes.length - 1 && (
                      <div className="h-10 w-full relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-border" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2.5 h-2.5 border-b-2 border-r-2 border-border" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {!isLoading && !error && joinNodes.length > 0 && (
              <div className="mt-10 bg-surface border border-border rounded-2xl p-6 text-center">
                <div className="text-[13px] font-bold text-muted uppercase tracking-widest">Final Output</div>
                <div className="text-5xl font-extrabold text-text mt-2">{finalRows.toLocaleString()}</div>
                <div className="text-[13px] text-muted mt-1">Rows Generated</div>
              </div>
            )}
          </div>

          {/* Right Column: Multi-Step Join Simulator */}
          <div className="flex-1 min-w-0 px-8 py-6 flex flex-col bg-surface">
            {!activeStep ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center text-muted bg-bg rounded-2xl border border-border">
                 <svg className="w-12 h-12 mb-6 text-primary opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
                 <h3 className="text-xl text-text mb-3 m-0">Select a Join Step</h3>
                 <p className="max-w-[300px] leading-relaxed m-0">Click on any step in the pipeline to the left to inspect exactly how the database engine executes this join.</p>
               </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col animate-[fadeIn_0.3s_ease]">
                <div className="flex justify-between items-center mb-5 shrink-0">
                  <div className="flex items-center gap-4">
                    <JoinVennDiagram joinType={activeStep.joinType} />
                    <div>
                      <h3 className="text-xl font-extrabold text-text m-0">{activeStep.joinType} Execution</h3>
                      <div className="text-[13px] text-muted mt-1">Educational Sample (5 rows extracted from the {activeStep.stats.matchTotal.toLocaleString()} total matches to demonstrate mechanics)</div>
                    </div>
                  </div>
                  
                  {/* Sub-step navigation */}
                  <div className="flex bg-surface-2 p-1 rounded-xl gap-1">
                    {[
                      { id: 1, name: '1. Inputs' },
                      { id: 2, name: '2. Cross Join' },
                      { id: 3, name: '3. Filter ON' },
                      { id: 4, name: '4. Join Result' }
                    ].map(step => (
                      <button 
                        key={step.id}
                        onClick={() => setActiveSubStep(step.id)}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer border-none transition-all ${
                          activeSubStep === step.id 
                            ? 'bg-primary text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]' 
                            : 'bg-transparent text-text hover:bg-surface-3'
                        }`}
                      >
                        {step.name}
                      </button>
                    ))}
                  </div>
                </div>

                {simulatorData.loading ? (
                   <div className="flex-1 flex items-center justify-center">
                     <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                   </div>
                ) : (
                  <div className="flex-1 min-h-0 flex flex-col gap-4 bg-bg p-6 rounded-2xl border border-border">
                    
                    {activeSubStep === 1 && (
                      <div className="flex flex-col h-full gap-4">
                        <p className="m-0 text-sm text-text"><strong>Step 1:</strong> The database engine fetches the relevant rows from the left and right tables into memory.</p>
                        <div className="flex gap-4 flex-1 min-h-0">
                          <div className="flex-1 flex flex-col gap-2">
                            <div className="font-bold text-primary">Table A ({activeStep.leftTable})</div>
                            {simulatorData.left && (
                              <div className="flex-1 overflow-auto border border-border rounded-lg bg-surface">
                                <table className="w-full text-xs border-collapse text-left">
                                  <thead className="sticky top-0 bg-surface-2">
                                    <tr>{simulatorData.left.columns.map((c,i) => <th key={i} className="px-3 py-2 border-b border-border text-text-secondary">{c}</th>)}</tr>
                                  </thead>
                                  <tbody>
                                    {simulatorData.left.rows.map((r,i) => (
                                      <tr key={i} className="table-row-hover border-b border-border last:border-0">
                                        {r.map((v,j) => (
                                          <td key={j} className="px-3 py-2 text-text font-mono">{v === null ? <span className="opacity-50">NULL</span> : String(v)}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col gap-2">
                            <div className="font-bold text-success">Table B ({activeStep.rightTable})</div>
                            {simulatorData.right && (
                              <div className="flex-1 overflow-auto border border-border rounded-lg bg-surface">
                                <table className="w-full text-xs border-collapse text-left">
                                  <thead className="sticky top-0 bg-surface-2">
                                    <tr>{simulatorData.right.columns.map((c,i) => <th key={i} className="px-3 py-2 border-b border-border text-text-secondary">{c}</th>)}</tr>
                                  </thead>
                                  <tbody>
                                    {simulatorData.right.rows.map((r,i) => (
                                      <tr key={i} className="table-row-hover border-b border-border last:border-0">
                                        {r.map((v,j) => (
                                          <td key={j} className="px-3 py-2 text-text font-mono">{v === null ? <span className="opacity-50">NULL</span> : String(v)}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSubStep === 2 && (
                      <div className="flex flex-col h-full gap-4">
                        <p className="m-0 text-sm text-text"><strong>Step 2 (Cartesian Product):</strong> Before evaluating conditions, the engine conceptually pairs <em>every</em> row from A with <em>every</em> row from B. Notice this generates {simulatorData.left?.rows.length * simulatorData.right?.rows.length} combinations!</p>
                        {simulatorData.cross && (
                          <div className="flex-1 overflow-auto border border-border rounded-lg bg-surface">
                            <table className="w-full text-xs border-collapse text-left">
                              <thead className="sticky top-0 bg-surface-2">
                                <tr>{simulatorData.cross.columns.map((c,i) => <th key={i} className="px-3 py-2 border-b border-border text-text-secondary">{c}</th>)}</tr>
                              </thead>
                              <tbody>
                                {simulatorData.cross.rows.map((r,i) => (
                                  <tr key={i} className="table-row-hover border-b border-border last:border-0">
                                    {r.map((v,j) => (
                                      <td key={j} className="px-3 py-2 text-text font-mono">{v === null ? <span className="opacity-50">NULL</span> : String(v)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {activeSubStep === 3 && (
                      <div className="flex flex-col h-full gap-4">
                        <p className="m-0 text-sm text-text"><strong>Step 3 (Condition Filter):</strong> The engine evaluates the <code className="text-primary bg-surface-2 px-1.5 py-0.5 rounded">ON {activeStep.condition || 'TRUE'}</code> condition for each combination.</p>
                        {simulatorData.evaluated && (
                          <div className="flex-1 overflow-auto border border-border rounded-lg bg-surface">
                            <table className="w-full text-xs border-collapse text-left">
                              <thead className="sticky top-0 bg-surface-2">
                                <tr>
                                  {simulatorData.evaluated.columns.slice(0, -1).map((c,i) => <th key={i} className="px-3 py-2 border-b border-border text-text-secondary">{c}</th>)}
                                  <th className="px-3 py-2 border-b border-border text-center text-text-secondary">Passed?</th>
                                </tr>
                              </thead>
                              <tbody>
                                {simulatorData.evaluated.rows.map((r,i) => {
                                  const isMatch = r[r.length - 1] === 1;
                                  return (
                                    <tr key={i} className={`border-b border-border last:border-0 ${isMatch ? 'bg-success/10 opacity-100' : 'bg-error/5 opacity-60'}`}>
                                      {r.slice(0, -1).map((v,j) => (
                                        <td key={j} className="px-3 py-2 text-text font-mono">{v === null ? <span className="opacity-50">NULL</span> : String(v)}</td>
                                      ))}
                                      <td className="px-3 py-2 text-center">
                                        {isMatch ? (
                                          <svg className="w-4 h-4 text-success mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        ) : (
                                          <svg className="w-4 h-4 text-error mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {activeSubStep === 4 && (
                      <div className="flex flex-col h-full gap-4">
                        <p className="m-0 text-sm text-text"><strong>Step 4 (Join Result):</strong> The rows that passed the filter are returned. This intermediate result (which has {activeStep.stats.matchTotal.toLocaleString()} total rows) is then passed to the next stages of your query (like GROUP BY or LIMIT). We are showing a 5-row sample here.</p>
                        {simulatorData.finalResult && (
                          <div className="flex-1 overflow-auto border border-border rounded-lg bg-surface">
                            <table className="w-full text-xs border-collapse text-left">
                              <thead className="sticky top-0 bg-surface-2">
                                <tr>{simulatorData.finalResult.columns.map((c,i) => <th key={i} className="px-3 py-2 border-b border-border text-text-secondary">{c}</th>)}</tr>
                              </thead>
                              <tbody>
                                {simulatorData.finalResult.rows.map((r,i) => (
                                  <tr key={i} className="bg-success/5 border-b border-border last:border-0">
                                    {r.map((v,j) => (
                                      <td key={j} className="px-3 py-2 text-text font-mono">{v === null ? <span className="text-muted italic">NULL</span> : String(v)}</td>
                                    ))}
                                  </tr>
                                ))}
                                {simulatorData.finalResult.rows.length === 0 && (
                                  <tr><td colSpan={100} className="p-10 text-center text-muted">No matches found in this sample.</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

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
