import React, { useState, useEffect } from 'react';

const JoinVennDiagram = ({ joinType }) => {
  const type = (joinType || '').toUpperCase();
  const isLeft = type.includes('LEFT');
  const isRight = type.includes('RIGHT');
  const isOuter = type.includes('FULL') || type.includes('OUTER');
  const isInner = type.includes('INNER') || type === 'JOIN';
  
  return (
    <svg width="64" height="40" viewBox="0 0 64 40" style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <clipPath id={`clip-right-${type.replace(/\s+/g, '-')}`}>
          <circle cx="40" cy="20" r="16" />
        </clipPath>
      </defs>
      <circle cx="24" cy="20" r="16" fill="transparent" stroke="var(--primary)" strokeWidth="2" opacity="0.4" />
      <circle cx="40" cy="20" r="16" fill="transparent" stroke="var(--success)" strokeWidth="2" opacity="0.4" />
      
      {(isLeft || isOuter) && <circle cx="24" cy="20" r="16" fill="var(--primary)" opacity="0.3" />}
      {(isRight || isOuter) && <circle cx="40" cy="20" r="16" fill="var(--success)" opacity="0.3" />}
      
      {(isInner || isLeft || isRight || isOuter) && (
        <circle cx="24" cy="20" r="16" fill="var(--text)" opacity="0.5" clipPath={`url(#clip-right-${type.replace(/\s+/g, '-')})`} />
      )}
    </svg>
  );
};

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
      condition: match[3] ? match[3].replace(/;+\s*$/, '').trim() : null,
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
          let leftTotal = 0, rightTotal = 0, matchTotal = 0;
          try {
            const lRes = await executeQuery(`SELECT COUNT(*) FROM ${cumulativeJoinSql}`);
            if (lRes?.rows) leftTotal = lRes.rows[0][0];
            const rRes = await executeQuery(`SELECT COUNT(*) FROM ${rightTableName}`);
            if (rRes?.rows) rightTotal = rRes.rows[0][0];
            
            const mRes = await executeQuery(`SELECT COUNT(*) FROM ${currentJoinSql}`);
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
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface-2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
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
                 <svg style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
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
                          <div style={{ width: 50, height: 50, borderRadius: '16px', background: 'var(--surface-2)', color: 'var(--primary)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', boxShadow: isActive ? '0 0 0 4px rgba(59,130,246,0.1)' : 'none', transition: 'all 0.2s' }}>
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
              <div style={{ marginTop: 40, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Final Output</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>{finalRows.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Rows Generated</div>
              </div>
            )}
          </div>

          {/* Right Column: Multi-Step Join Simulator */}
          <div style={{ flex: 1, minWidth: 0, padding: '24px 32px', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
            {!activeStep ? (
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', textAlign: 'center', background: 'var(--bg)', borderRadius: '24px', border: '1px solid var(--border)' }}>
                 <svg style={{ width: 48, height: 48, marginBottom: 24, color: 'var(--primary)', opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
                 <h3 style={{ fontSize: 20, color: 'var(--text)', marginBottom: 12 }}>Select a Join Step</h3>
                 <p style={{ maxWidth: 300, lineHeight: 1.6 }}>Click on any step in the pipeline to the left to inspect exactly how the database engine executes this join.</p>
               </div>
            ) : (
              <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <JoinVennDiagram joinType={activeStep.joinType} />
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{activeStep.joinType} Execution</h3>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Educational Sample (5 rows extracted from the {activeStep.stats.matchTotal.toLocaleString()} total matches to demonstrate mechanics)</div>
                    </div>
                  </div>
                  
                  {/* Sub-step navigation */}
                  <div style={{ display: 'flex', background: 'var(--surface-2)', padding: 4, borderRadius: 12, gap: 4 }}>
                    {[
                      { id: 1, name: '1. Inputs' },
                      { id: 2, name: '2. Cross Join' },
                      { id: 3, name: '3. Filter ON' },
                      { id: 4, name: '4. Join Result' }
                    ].map(step => (
                      <button 
                        key={step.id}
                        onClick={() => setActiveSubStep(step.id)}
                        style={{
                          padding: '8px 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                          background: activeSubStep === step.id ? 'var(--primary)' : 'transparent',
                          color: activeSubStep === step.id ? 'white' : 'var(--text)',
                          boxShadow: activeSubStep === step.id ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                        }}
                      >
                        {step.name}
                      </button>
                    ))}
                  </div>
                </div>

                {simulatorData.loading ? (
                   <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ width: 40, height: 40, border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                   </div>
                ) : (
                  <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg)', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
                    
                    {activeSubStep === 1 && (
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
                        <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}><strong>Step 1:</strong> The database engine fetches the relevant rows from the left and right tables into memory.</p>
                        <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Table A ({activeStep.leftTable})</div>
                            {simulatorData.left && (
                              <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)' }}>
                                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
                                  <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-2)' }}>
                                    <tr>{simulatorData.left.columns.map((c,i) => <th key={i} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{c}</th>)}</tr>
                                  </thead>
                                  <tbody>
                                    {simulatorData.left.rows.map((r,i) => (
                                      <tr key={i}>
                                        {r.map((v,j) => (
                                          <td key={j} style={{padding:'8px 12px', borderBottom:'1px solid var(--border)'}}>{v === null ? <span style={{opacity:0.5}}>NULL</span> : String(v)}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{ fontWeight: 700, color: 'var(--success)' }}>Table B ({activeStep.rightTable})</div>
                            {simulatorData.right && (
                              <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)' }}>
                                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
                                  <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-2)' }}>
                                    <tr>{simulatorData.right.columns.map((c,i) => <th key={i} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{c}</th>)}</tr>
                                  </thead>
                                  <tbody>
                                    {simulatorData.right.rows.map((r,i) => (
                                      <tr key={i}>
                                        {r.map((v,j) => (
                                          <td key={j} style={{padding:'8px 12px', borderBottom:'1px solid var(--border)'}}>{v === null ? <span style={{opacity:0.5}}>NULL</span> : String(v)}</td>
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
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
                        <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}><strong>Step 2 (Cartesian Product):</strong> Before evaluating conditions, the engine conceptually pairs <em>every</em> row from A with <em>every</em> row from B. Notice this generates {simulatorData.left?.rows.length * simulatorData.right?.rows.length} combinations!</p>
                        {simulatorData.cross && (
                          <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)' }}>
                            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
                              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-2)' }}>
                                <tr>{simulatorData.cross.columns.map((c,i) => <th key={i} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{c}</th>)}</tr>
                              </thead>
                              <tbody>
                                {simulatorData.cross.rows.map((r,i) => (
                                  <tr key={i}>
                                    {r.map((v,j) => (
                                      <td key={j} style={{padding:'8px 12px', borderBottom:'1px solid var(--border)'}}>{v === null ? <span style={{opacity:0.5}}>NULL</span> : String(v)}</td>
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
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
                        <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}><strong>Step 3 (Condition Filter):</strong> The engine evaluates the <code style={{color: 'var(--primary)'}}>ON {activeStep.condition || 'TRUE'}</code> condition for each combination.</p>
                        {simulatorData.evaluated && (
                          <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)' }}>
                            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
                              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-2)' }}>
                                <tr>
                                  {simulatorData.evaluated.columns.slice(0, -1).map((c,i) => <th key={i} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{c}</th>)}
                                  <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>Passed?</th>
                                </tr>
                              </thead>
                              <tbody>
                                {simulatorData.evaluated.rows.map((r,i) => {
                                  const isMatch = r[r.length - 1] === 1;
                                  return (
                                    <tr key={i} style={{ background: isMatch ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.05)', opacity: isMatch ? 1 : 0.6 }}>
                                      {r.slice(0, -1).map((v,j) => (
                                        <td key={j} style={{padding:'8px 12px', borderBottom:'1px solid var(--border)'}}>{v === null ? <span style={{opacity:0.5}}>NULL</span> : String(v)}</td>
                                      ))}
                                      <td style={{padding:'8px 12px', borderBottom:'1px solid var(--border)', textAlign: 'center'}}>
                                        {isMatch ? (
                                          <svg style={{width: 16, height: 16, color: 'var(--success)', margin: '0 auto'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        ) : (
                                          <svg style={{width: 16, height: 16, color: 'var(--error)', margin: '0 auto'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>
                        <p style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}><strong>Step 4 (Join Result):</strong> The rows that passed the filter are returned. This intermediate result (which has {activeStep.stats.matchTotal.toLocaleString()} total rows) is then passed to the next stages of your query (like GROUP BY or LIMIT). We are showing a 5-row sample here.</p>
                        {simulatorData.finalResult && (
                          <div style={{ flex: 1, overflow: 'auto', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)' }}>
                            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
                              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface-2)' }}>
                                <tr>{simulatorData.finalResult.columns.map((c,i) => <th key={i} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>{c}</th>)}</tr>
                              </thead>
                              <tbody>
                                {simulatorData.finalResult.rows.map((r,i) => (
                                  <tr key={i} style={{ background: 'rgba(34,197,94,0.05)' }}>
                                    {r.map((v,j) => (
                                      <td key={j} style={{padding:'8px 12px', borderBottom:'1px solid var(--border)'}}>{v === null ? <span style={{color:'var(--muted)', fontStyle:'italic'}}>NULL</span> : String(v)}</td>
                                    ))}
                                  </tr>
                                ))}
                                {simulatorData.finalResult.rows.length === 0 && (
                                  <tr><td colSpan={100} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No matches found in this sample.</td></tr>
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
