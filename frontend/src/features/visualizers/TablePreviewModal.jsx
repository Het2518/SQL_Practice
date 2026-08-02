import React, { useEffect, useState } from 'react';
import { DB_INFO } from '@/data/schemas';
import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function TablePreviewModal({
  db,
  tableName,
  onClose
}) {
  const trapRef = useFocusTrap(true);
  const dbInfo = DB_INFO[db];
  const tableInfo = dbInfo.tables.find(t => t.name === tableName);
  const {
    executeQuery,
    isLoading
  } = useSqlDatabase(db);
  const [result, setResult] = useState(null);
  const [actualRowCount, setActualRowCount] = useState(tableInfo.rowCount);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    let mounted = true;
    if (!isLoading) {
      const fetchData = async () => {
        try {
          // Get actual row count only once if possible, but safe to do here
          const countRes = await executeQuery(`SELECT COUNT(*) as c FROM ${tableName};`);
          let total = tableInfo.rowCount;
          if (countRes.rows && countRes.rows.length > 0) {
            total = countRes.rows[0][0];
            if (mounted) setActualRowCount(total);
          }
          
          // Fetch with pagination
          const offset = (page - 1) * PAGE_SIZE;
          const res = await executeQuery(`SELECT * FROM ${tableName} LIMIT ${PAGE_SIZE} OFFSET ${offset};`);
          if (mounted) setResult(res);
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
    return () => { mounted = false; };
  }, [isLoading, executeQuery, tableName, page]);
  
  const totalPages = Math.ceil(actualRowCount / PAGE_SIZE);
  if (!tableInfo) return null;
  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={e => e.target === e.currentTarget && onClose()}>
      <div ref={trapRef} className="modal-content w-[96vw] max-w-[1800px] h-[96vh] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_var(--border)] bg-surface overflow-hidden flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-surface-2 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-text flex items-center gap-2 m-0">
              <span className="text-xl">📊</span> {tableName}
            </h2>
            <div className="text-xs text-muted mt-1">
              {actualRowCount.toLocaleString()} total rows
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">✕</button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          
          {/* Schema Info */}
          <div className="p-6 border-b border-border bg-surface shrink-0">
            <h3 className="text-xs uppercase tracking-widest text-text-secondary mb-4 font-bold flex items-center gap-2 m-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Schema Definition
            </h3>
            <div className="custom-scrollbar flex overflow-x-auto pb-2 gap-3">
              {tableInfo.columns.map(col => (
                <div key={col.name} className="schema-card px-3.5 py-2.5 bg-surface-2 border border-border rounded-lg flex flex-col gap-1.5 min-w-[200px] max-w-[300px] flex-none transition-all cursor-default">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[13px] text-text flex items-center gap-1.5">
                      {col.isPrimaryKey && <span title="Primary Key" className="text-accent-1">🔑</span>}
                      {col.isForeignKey && <span title="Foreign Key" className="text-text-secondary">🗝️</span>}
                      <span className="font-mono">{col.name}</span>
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 bg-white/5 border border-white/10 rounded-xl font-mono" style={{ color: col.type.includes('INT') ? '#4ade80' : col.type.includes('CHAR') || col.type.includes('TEXT') ? '#60a5fa' : '#f472b6' }}>
                      {col.type}
                    </span>
                  </div>
                  {col.isNullable && <div className="text-[11px] text-muted flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-muted" /> Nullable
                  </div>}
                </div>
              ))}
            </div>
          </div>

          {/* Data Preview */}
          <div className="flex-1 flex flex-col bg-surface overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-surface-2">
              <h3 className="text-xs uppercase tracking-widest text-text-secondary font-bold m-0 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Data Preview
              </h3>
            </div>
            
            <div className="flex-1 overflow-auto p-0 custom-scrollbar">
              {isLoading ? (
                <div className="p-10 flex flex-col items-center gap-4 text-muted">
                  <div className="animate-pulse-glow w-6 h-6 rounded-full bg-accent-1" />
                  Loading records...
                </div>
              ) : result?.error ? (
                <div className="p-6 m-6 bg-error-muted border border-error rounded-lg text-error">
                  {result.error}
                </div>
              ) : result && result.columns.length > 0 ? (
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      {result.columns.map(col => (
                        <th key={col} className="px-4 py-3 text-left border-b border-border bg-surface-3/80 backdrop-blur-md sticky top-0 font-bold text-text-secondary uppercase tracking-[0.05em] text-[11px] z-10">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(result.rows || []).map((row, i) => (
                      <tr key={i} className="border-b border-border table-row-hover">
                        {row.map((val, j) => (
                          <td key={j} className="px-4 py-2.5 text-text font-mono">
                            {val === null ? <span className="text-muted italic bg-surface-2 px-1.5 py-0.5 rounded text-[11px]">null</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-10 text-center text-muted flex flex-col items-center gap-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  No data found in this table.
                </div>
              )}

            </div>
            
            {/* Pagination Footer */}
            {!isLoading && actualRowCount > 0 && (
              <div className="flex justify-between items-center px-6 py-3 border-t border-border bg-surface text-[13px]">
                <div className="text-muted">
                  Showing <span className="font-semibold text-text">{((page - 1) * PAGE_SIZE) + 1}</span> to <span className="font-semibold text-text">{Math.min(page * PAGE_SIZE, actualRowCount)}</span> of <span className="font-semibold text-text">{actualRowCount.toLocaleString()}</span> results
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    className={`btn btn-ghost btn-icon w-8 h-8 min-h-8 rounded-lg border transition-colors ${page <= 1 ? 'bg-transparent border-transparent text-muted' : 'bg-surface-2 border-border text-text hover:bg-surface-3'}`}
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <div className="flex items-center justify-center min-w-[40px] font-semibold text-text">
                    {page}
                  </div>
                  <button 
                    className={`btn btn-ghost btn-icon w-8 h-8 min-h-8 rounded-lg border transition-colors ${page >= totalPages ? 'bg-transparent border-transparent text-muted' : 'bg-surface-2 border-border text-text hover:bg-surface-3'}`}
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}