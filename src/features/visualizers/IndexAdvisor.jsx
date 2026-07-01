import React, { useState, useEffect } from 'react';
import { getIndexInfo } from '@/utils/sqlAnalysis';
import { Zap, AlertTriangle, FileCode2, CheckCircle2 } from 'lucide-react';

export const IndexAdvisor = ({ executeQuery, sql, refreshTrigger = 0 }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localTrigger, setLocalTrigger] = useState(0);

  useEffect(() => {
    let mounted = true;
    if (!executeQuery || !sql) return;

    const analyze = async () => {
      setLoading(true);
      try {
        const planRes = await executeQuery(`EXPLAIN QUERY PLAN ${sql}`);
        const plan = planRes.rows || [];
        
        const tablesUsed = new Set();
        const usedIndexes = new Set();
        const fullScans = new Set();

        plan.forEach(step => {
          const detail = step[3] || '';
          
          const scanMatch = detail.match(/SCAN TABLE\s+([a-zA-Z0-9_]+)/i) || detail.match(/SCAN\s+([a-zA-Z0-9_]+)/i);
          if (scanMatch) {
            fullScans.add(scanMatch[1]);
            tablesUsed.add(scanMatch[1]);
          }

          const searchMatch = detail.match(/SEARCH TABLE\s+([a-zA-Z0-9_]+)/i) || detail.match(/SEARCH\s+([a-zA-Z0-9_]+)/i);
          if (searchMatch) {
            tablesUsed.add(searchMatch[1]);
            const index = detail.match(/INDEX\s+([a-zA-Z0-9_]+)/i)?.[1];
            if (index) usedIndexes.add(index);
          }
        });

        // Heuristically find columns to index for scanned tables
        const recommendations = [];
        for (const table of fullScans) {
          const colInfo = await executeQuery(`PRAGMA table_info(${table})`);
          if (colInfo.rows) {
            const cols = colInfo.rows.map(r => r[1]); // Column names
            // Find which of these columns appear in the SQL (simple heuristic)
            const upperSql = sql.toUpperCase();
            
            // Prioritize columns used in WHERE, ON, or ORDER BY
            const clauses = sql.match(/(?:WHERE|ON|ORDER BY)\s+([^;]+)/i);
            const focusSql = clauses ? clauses[1] : sql;
            
            const candidateCols = cols.filter(col => {
              return new RegExp(`\\b${col}\\b`, 'i').test(focusSql) && col.toLowerCase() !== 'id'; 
            });

            if (candidateCols.length > 0) {
              const bestCol = candidateCols[0];
              recommendations.push({
                table,
                column: bestCol,
                sql: `CREATE INDEX idx_${table}_${bestCol} ON ${table}(${bestCol});`
              });
            } else {
               // Fallback to first non-ID column
               const fallback = cols.find(c => c.toLowerCase() !== 'id') || cols[0];
               if (fallback) {
                 recommendations.push({
                   table,
                   column: fallback,
                   sql: `CREATE INDEX idx_${table}_${fallback} ON ${table}(${fallback});`
                 });
               }
            }
          }
        }

        let availableIndexes = [];
        for (const table of tablesUsed) {
          const idxInfo = await getIndexInfo(executeQuery, table);
          availableIndexes = availableIndexes.concat(idxInfo);
        }

        if (mounted) {
          setAnalysis({
            availableIndexes,
            usedIndexes: Array.from(usedIndexes),
            fullScans: Array.from(fullScans),
            recommendations
          });
        }

      } catch (err) {
        console.error("Index Advisor analysis failed", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    analyze();
    return () => { mounted = false; };
  }, [executeQuery, sql, refreshTrigger, localTrigger]);

  if (loading) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>Analyzing Execution Plan...</div>;
  if (!analysis) return null;

  const hasScans = analysis.fullScans.length > 0;

  return (
    <div style={{ padding: '24px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', padding: 10, borderRadius: 10 }}>
          <Zap size={20} color="#fff" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>AI Index Advisor</h3>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Analyzes full table scans to recommend indexes.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Performance Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Diagnostic Results</h4>
          
          {hasScans ? (
            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3b82f6', fontWeight: 700, marginBottom: '8px' }}>
                <Zap size={18} /> Optimization Opportunity
              </div>
              <div style={{ marginBottom: '12px', fontSize: 13, color: 'var(--text)' }}>
                Tables Scanned: <strong style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: 4 }}>{analysis.fullScans.join(', ')}</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                Your query is perfectly correct! However, SQLite performed a <strong>Full Table Scan</strong> because the columns you are filtering or sorting by don't have an index. As tables grow large, applying an index to these columns will drastically speed up execution.
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 700, marginBottom: '8px' }}>
                <CheckCircle2 size={18} /> Efficient Query
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
                No full table scans were detected. The query planner efficiently utilized available indexes.
              </div>
            </div>
          )}

          {/* Current Indexes */}
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
             <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: 13, color: 'var(--text)' }}>Existing Indexes on Queried Tables</div>
             {analysis.availableIndexes.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>No indexes exist on these tables.</div>}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               {analysis.availableIndexes.map(idx => {
                 const isUsed = analysis.usedIndexes.includes(idx.indexName);
                 return (
                   <div key={idx.indexName} style={{
                     display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', 
                     background: isUsed ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
                     border: `1px solid ${isUsed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                     borderRadius: '8px',
                     opacity: isUsed ? 1 : 0.6
                   }}>
                     <span style={{ fontSize: '14px' }}>{idx.isUnique ? '🔑' : '📇'}</span>
                     <span style={{ fontWeight: 600, fontSize: 13, flex: 1, color: 'var(--text)' }}>{idx.tableName}.{idx.indexName}</span>
                     {isUsed && <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 700 }}>✓ Used in Query</span>}
                   </div>
                 );
               })}
             </div>
          </div>
        </div>

        {/* Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h4 style={{ margin: 0, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>1-Click Solutions</h4>
          
          {hasScans && analysis.recommendations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analysis.recommendations.map((rec, i) => (
                <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                  <div style={{ padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileCode2 size={16} color="#3b82f6" />
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>Recommended Fix for {rec.table}</span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <pre style={{ margin: 0, color: '#a78bfa', fontFamily: 'var(--font-mono)', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                      {rec.sql}
                    </pre>
                    <div style={{ marginTop: '16px', fontSize: 12, color: '#94a3b8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Run this to index `{rec.column}`</span>
                      <button 
                        onClick={() => {
                          executeQuery(rec.sql).then(() => {
                            alert("Index created successfully! The UI will now re-analyze your query.");
                            setLocalTrigger(t => t + 1);
                          }).catch(e => alert("Error: " + e.message));
                        }}
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                        onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                      >
                        Apply Index
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--muted)', fontSize: 13 }}>
              No optimizations needed.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
