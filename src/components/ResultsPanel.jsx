import { useState, useEffect } from 'react';
import { DiffTable } from './DiffTable';
import { TableCell, NullSummaryPanel } from './NullVisualizer';
import { ExecutionOrderExplainer } from './ExecutionOrderExplainer';
import { JoinVisualizer } from './JoinVisualizer';
import { IndexAdvisor } from './IndexAdvisor';
import { TheoryConnector } from './TheoryConnector';
import { GroupedResultRow } from './AggregateVisualizer';

export function ResultsPanel({
  result,
  validation,
  sql,
  db,
  isRunning,
  hasQuestion
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Reset page when result changes
  useEffect(() => {
    setPage(1);
  }, [result]);

  if (isRunning) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 12,
        color: 'var(--muted)'
      }}>
        <div className="animate-pulse-glow" style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: 'var(--accent)'
        }} />
        <span>Executing query...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 12,
        color: 'var(--muted)',
        background: 'var(--surface)'
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          background: 'var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          color: 'var(--text-secondary)'
        }}>▶</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>Ready to execute</div>
          <div style={{ fontSize: 12 }}>Press <kbd style={{ background: 'var(--surface-3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>Ctrl</kbd> + <kbd style={{ background: 'var(--surface-3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>Enter</kbd> to run</div>
        </div>
      </div>
    );
  }

  const isError = !!result.error;
  const isDML = !isError && result.columns.length === 0;

  // Pagination logic
  const totalRows = isError || isDML ? 0 : result.rows.length;
  const totalPages = pageSize === 'All' ? 1 : Math.ceil(totalRows / pageSize);
  
  // Ensure page is within bounds
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  
  const startIndex = pageSize === 'All' ? 0 : (safePage - 1) * pageSize;
  const endIndex = pageSize === 'All' ? totalRows : Math.min(startIndex + pageSize, totalRows);
  const currentRows = isError || isDML ? [] : result.rows.slice(startIndex, endIndex);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--surface)'
    }}>
      {/* Execution Stats Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-2)',
        flexShrink: 0,
        overflowX: 'auto',
        fontSize: 12
      }}>
        {/* Status Badge */}
        {validation && (
          <div className={validation.isCorrect ? 'badge badge-success' : 'badge badge-danger'}>
            {validation.isCorrect ? '✅ Correct' : '❌ Incorrect'}
          </div>
        )}
        {isError && !validation && (
          <div className="badge badge-danger">⚠️ SQL Error</div>
        )}
        {isDML && !isError && (
          <div className="badge badge-success">✅ Executed</div>
        )}
        {!isError && !validation && !isDML && (
          <div className="badge badge-info">✔ Query Successful</div>
        )}

        {/* Execution Stats */}
        {!isError && (
          <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span title="Execution Time">⏱️</span>
              <strong style={{ color: 'var(--text)' }}>
                {result.execTimeMs !== undefined ? `${result.execTimeMs.toFixed(1)} ms` : '< 1 ms'}
              </strong>
            </span>
            {!isDML && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span title="Rows Returned">📊</span>
                <strong style={{ color: 'var(--text)' }}>{totalRows}</strong> rows
              </span>
            )}
            {!isDML && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span title="Columns">📏</span>
                <strong style={{ color: 'var(--text)' }}>{result.columns.length}</strong> cols
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span title="Executed At">🕒</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </span>
          </div>
        )}

        <div style={{ flex: 1 }} />
      </div>

      {/* Validation Message Box */}
      {validation && !validation.isCorrect && (
        <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: 13, fontWeight: 500 }}>
          {validation.message}
        </div>
      )}

      {/* Content Area */}
      {!isError && !isDML && result.columns.length > 0 && (
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {validation && !validation.isCorrect && validation.diff ? (
            <DiffTable diff={validation.diff} expectedColumns={validation.expectedColumns} />
          ) : (
            <>
              <table className="results-table">
                <thead>
                  <tr>
                    {/\bGROUP\s+BY\b/i.test(sql) && <th style={{ width: '30px' }}></th>}
                    {result.columns.map((col, i) => <th key={i}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row, ri) => (
                    <GroupedResultRow key={ri} row={row} sql={sql} db={db} columns={result.columns} />
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalRows > 0 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 16px', 
                  background: 'var(--surface-2)',
                  borderTop: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--text-secondary)'
                }}>
                  <div>
                    Showing <strong>{startIndex + 1}–{endIndex}</strong> of <strong>{totalRows}</strong> rows
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>Rows per page:</span>
                      <select 
                        value={pageSize}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPageSize(val === 'All' ? 'All' : Number(val));
                          setPage(1);
                        }}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          padding: '4px 8px',
                          borderRadius: 4,
                          outline: 'none'
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value="All">All</option>
                      </select>
                    </div>

                    {pageSize !== 'All' && totalPages > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button 
                          className="btn btn-ghost btn-icon" 
                          disabled={safePage === 1}
                          onClick={() => setPage(p => p - 1)}
                          style={{ padding: '4px 8px' }}
                        >
                          ◀
                        </button>
                        <span>Page <strong>{safePage}</strong> of {totalPages}</span>
                        <button 
                          className="btn btn-ghost btn-icon" 
                          disabled={safePage === totalPages}
                          onClick={() => setPage(p => p + 1)}
                          style={{ padding: '4px 8px' }}
                        >
                          ▶
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <NullSummaryPanel results={result} />
              
              {/* Diagnostic Visualizers */}
              {(!validation || validation.isCorrect) && !isError && !isDML && db && sql && (
                <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-2)' }}>
                  <TheoryConnector sql={sql} />
                  <ExecutionOrderExplainer sql={sql} db={db} />
                  <JoinVisualizer sql={sql} db={db} />
                  <IndexAdvisor sql={sql} db={db} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isError && (
        <div style={{ padding: 24, flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--error)', marginBottom: 12, fontWeight: 600 }}>
            <span style={{ fontSize: 20 }}>❌</span>
            Execution Failed
          </div>
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--error)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            background: 'rgba(239,68,68,0.1)',
            padding: 16,
            borderRadius: 8,
            border: '1px solid rgba(239,68,68,0.2)'
          }}>
            {result.error}
          </pre>
        </div>
      )}

      {isDML && !isError && (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted)',
          fontSize: 14,
          flexDirection: 'column',
          gap: 12
        }}>
          <span style={{ fontSize: 32 }}>🔄</span>
          <span>DML statement executed successfully. Use <strong>Reset DB</strong> to restore original data.</span>
        </div>
      )}
    </div>
  );
}