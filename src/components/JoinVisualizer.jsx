import React, { useState, useEffect } from 'react';

const detectTablesAndJoins = (sql) => {
  // Remove subqueries by replacing text inside parentheses
  // A naive approach for visualization purposes.
  let cleanSql = sql.replace(/\([^)]+\)/g, '()');

  // Match FROM or JOIN followed by table name and optional alias
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

export const JoinVisualizer = ({ db, sql }) => {
  const [joinNodes, setJoinNodes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !sql) return;

    try {
      const { tables, joins } = detectTablesAndJoins(sql);
      
      if (joins.length === 0 || tables.length < 2) {
        setJoinNodes([]);
        return;
      }

      // Map joins to their corresponding left/right tables
      const nodes = joins.map((join, i) => {
        // Linear join assumption: join `i` connects table `i` and `i+1`
        // If there's a subquery alias we missed, this might be undefined, so fallback.
        const leftTable = tables[i] ? tables[i].name : 'Left';
        const rightTable = tables[i + 1] ? tables[i + 1].name : 'Right';
        const joinType = join.type === 'JOIN' ? 'INNER JOIN' : join.type;

        let leftTotal = 0;
        let rightTotal = 0;
        
        try {
          const lRes = db.exec(`SELECT COUNT(*) FROM ${leftTable}`);
          if (lRes.length) leftTotal = lRes[0].values[0][0];
        } catch(e) {}
        try {
          const rRes = db.exec(`SELECT COUNT(*) FROM ${rightTable}`);
          if (rRes.length) rightTotal = rRes[0].values[0][0];
        } catch(e) {}

        return {
          id: i,
          joinType,
          leftTable,
          rightTable,
          leftTotal,
          rightTotal,
        };
      });

      // Total result count for the ENTIRE query (we show this at the end)
      let finalRows = 0;
      try {
        const finalRes = db.exec(`SELECT COUNT(*) FROM (${sql})`);
        if (finalRes.length) finalRows = finalRes[0].values[0][0];
      } catch(e) {}

      setJoinNodes(nodes);
      setError(null);

    } catch (err) {
      console.error("Join Visualizer failed", err);
      setJoinNodes([]);
      setError("Could not parse joins for visualization.");
    }
  }, [db, sql]);

  if (error) return <div style={{ color: 'var(--error)', padding: 16 }}>{error}</div>;
  if (joinNodes.length === 0) return null;

  return (
    <div className="join-visualizer-panel" style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>🔗</span> Join Visualizer {joinNodes.length > 1 && `(${joinNodes.length} Joins)`}
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {joinNodes.map((node) => {
          const { joinType, leftTable, rightTable, leftTotal, rightTotal } = node;
          
          const isLeftFilled = ['LEFT JOIN', 'FULL JOIN'].includes(joinType);
          const isRightFilled = ['RIGHT JOIN', 'FULL JOIN'].includes(joinType);
          const isIntersectionFilled = true;
          const isCross = joinType === 'CROSS JOIN';

          return (
            <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              
              {/* Venn Diagram SVG */}
              <div style={{ width: '220px', height: '140px', position: 'relative', flexShrink: 0 }}>
                <svg viewBox="0 0 400 250" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <clipPath id={`leftCircle-${node.id}`}>
                      <circle cx="150" cy="120" r="100" />
                    </clipPath>
                  </defs>

                  {isCross ? (
                    <>
                      <rect x="50" y="20" width="100" height="200" fill="var(--primary-light)" stroke="var(--primary)" strokeWidth="2" />
                      <rect x="250" y="20" width="100" height="200" fill="var(--primary-light)" stroke="var(--primary)" strokeWidth="2" />
                      <text x="100" y="125" textAnchor="middle" fill="var(--primary)" fontWeight="bold" fontSize="40">×</text>
                      <text x="200" y="125" textAnchor="middle" fill="var(--text)" fontSize="20">=</text>
                      <text x="300" y="125" textAnchor="middle" fill="var(--primary)" fontWeight="bold" fontSize="24">M×N</text>
                    </>
                  ) : (
                    <>
                      {/* Left Circle */}
                      <circle 
                        cx="150" cy="120" r="100" 
                        fill={isLeftFilled ? "var(--primary-light)" : "transparent"} 
                        stroke="var(--primary)" strokeWidth="3" 
                      />
                      {/* Right Circle */}
                      <circle 
                        cx="250" cy="120" r="100" 
                        fill={isRightFilled ? "var(--success-muted)" : "transparent"} 
                        stroke="var(--success)" strokeWidth="3" 
                      />
                      {/* Intersection */}
                      <circle 
                        cx="250" cy="120" r="100" 
                        fill={isIntersectionFilled ? "var(--primary-muted)" : "transparent"} 
                        clipPath={`url(#leftCircle-${node.id})`} 
                      />

                      {/* Labels */}
                      <text x="110" y="125" textAnchor="middle" fill="var(--text)" fontWeight="600" fontSize="16">{leftTable}</text>
                      <text x="290" y="125" textAnchor="middle" fill="var(--text)" fontWeight="600" fontSize="16">{rightTable}</text>
                    </>
                  )}

                  {/* Join Type Label */}
                  <text x="200" y="240" textAnchor="middle" fill="var(--primary)" fontWeight="bold" fontSize="16" letterSpacing="1">{joinType}</text>
                </svg>
              </div>

              {/* Stats Text */}
              <div style={{ flex: 1, minWidth: '200px', fontSize: '13px', background: 'var(--surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '8px', fontWeight: 600, color: 'var(--text-secondary)' }}>Row Analysis</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px 16px' }}>
                  <span>Rows in <strong style={{ color: 'var(--primary)' }}>{leftTable}</strong>:</span>
                  <span style={{ fontWeight: 600 }}>{leftTotal}</span>
                  
                  <span>Rows in <strong style={{ color: 'var(--success)' }}>{rightTable}</strong>:</span>
                  <span style={{ fontWeight: 600 }}>{rightTotal}</span>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
};
