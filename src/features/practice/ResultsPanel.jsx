import React, { useState, useEffect } from 'react';
import { DiffTable } from './DiffTable';
import { TableCell, NullSummaryPanel } from '@/features/visualizers/NullVisualizer';
import { ExecutionOrderExplainer } from '@/features/visualizers/ExecutionOrderExplainer';
import { IndexAdvisor } from '@/features/visualizers/IndexAdvisor';
import { TheoryConnector } from '@/features/gamification/TheoryConnector';
import { GroupedResultRow } from '@/features/visualizers/AggregateVisualizer';
import { TableVirtuoso } from 'react-virtuoso';

export const ResultsPanel = React.memo(function ResultsPanel({
  result,
  validation,
  sql,
  executeQuery,
  isRunning
}) {
  const [activeTab, setActiveTab] = useState('data');

  // Reset tab when result changes (removed pagination state as Virtuoso handles it)
  useEffect(() => {
    setActiveTab('data');
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
    if (!sql || sql.trim() === '') {
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
          }}>⌨️</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text)', fontWeight: 500, marginBottom: 4 }}>Write your SQL query</div>
            <div style={{ fontSize: 13 }}>Type a query in the editor above to solve the problem</div>
          </div>
        </div>
      );
    }

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
  const isDML = !isError && (result.isDML !== undefined ? result.isDML : result.columns.length === 0);

  const totalRows = isError || isDML ? 0 : result.rows.length;
  // currentRows is no longer paginated manually, Virtuoso handles the full array
  const currentRows = isError || isDML ? [] : result.rows;

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
      {validation && !validation.isCorrect && !isError && (
        <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            {validation.message}
          </div>
        </div>
      )}

      {/* Content Area */}
      {!isError && !isDML && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Tabs Navigation */}
          {(!validation || validation.isCorrect) && executeQuery && sql && (
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid var(--border)', 
              background: 'var(--surface-2)',
              gap: 24,
              padding: '0 16px'
            }}>
              {[
                { id: 'data', label: '📊 Data' },
                { id: 'analysis', label: '🔍 Null Analysis' },
                { id: 'plan', label: '⏱️ Execution Plan' },
                { id: 'index', label: '⚡ Index Advisor' },
                { id: 'theory', label: '📚 Theory' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '12px 0',
                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent)' : 'transparent'}`,
                    cursor: 'pointer',
                    fontSize: 13,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div style={{ flex: 1, overflowY: activeTab === 'data' ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {validation && !validation.isCorrect && validation.diff ? (
              <DiffTable diff={validation.diff} expectedColumns={validation.expectedColumns} />
            ) : (
              <>
                {/* Data Tab */}
                {activeTab === 'data' && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                      <TableVirtuoso
                        style={{ height: '100%', width: '100%' }}
                        data={currentRows}
                        fixedHeaderContent={() => (
                          <tr>
                            {/\bGROUP\s+BY\b/i.test(sql) && <th style={{ width: '30px', background: 'var(--surface-2)' }}></th>}
                            {result.columns.map((col, i) => (
                              <th key={i} style={{ background: 'var(--surface-2)' }}>
                                {col}
                              </th>
                            ))}
                          </tr>
                        )}
                        components={{
                          Table: ({ style, ...props }) => (
                            <table {...props} className="results-table" style={{ ...style, borderSpacing: 0, width: '100%', margin: 0 }} />
                          ),
                          TableRow: ({ item: row, ...props }) => (
                            <GroupedResultRow row={row} sql={sql} executeQuery={executeQuery} columns={result.columns} />
                          )
                        }}
                      />
                      
                      {result.columns.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px 0' }}>
                          No rows matched the query conditions.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Null Analysis Tab */}
                {activeTab === 'analysis' && (
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <NullSummaryPanel results={result} />
                  </div>
                )}

                {/* Diagnostic Visualizers */}
                {(!validation || validation.isCorrect) && !isError && !isDML && executeQuery && sql && (
                  <>
                    {activeTab === 'plan' && <div style={{ padding: 16 }}><ExecutionOrderExplainer sql={sql} executeQuery={executeQuery} /></div>}
                    {activeTab === 'index' && <div style={{ padding: 16 }}><IndexAdvisor sql={sql} executeQuery={executeQuery} /></div>}
                    {activeTab === 'theory' && <div style={{ padding: 16 }}><TheoryConnector sql={sql} /></div>}
                  </>
                )}
              </>
            )}
          </div>
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
});