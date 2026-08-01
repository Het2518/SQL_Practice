import React, { useState, useEffect } from 'react';
import { DiffTable } from './DiffTable';
import { TableCell, NullSummaryPanel } from '@/features/visualizers/NullVisualizer';
import { ExecutionPlanTree } from '@/features/visualizers/ExecutionPlanTree';
import { TheoryConnector } from '@/features/visualizers/TheoryConnector';
import { GroupedResultRow } from '@/features/visualizers/AggregateVisualizer';
import { DataVisualizer } from '@/features/practice/DataVisualizer';
import { TableVirtuoso } from 'react-virtuoso';
import { CheckCircle, XCircle } from 'lucide-react';

export const ResultsPanel = React.memo(function ResultsPanel({
  result,
  validation,
  sql,
  executeQuery,
  isRunning,
  question,
}) {
  const [activeTab, setActiveTab] = useState('data');

  // Reset tab when result changes (removed pagination state as Virtuoso handles it)
  useEffect(() => {
    setActiveTab('data');
  }, [result]);

  if (isRunning) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-[var(--muted)]">
        <div className="animate-pulse-glow w-3 h-3 rounded-full bg-[var(--accent)]" />
        <span>Executing query...</span>
      </div>
    );
  }

  if (!result) {
    if (!sql || sql.trim() === '') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-surface">
          <div className="flex flex-col items-center justify-center w-full max-w-[400px] py-12 px-6 border-2 border-dashed border-border rounded-2xl bg-surface-2 gap-4">
            <div className="w-14 h-14 rounded-full bg-surface border border-border shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center text-2xl text-text-secondary">
              ⌨️
            </div>
            <div className="text-center">
              <div className="text-text text-[15px] font-semibold mb-1.5 tracking-tight">
                Write your SQL query
              </div>
              <div className="text-[13px] text-text-secondary leading-relaxed">
                Type a query in the editor above to solve the problem
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted bg-surface">
        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-xl text-text-secondary">
          ▶
        </div>
        <div className="text-center">
          <div className="text-text font-medium mb-1">Ready to execute</div>
          <div className="text-xs">
            Press{' '}
            <kbd className="bg-surface-3 px-1.5 py-0.5 rounded font-mono">
              Ctrl
            </kbd>{' '}
            +{' '}
            <kbd className="bg-surface-3 px-1.5 py-0.5 rounded font-mono">
              Enter
            </kbd>{' '}
            to run
          </div>
        </div>
      </div>
    );
  }

  const isError = !!result.error;
  const isDML =
    !isError && (result.isDML !== undefined ? result.isDML : result.columns.length === 0);

  const totalRows = isError || isDML ? 0 : result.rows.length;
  // currentRows is no longer paginated manually, Virtuoso handles the full array
  const currentRows = isError || isDML ? [] : result.rows;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--surface)',
      }}
    >
      {/* Execution Stats Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '8px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)',
          flexShrink: 0,
          fontSize: 12,
        }}
      >
        {/* Status Badge */}
        {validation && (
          <div className={validation.isCorrect ? 'badge badge-success' : 'badge badge-danger'}>
            {validation.isCorrect ? (
              <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={12} /> Correct
              </div>
            ) : (
              <div className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <XCircle size={12} /> Incorrect
              </div>
            )}
          </div>
        )}
        {isError && !validation && <div className="badge badge-danger">SQL Error</div>}
        {isDML && !isError && <div className="badge badge-success">Executed</div>}
        {!isError && !validation && !isDML && <div className="badge badge-info">Query OK</div>}

        {/* Execution Stats — no emoji, clean text */}
        {!isError && (
          <div className="flex gap-3.5 text-text-secondary">
            <span>
              <strong className="text-text">
                {result.execTimeMs !== undefined ? `${result.execTimeMs.toFixed(1)} ms` : '< 1 ms'}
              </strong>
            </span>
            {!isDML && (
              <span>
                <strong className="text-text">{totalRows}</strong> rows
              </span>
            )}
            {!isDML && (
              <span>
                <strong className="text-text">{result.columns.length}</strong> cols
              </span>
            )}
            <span className="text-muted">{new Date().toLocaleTimeString()}</span>
          </div>
        )}

        <div className="flex-1" />
      </div>

      {/* Validation Message Box */}
      {validation && !validation.isCorrect && !isError && (
        <div className="px-4 py-2.5 bg-red-500/10 border-b border-red-500/20 text-error text-xs font-medium flex items-start gap-2">
          <div className="flex-1">{validation.message}</div>
        </div>
      )}

      {/* Content Area */}
      {!isError && !isDML && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Tabs Navigation — clean pill style, no icons */}
          {(!validation || validation.isCorrect) && executeQuery && sql && (
            <div className="flex items-center px-3 py-1.5 gap-1 border-b border-border bg-surface-2 shrink-0">
              {[
                { id: 'data', label: 'Data' },
                { id: 'chart', label: 'Chart' },
                { id: 'analysis', label: 'Null Analysis' },
                { id: 'plan', label: 'Execution Plan' },
                { id: 'theory', label: 'Theory' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-all duration-150 ease-in-out tracking-[0.01em] leading-relaxed border ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground border-transparent font-semibold'
                      : 'bg-transparent text-text-secondary border-border font-medium hover:bg-surface-3 hover:text-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className={`flex-1 flex flex-col min-h-0 ${activeTab === 'data' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            {validation && !validation.isCorrect && validation.diff ? (
              <DiffTable diff={validation.diff} expectedColumns={validation.expectedColumns} />
            ) : (
              <>
                {/* Data Tab */}
                {activeTab === 'data' && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    {/* Performance Analyzer Warning (Phase 1) */}
                    {result.explainPlan &&
                      result.explainPlan.some((row) => row[3] && row[3].includes('SCAN TABLE')) && (
                        <div
                          style={{
                            margin: '12px 16px',
                            padding: '10px 14px',
                            background: 'rgba(230,126,34,0.1)',
                            borderLeft: '4px solid #e67e22',
                            borderRadius: '4px',
                            fontSize: '12.5px',
                            color: 'var(--text)',
                          }}
                        >
                          <strong style={{ color: '#e67e22' }}>Performance Warning:</strong> This
                          query performs a <strong>Full Table Scan</strong>. While it works, it
                          might be slow on large datasets. Consider adding an index or filtering
                          earlier!
                        </div>
                      )}

                    {result.columns.length === 0 ? (
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--muted)',
                          fontSize: 13,
                          gap: 12,
                        }}
                      >
                        <CheckCircle size={20} strokeWidth={1.5} color="var(--success)" />
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>
                          Query Successful
                        </div>
                        <div>Your query returned 0 rows.</div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, minHeight: 0 }}>
                        <TableVirtuoso
                          style={{ height: '100%', width: '100%' }}
                          data={currentRows}
                          fixedHeaderContent={() => (
                            <tr>
                              {/\bGROUP\s+BY\b/i.test(sql) && (
                                <th className="w-[30px] bg-surface-2"></th>
                              )}
                              {result.columns.map((col, i) => (
                                <th key={i} className="bg-surface-2">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          )}
                          components={{
                            Table: ({ style, ...props }) => (
                              <table
                                {...props}
                                className="results-table w-full m-0 border-spacing-0"
                                style={style}
                              />
                            ),
                            TableRow: React.forwardRef(({ item: row, ...props }, ref) => (
                              <GroupedResultRow
                                ref={ref}
                                row={row}
                                sql={sql}
                                executeQuery={executeQuery}
                                columns={result.columns}
                                {...props}
                              />
                            )),
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Chart Tab */}
                {activeTab === 'chart' && (
                  <div className="flex-1 overflow-hidden">
                    <DataVisualizer result={result} />
                  </div>
                )}

                {/* Null Analysis Tab */}
                {activeTab === 'analysis' && (
                  <div className="flex-1 overflow-y-auto">
                    <NullSummaryPanel results={result} />
                  </div>
                )}

                {/* Diagnostic Visualizers */}
                {(!validation || validation.isCorrect) &&
                  !isError &&
                  !isDML &&
                  executeQuery &&
                  sql && (
                    <>
                      {activeTab === 'plan' && (
                        <div className="p-4">
                          <ExecutionPlanTree
                            sql={sql}
                            executeQuery={executeQuery}
                            refreshTrigger={result?.execTimeMs}
                          />
                        </div>
                      )}
                      {activeTab === 'theory' && (
                        <div className="p-4">
                          <TheoryConnector sql={sql} question={question} />
                        </div>
                      )}
                    </>
                  )}
              </>
            )}
          </div>
        </div>
      )}

      {isError && (
        <div className="p-6 flex-1 overflow-auto">
          <div className="flex items-center gap-2 text-error mb-3 font-semibold">
            <XCircle size={20} strokeWidth={1.5} className="text-error" />
            Execution Failed
          </div>
          <pre className="font-mono text-[13px] text-error whitespace-pre-wrap leading-relaxed bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            {result.error}
          </pre>
        </div>
      )}

      {isDML && !isError && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted)',
            fontSize: 14,
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 32 }}>🔄</span>
          <span>
            DML statement executed successfully. Use <strong>Reset DB</strong> to restore original
            data.
          </span>
        </div>
      )}
    </div>
  );
});
