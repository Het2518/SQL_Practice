import React, { Suspense } from 'react';
import { RotateCcw, Play } from 'lucide-react';
import { format as formatSql } from 'sql-formatter';
import { Button } from '@/shared/ui/Button';

export const PracticeWorkspace = React.memo(function PracticeWorkspace({
  workspaceRef,
  editorHeightPct,
  sql,
  setSql,
  runQuery,
  isRunning,
  db,
  settings,
  currentQ,
  setShowCteModal,
  setJoinAnalysisData,
  executeQuery,
  handleMouseDown,
  result,
  validation,
  SqlEditor,
  ResultsPanel,
  setShowOverflow,
  showOverflow,
  queryHistory,
  navigate,
}) {
  return (
    <div 
      ref={workspaceRef}
      className="flex-1 flex flex-col md:h-full md:overflow-hidden bg-bg min-w-[300px] min-h-[800px] md:min-h-0"
    >
      {/* EDITOR SECTION */}
      <div 
        className="shrink-0 flex flex-col bg-surface border-b border-border min-h-[300px] md:min-h-[140px] h-[400px] md:h-[var(--desktop-h)] overflow-hidden relative"
        style={{ '--desktop-h': `${editorHeightPct}%` }}
      >
        <div className="flex-1 relative min-h-0 bg-surface overflow-hidden">
          {/* History Button Overlay in Editor top right */}
          <div className="absolute top-2 right-4 z-[90]">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOverflow((v) => !v)}
                style={{ color: 'var(--text-secondary)' }}
              >
                History
              </Button>
              {showOverflow && (
                <>
                  <div
                    className="fixed inset-0 z-[98]"
                    onClick={() => setShowOverflow(false)}
                  />
                  <div className="absolute top-[calc(100%+4px)] right-0 z-[99] bg-surface border border-border rounded-xl shadow-float min-w-[220px] py-1.5">
                    <div className="px-3.5 pt-1 pb-1 text-[10px] font-bold text-muted uppercase tracking-[1px]">
                      Query History
                    </div>
                    {queryHistory.length === 0 && (
                      <div className="px-3.5 py-2 text-xs text-muted">
                        No recent queries
                      </div>
                    )}
                    {queryHistory.slice(0, 10).map((entry, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-3.5 py-2 text-xs bg-transparent border-none text-text hover:bg-surface-2 cursor-pointer transition-colors rounded-lg truncate"
                        onClick={() => {
                          const targetDb = entry.dbName || db;
                          let navUrl = '/practice/' + targetDb;
                          if (entry.questionId) {
                            navUrl += '?q=' + entry.questionId;
                            if (settings?.persistEditorText) {
                              localStorage.setItem(`sql-persist-${entry.questionId}`, entry.sql);
                            }
                          }
                          navigate(navUrl);
                          setSql(entry.sql);
                          setShowOverflow(false);
                        }}
                      >
                        {entry.prompt
                          ? entry.prompt.substring(0, 28) + '…'
                          : entry.sql?.substring(0, 32)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center text-muted h-full w-full">
              Loading editor...
            </div>
          }>
            <SqlEditor
              value={sql}
              onChange={(val) => {
                setSql(val);
                if (settings?.persistEditorText) {
                  localStorage.setItem(`sql-persist-${currentQ?.id}`, val);
                }
              }}
              onRun={runQuery}
              onFormat={() => setSql(formatSql(sql, { language: 'postgresql' }))}
              dbName={db}
              height="100%"
              darkMode={settings?.darkMode}
              fontSize={settings?.editorFontSize || 14}
              autoComplete={settings?.autoCompleteSql !== false}
            />
          </Suspense>
        </div>
        <div className="flex items-center justify-between px-3 py-2 bg-surface-2 border-t border-border shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
            <Button variant="secondary" size="sm" onClick={() => setSql('')} title="Reset">
              <RotateCcw size={13} /> <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSql(formatSql(sql, { language: 'postgresql' }))} title="Format">
              Format
            </Button>
            <div className="hidden sm:block w-px h-4 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCteModal(true)}
              style={{ fontSize: 11 }}
              title="Convert to CTE"
            >
              🪄 <span className="hidden sm:inline">CTE</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setJoinAnalysisData({ db: executeQuery, sql })}
              style={{ fontSize: 11 }}
              title="Analyze Joins"
            >
              🔗 <span className="hidden sm:inline">Joins</span>
            </Button>
          </div>
          <Button size="sm" onClick={runQuery} isLoading={isRunning}>
            <Play size={13} fill="currentColor" /> Run Code (Ctrl+Enter)
          </Button>
        </div>
      </div>

      {/* RESIZER 2 (Vertical) */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'vertical')}
        className="hidden md:block h-1.5 cursor-row-resize hover:bg-primary/20 active:bg-primary/40 transition-colors z-10"
      />

      {/* RESULTS SECTION */}
      <div className="flex-1 flex flex-col min-h-[400px] md:min-h-0 bg-surface">
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center text-muted h-full w-full">
              Loading results...
            </div>
        }>
          <ResultsPanel
            result={result}
            validation={validation}
            isRunning={isRunning}
            sql={sql}
            executeQuery={executeQuery}
            question={currentQ}
          />
        </Suspense>
      </div>
    </div>
  );
});
