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

  if (loading) return <div className="p-6 text-center text-muted">Analyzing Execution Plan...</div>;
  if (!analysis) return null;

  const hasScans = analysis.fullScans.length > 0;

  return (
    <div className="p-6">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-red-500 p-2.5 rounded-xl">
          <Zap size={20} color="#fff" />
        </div>
        <div>
          <h3 className="m-0 text-base font-bold">AI Index Advisor</h3>
          <div className="text-xs text-muted mt-0.5">Analyzes full table scans to recommend indexes.</div>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-2">
        
        {/* Performance Diagnostics */}
        <div className="flex flex-col gap-4">
          <h4 className="m-0 text-[13px] uppercase tracking-[0.05em] text-text-secondary">Diagnostic Results</h4>
          
          {hasScans ? (
            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-blue-500 font-bold mb-2">
                <Zap size={18} /> Optimization Opportunity
              </div>
              <div className="mb-3 text-[13px] text-text">
                Tables Scanned: <strong className="text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">{analysis.fullScans.join(', ')}</strong>
              </div>
              <div className="text-text-secondary text-[13px] leading-relaxed">
                Your query is perfectly correct! However, SQLite performed a <strong>Full Table Scan</strong> because the columns you are filtering or sorting by don't have an index. As tables grow large, applying an index to these columns will drastically speed up execution.
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-500 font-bold mb-2">
                <CheckCircle2 size={18} /> Efficient Query
              </div>
              <div className="text-text-secondary text-[13px] leading-relaxed">
                No full table scans were detected. The query planner efficiently utilized available indexes.
              </div>
            </div>
          )}

          {/* Current Indexes */}
          <div className="bg-surface-2 border border-border p-4 rounded-xl">
             <div className="font-semibold mb-3 text-[13px] text-text">Existing Indexes on Queried Tables</div>
             {analysis.availableIndexes.length === 0 && <div className="text-muted text-[13px]">No indexes exist on these tables.</div>}
             <div className="flex flex-col gap-2">
               {analysis.availableIndexes.map(idx => {
                 const isUsed = analysis.usedIndexes.includes(idx.indexName);
                 return (
                   <div key={idx.indexName} className={`flex items-center gap-2.5 p-2 px-3 rounded-lg border ${
                     isUsed ? 'bg-emerald-500/10 border-emerald-500/30 opacity-100' : 'bg-surface border-border opacity-60'
                   }`}>
                     <span className="text-sm">{idx.isUnique ? '🔑' : '📇'}</span>
                     <span className="font-semibold text-[13px] flex-1 text-text">{idx.tableName}.{idx.indexName}</span>
                     {isUsed && <span className="text-emerald-500 text-[11px] font-bold">✓ Used in Query</span>}
                   </div>
                 );
               })}
             </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="flex flex-col gap-4">
          <h4 className="m-0 text-[13px] uppercase tracking-[0.05em] text-text-secondary">1-Click Solutions</h4>
          
          {hasScans && analysis.recommendations.length > 0 ? (
            <div className="flex flex-col gap-3">
              {analysis.recommendations.map((rec, i) => (
                <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                  <div className="px-4 py-3 bg-blue-500/10 border-b border-slate-700 flex items-center gap-2">
                    <FileCode2 size={16} color="#3b82f6" />
                    <span className="font-semibold text-[13px] text-slate-200">Recommended Fix for {rec.table}</span>
                  </div>
                  <div className="p-4">
                    <pre className="m-0 text-purple-400 font-mono text-[13px] whitespace-pre-wrap">
                      {rec.sql}
                    </pre>
                    <div className="mt-4 text-xs text-slate-400 flex justify-between items-center">
                      <span>Run this to index `{rec.column}`</span>
                      <button 
                        onClick={() => {
                          executeQuery(rec.sql).then(() => {
                            alert("Index created successfully! The UI will now re-analyze your query.");
                            setLocalTrigger(t => t + 1);
                          }).catch(e => alert("Error: " + e.message));
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white border-none px-3 py-1.5 rounded-md cursor-pointer font-semibold transition-colors"
                      >
                        Apply Index
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-surface-2 border border-border rounded-xl text-muted text-[13px]">
              No optimizations needed.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
