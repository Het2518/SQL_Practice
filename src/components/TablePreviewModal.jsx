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
  useEffect(() => {
    if (!isLoading) {
      const res = executeQuery(`SELECT * FROM ${tableName};`);
      setResult(res);
    }
  }, [isLoading, executeQuery, tableName]);
  if (!tableInfo) return null;
  return <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{
      maxWidth: '95vw',
      height: '95vh',
      maxHeight: '95vh'
    }}>
        {/* Header */}
        <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface-2)'
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
              {tableInfo.rowCount} total rows · Showing all records
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">✕</button>
        </div>

        <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden'
      }}>
          
          {/* Schema Info */}
          <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0
        }}>
            <h3 style={{
            fontSize: 13,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--muted)',
            marginBottom: 12,
            fontWeight: 700
          }}>
              Schema Definition
            </h3>
            <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12
          }}>
              {tableInfo.columns.map(col => <div key={col.name} style={{
              padding: '8px 12px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
                  <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                    <span style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'var(--text)'
                }}>
                      {col.isPrimaryKey && <span title="Primary Key" style={{
                    marginRight: 4
                  }}>🔑</span>}
                      {col.isForeignKey && <span title="Foreign Key" style={{
                    marginRight: 4
                  }}>🗝️</span>}
                      {col.name}
                    </span>
                    <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--primary)',
                  padding: '2px 6px',
                  background: 'var(--primary-muted)',
                  borderRadius: 4
                }}>
                      {col.type}
                    </span>
                  </div>
                  {col.isNullable && <div style={{
                fontSize: 11,
                color: 'var(--muted)'
              }}>Nullable</div>}
                </div>)}
            </div>
          </div>

          {/* Data Preview */}
          <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
            <h3 style={{
            fontSize: 13,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--muted)',
            margin: '20px 20px 12px',
            fontWeight: 700,
            flexShrink: 0
          }}>
              Sample Data
            </h3>
            
            <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '0 20px 20px'
          }}>
              {isLoading ? <div style={{
              padding: 20,
              textAlign: 'center',
              color: 'var(--muted)'
            }}>Loading preview...</div> : result?.error ? <div style={{
              padding: 20,
              color: 'var(--error)'
            }}>{result.error}</div> : result && result.columns.length > 0 ? <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13
            }}>
                  <thead>
                    <tr>
                      {result.columns.map(col => <th key={col} style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    borderBottom: '2px solid var(--border)',
                    background: 'var(--surface)',
                    position: 'sticky',
                    top: 0,
                    fontWeight: 600,
                    color: 'var(--text)'
                  }}>
                          {col}
                        </th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {(result.rows || []).map((row, i) => <tr key={i} style={{
                  borderBottom: '1px solid var(--border)'
                }}>
                        {row.map((val, j) => <td key={j} style={{
                    padding: '8px 12px',
                    color: 'var(--text-secondary)'
                  }}>
                            {val === null ? <span style={{
                      color: 'var(--muted)',
                      fontStyle: 'italic'
                    }}>null</span> : String(val)}
                          </td>)}
                      </tr>)}
                  </tbody>
                </table> : <div style={{
              padding: 20,
              textAlign: 'center',
              color: 'var(--muted)',
              background: 'var(--surface-2)',
              borderRadius: 6
            }}>
                  No data found in this table.
                </div>}
            </div>
          </div>

        </div>
      </div>
    </div>;
}