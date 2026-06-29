import React, { useEffect, useState } from 'react';
import { DB_INFO } from '../types';
import { useSqlDatabase } from '../hooks/useSqlDatabase';
export function TablePreviewModal({
  db,
  tableName,
  onClose
}) {
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
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="modal-content" style={{
        width: '96vw',
        maxWidth: '1800px',
        height: '96vh',
        maxHeight: '96vh',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--border)',
        background: 'var(--surface)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface-2)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
              <span style={{
              fontSize: 20
            }}>📊</span> {tableName}
            </h2>
            <div style={{
            fontSize: 12,
            color: 'var(--muted)',
            marginTop: 4
          }}>
              {actualRowCount.toLocaleString()} total rows
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          
          {/* Schema Info */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
            flexShrink: 0
          }}>
            <h3 style={{
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-secondary)',
              marginBottom: 16,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              Schema Definition
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12
            }}>
              {tableInfo.columns.map(col => (
                <div key={col.name} style={{
                  padding: '10px 14px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  minWidth: '200px',
                  flex: '1 1 200px',
                  maxWidth: '300px',
                  transition: 'transform 0.2s, border-color 0.2s',
                  cursor: 'default'
                }} className="schema-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {col.isPrimaryKey && <span title="Primary Key" style={{ color: 'var(--accent)' }}>🔑</span>}
                      {col.isForeignKey && <span title="Foreign Key" style={{ color: 'var(--text-secondary)' }}>🗝️</span>}
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{col.name}</span>
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: col.type.includes('INT') ? '#4ade80' : col.type.includes('CHAR') || col.type.includes('TEXT') ? '#60a5fa' : '#f472b6',
                      padding: '2px 8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {col.type}
                    </span>
                  </div>
                  {col.isNullable && <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--muted)' }} /> Nullable
                  </div>}
                </div>
              ))}
            </div>
          </div>

          {/* Data Preview */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Data Preview
              </h3>
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: '0' }} className="custom-scrollbar">
              {isLoading ? (
                <div style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: 'var(--muted)' }}>
                  <div className="animate-pulse-glow" style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)' }} />
                  Loading records...
                </div>
              ) : result?.error ? (
                <div style={{ padding: '24px', margin: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, color: '#ef4444' }}>
                  {result.error}
                </div>
              ) : result && result.columns.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {result.columns.map(col => (
                        <th key={col} style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          borderBottom: '1px solid var(--border)',
                          background: 'var(--surface-3)',
                          backdropFilter: 'blur(12px)',
                          position: 'sticky',
                          top: 0,
                          fontWeight: 700,
                          color: 'var(--text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontSize: 11,
                          zIndex: 10
                        }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(result.rows || []).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }} className="table-row-hover">
                        {row.map((val, j) => (
                          <td key={j} style={{ padding: '10px 16px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                            {val === null ? <span style={{ color: 'var(--muted)', fontStyle: 'italic', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>null</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  No data found in this table.
                </div>
              )}

            </div>
            
            {/* Pagination Footer */}
            {!isLoading && actualRowCount > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 24px',
                borderTop: '1px solid var(--border)',
                background: 'var(--surface)',
                fontSize: 13
              }}>
                <div style={{ color: 'var(--muted)' }}>
                  Showing <span style={{ fontWeight: 600, color: 'var(--text)' }}>{((page - 1) * PAGE_SIZE) + 1}</span> to <span style={{ fontWeight: 600, color: 'var(--text)' }}>{Math.min(page * PAGE_SIZE, actualRowCount)}</span> of <span style={{ fontWeight: 600, color: 'var(--text)' }}>{actualRowCount.toLocaleString()}</span> results
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button 
                    className="btn btn-ghost btn-icon" 
                    style={{ width: 32, height: 32, minHeight: 32, borderRadius: 8, background: page <= 1 ? 'transparent' : 'var(--surface-2)', border: '1px solid', borderColor: page <= 1 ? 'transparent' : 'var(--border)' }}
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 40, fontWeight: 600, color: 'var(--text)' }}>
                    {page}
                  </div>
                  <button 
                    className="btn btn-ghost btn-icon"
                    style={{ width: 32, height: 32, minHeight: 32, borderRadius: 8, background: page >= totalPages ? 'transparent' : 'var(--surface-2)', border: '1px solid', borderColor: page >= totalPages ? 'transparent' : 'var(--border)' }}
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