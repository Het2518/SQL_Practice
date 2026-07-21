import React, { useState, useEffect } from 'react';
import { DiffTable } from './DiffTable';
import { TableCell, NullSummaryPanel } from '@/features/visualizers/NullVisualizer';
import { ExecutionPlanTree } from '@/features/visualizers/ExecutionPlanTree';
import { TheoryConnector } from '@/features/visualizers/TheoryConnector';
import { GroupedResultRow } from '@/features/visualizers/AggregateVisualizer';
import { DataVisualizer } from '@/features/practice/DataVisualizer';
import { TableVirtuoso } from 'react-virtuoso';

export const ResultsPanel = React.memo(function ResultsPanel({
  result,
  validation,
  sql,
  executeQuery,
  isRunning,
  question
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
          padding: 32,
          background: 'var(--surface)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 400,
            padding: '48px 24px',
            border: '2px dashed var(--border)',
            borderRadius: 16,
            background: 'var(--surface-2)',
            gap: 16
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: 'var(--text-secondary)'
            }}>⌨️</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text)', fontSize: 15, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.3px' }}>Write your SQL query</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Type a query in the editor above to solve the problem</div>
            </div>
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
        gap: 14,
        padding: '8px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-2)',
        flexShrink: 0,
        fontSize: 12
      }}>
        {/* Status Badge */}
        {validation && (
          <div className={validation.isCorrect ? 'badge badge-success' : 'badge badge-danger'}>
            {validation.isCorrect ? '✅ Correct' : '❌ Incorrect'}
          </div>
        )}
        {isError && !validation && (
          <div className="badge badge-danger">SQL Error</div>
        )}
        {isDML && !isError && (
          <div className="badge badge-success">Executed</div>
        )}
        {!isError && !validation && !isDML && (
          <div className="badge badge-info">Query OK</div>
        )}

        {/* Execution Stats — no emoji, clean text */}
        {!isError && (
          <div style={{ display: 'flex', gap: 14, color: 'var(--text-secondary)' }}>
            <span>
              <strong style={{ color: 'var(--text)' }}>
                {result.execTimeMs !== undefined ? `${result.execTimeMs.toFixed(1)} ms` : '< 1 ms'}
              </strong>
            </span>
            {!isDML && (
              <span>
                <strong style={{ color: 'var(--text)' }}>{totalRows}</strong> rows
              </span>
            )}
            {!isDML && (
              <span>
                <strong style={{ color: 'var(--text)' }}>{result.columns.length}</strong> cols
              </span>
            )}
            <span style={{ color: 'var(--muted)' }}>{new Date().toLocaleTimeString()}</span>
          </div>
        )}

        <div style={{ flex: 1 }} />
      </div>

      {/* Validation Message Box */}
      {validation && !validation.isCorrect && !isError && (
        <div style={{ padding: '10px 16px', background: 'rgba(239,68,68,0.07)', borderBottom: '1px solid rgba(239,68,68,0.18)', color: 'var(--error)', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1 }}>{validation.message}</div>
        </div>
      )}

      {/* Content Area */}
      {!isError && !isDML && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Tabs Navigation — clean pill style, no icons */}
          {(!validation || validation.isCorrect) && executeQuery && sql && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 12px',
              gap: 4,
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-2)',
              flexShrink: 0,
            }}>
              {[
                { id: 'data',     label: 'Data'           },
                { id: 'chart',    label: 'Chart'          },
                { id: 'analysis', label: 'Null Analysis'  },
                { id: 'plan',     label: 'Execution Plan' },
                { id: 'theory',   label: 'Theory'         },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                    border: activeTab === tab.id ? 'none' : '1px solid var(--border)',
                    padding: '4px 12px',
                    borderRadius: 20,
                    color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    cursor: 'pointer',
                    fontSize: 12,
                    transition: 'all 0.18s ease',
                    letterSpacing: '0.01em',
                    lineHeight: 1.6,
                  }}
                  onMouseEnter={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text)'; } }}
                  onMouseLeave={e => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
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
                    
                    {/* Performance Analyzer Warning (Phase 1) */}
                    {result.explainPlan && result.explainPlan.some(row => row[3] && row[3].includes('SCAN TABLE')) && (
                      <div style={{ 
                        margin: '12px 16px', padding: '10px 14px', background: 'rgba(230,126,34,0.1)', 
                        borderLeft: '4px solid #e67e22', borderRadius: '4px', fontSize: '12.5px', color: 'var(--text)'
                      }}>
                        <strong style={{ color: '#e67e22' }}>Performance Warning:</strong> This query performs a <strong>Full Table Scan</strong>. 
                        While it works, it might be slow on large datasets. Consider adding an index or filtering earlier!
                      </div>
                    )}

                    {result.columns.length === 0 ? (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13, gap: 12 }}>
                        <div style={{ fontSize: 24 }}>✅</div>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>Query Successful</div>
                        <div>Your query returned 0 rows.</div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, minHeight: 0 }}>
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
                            TableRow: React.forwardRef(({ item: row, ...props }, ref) => (
                              <GroupedResultRow ref={ref} row={row} sql={sql} executeQuery={executeQuery} columns={result.columns} {...props} />
                            ))
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Chart Tab */}
                {activeTab === 'chart' && (
                  <div style={{ flex: 1, overflowY: 'hidden' }}>
                    <DataVisualizer result={result} />
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
                    {activeTab === 'plan' && <div style={{ padding: 16 }}><ExecutionPlanTree sql={sql} executeQuery={executeQuery} refreshTrigger={result?.execTimeMs} /></div>}
                    {activeTab === 'theory' && <div style={{ padding: 16 }}><TheoryConnector sql={sql} question={question} /></div>}
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