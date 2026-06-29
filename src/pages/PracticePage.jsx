import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { RotateCcw, Play, BookOpen, Settings as SettingsIcon, List, Home, ChevronDown, Database, Sun, Moon } from 'lucide-react';
import { DB_INFO } from '@/types';
import { allQuestions, getQuestionsForDb } from '@/data/index';
import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { SchemaSidebar } from '@/features/practice/SchemaSidebar';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { ResultsPanel } from '@/features/practice/ResultsPanel';
import { QuestionCard } from '@/features/practice/QuestionCard';
import { QuestionBrowser } from '@/features/practice/QuestionBrowser';
import { ERDiagramModal } from '@/features/visualizers/ERDiagramModal';
import { TablePreviewModal } from '@/features/visualizers/TablePreviewModal';
import { JoinAnalysisModal } from '@/features/visualizers/JoinAnalysisModal';
import { CteConverterModal } from '@/features/visualizers/CteConverterModal';
import { EdgeCaseTester } from '@/features/visualizers/EdgeCaseTester';
import { useConfetti } from '@/features/gamification/ConfettiBlast';
import { useToast } from '@/shared/ui/ToastSystem';
import { loadShortcuts, isShortcutMatch } from '@/utils/shortcutManager';
import { hasSubquery, convertSubqueryToCTE } from '@/utils/sqlAnalysis';

export function PracticeView({
  progress,
  user,
  settings,
  onShowAuth,
  onProgressUpdate,
  onShowSettings,
  onToggleDark,
}) {
  const navigate = useNavigate();
  const { db: routeDb } = useParams();
  
  const initialDb = routeDb || 'airlines';
  const [db, setDb] = useState(initialDb);
  
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q');
  
  const [currentQ, setCurrentQ] = useState(() => {
    const dbQs = getQuestionsForDb(initialDb);
    if (qParam) {
      const found = dbQs.find(q => q.id === qParam);
      if (found) return found;
    }
    return dbQs.find(q => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
  });

  useEffect(() => {
    if (routeDb) {
      if (routeDb !== db) setDb(routeDb);
      const dbQs = getQuestionsForDb(routeDb);
      let targetQ;
      if (qParam) {
        targetQ = dbQs.find(q => String(q.id) === qParam);
      }
      if (!targetQ && !currentQ) {
        // Only auto-select first incomplete question if we don't already have a currentQ
        targetQ = dbQs.find(q => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
      }
      
      // If we found a targetQ (either from qParam, or initial load), and it's different
      if (targetQ && targetQ.id !== currentQ?.id) {
        setCurrentQ(targetQ);
        setResult(null);
        setValidation(null);
        const savedSql = localStorage.getItem(`sql-persist-${targetQ.id}`);
        setSql(savedSql || '');
        setPreviewTableName(null);
      }
    }
    // intentionally omit 'progress' to prevent auto-advancing when user solves a question
    // intentionally omit 'currentQ' so we don't re-run this when currentQ is set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeDb, qParam]);

  const [sql, setSql] = useState('');
  const [result, setResult] = useState(null);
  const [expectedResult, setExpectedResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showERDiagram, setShowERDiagram] = useState(false);
  const [previewTableName, setPreviewTableName] = useState(null);
  const [showCteModal, setShowCteModal] = useState(false);
  const [showDbPicker, setShowDbPicker] = useState(false);
  const [joinAnalysisData, setJoinAnalysisData] = useState(null);

  useEffect(() => {
    const handleOpenJoinAnalysis = (e) => {
      setJoinAnalysisData(e.detail);
    };
    window.addEventListener('open-join-analysis', handleOpenJoinAnalysis);
    return () => window.removeEventListener('open-join-analysis', handleOpenJoinAnalysis);
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Global Keyboard Shortcuts (Moved downwards to unify)
  // Resizable Panes State
  const workspaceRef = useRef(null);
  const [editorHeightPct, setEditorHeightPct] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();
  const { fireConfetti, ConfettiComponent } = useConfetti();

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const percentage = (relativeY / rect.height) * 100;
      setEditorHeightPct(Math.max(20, Math.min(80, percentage)));
    };
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Persist editor text — always save per question, always restore on question switch
  const EDITOR_KEY = `sql-persist-${currentQ.id}`;
  useEffect(() => {
    // Always restore saved SQL when switching questions
    const saved = localStorage.getItem(EDITOR_KEY);
    setSql(saved || '');
  }, [currentQ.id, EDITOR_KEY]);
  useEffect(() => {
    // Always save current SQL for this question
    if (sql !== undefined) {
      localStorage.setItem(EDITOR_KEY, sql);
    }
  }, [sql, EDITOR_KEY]);

  const dbInfo = DB_INFO[db];
  const dbQuestions = useMemo(() => getQuestionsForDb(db), [db]);

  const { isLoading, error: dbError, executeQuery, resetDb, validateAnswer, runVerification, getExpectedResultDynamic, getExplainPlan, getEdgeCaseResults } = useSqlDatabase(db);
  const [isExecuting, setIsExecuting] = useState(false);

  // Switch DB inline
  const handleSwitchDb = useCallback((newDb) => {
    if (newDb === db) { setShowDbPicker(false); return; }
    navigate('/practice/' + newDb);
    setShowDbPicker(false);
  }, [db, navigate]);

  // History now stores { sql, questionId, dbName } objects for full context restore
  const [queryHistory, setQueryHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('sql-practice-history-v2');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('sql-practice-history-v2', JSON.stringify(queryHistory.slice(0, 50)));
  }, [queryHistory]);

  // Fetch expected results when question changes (SQL restore is handled by navigation handlers)
  useEffect(() => {
    let mounted = true;
    setExpectedResult(null);
    if (!isLoading && !dbError) {
      getExpectedResultDynamic(currentQ.solutionSQL, currentQ.verificationSQL)
        .then(er => {
          if (mounted) setExpectedResult(er);
        });
    }
    return () => { mounted = false; };
  }, [currentQ.id, currentQ.solutionSQL, currentQ.verificationSQL, isLoading, dbError, getExpectedResultDynamic]);

  const handleRun = useCallback(async () => {
    if (!sql.trim()) return;
    setIsExecuting(true);
    
    // Add full context entry to history if not a duplicate of last
    setQueryHistory(prev => {
      const entry = { sql, questionId: currentQ.id, dbName: db, prompt: currentQ.prompt?.substring(0, 50) };
      const filtered = prev.filter(h => h.sql !== sql);
      return [entry, ...filtered].slice(0, 50);
    });

    try {
      let originalRes = await executeQuery(sql);
      let finalRes = { ...originalRes };
      if (!originalRes.error && currentQ.verificationSQL) {
        const verRes = await runVerification(currentQ.verificationSQL);
        finalRes = { ...verRes, execTimeMs: originalRes.execTimeMs };
      }
      setResult(finalRes);
      if (finalRes.error) {
        setValidation({ isCorrect: false, message: finalRes.error });
        onProgressUpdate(currentQ, db, 'attempted');
      } else {
        if (!expectedResult || expectedResult.columns.length === 0) {
          setValidation({ isCorrect: false, message: 'Loading expected results...' });
        } else {
          const val = validateAnswer(finalRes, expectedResult, currentQ.requiresOrder);
          setValidation(val);
          if (val.isCorrect) {
            onProgressUpdate(currentQ, db, 'complete');
            // Only fire celebration if this is the FIRST time solving it
            if (progress[currentQ.id] !== 'complete') {
              const diff = (currentQ.difficulty || '').toLowerCase();
              const pts = diff === 'hard' ? 50 : diff === 'medium' ? 30 : 10;
              fireConfetti();
              toast({
                type: 'success',
                title: diff === 'hard' ? '🔥 Hard Problem Solved!' : diff === 'medium' ? '⭐ Nice Work!' : '✅ Correct!',
                message: `+${pts} points earned • ${currentQ.difficulty || 'Easy'} question completed`,
              });
            }
          } else if (progress[currentQ.id] !== 'complete') {
            onProgressUpdate(currentQ, db, 'attempted');
          }
        }
      }
    } finally {
      setIsExecuting(false);
    }
  }, [sql, executeQuery, runVerification, currentQ, validateAnswer, expectedResult, onProgressUpdate, progress, db, fireConfetti, toast]);

  const handleExplain = useCallback(async () => {
    if (!sql.trim()) return;
    setIsExecuting(true);
    try {
      const plan = await getExplainPlan(sql);
      if (plan.error) {
         setResult({ error: plan.error });
         setValidation({ isCorrect: false, message: 'Syntax Error while parsing EXPLAIN plan.' });
      } else {
         setResult(plan);
         setValidation({ isCorrect: true, message: 'Query Execution Plan' });
      }
    } finally {
      setIsExecuting(false);
    }
  }, [sql, getExplainPlan]);

  const [shortcuts, setShortcuts] = useState(() => loadShortcuts());
  // Listen for shortcut changes across the app
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'sql-practice-shortcuts' || !e.key) setShortcuts(loadShortcuts());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Global Shortcuts (Unified)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input/textarea (except Monaco which stops propagation appropriately)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      
      if (isShortcutMatch(e, shortcuts.toggleSidebar.combo)) {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      } else if (isShortcutMatch(e, shortcuts.toggleRightPanel.combo)) {
        e.preventDefault();
        setRightPanelOpen(prev => !prev);
      } else if (isShortcutMatch(e, shortcuts.explainQuery.combo)) {
        e.preventDefault();
        handleExplain();
      } else if (isShortcutMatch(e, shortcuts.runQuery.combo)) {
        e.preventDefault();
        handleRun();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, handleExplain, handleRun, setSidebarOpen, setRightPanelOpen]);

  // Auto-run timer (after handleRun is defined)
  useEffect(() => {
    if (!settings.autoRunAfterTyping || !sql.trim()) return;
    const timer = setTimeout(() => { handleRun(); }, 1200);
    return () => clearTimeout(timer);
  }, [sql, settings.autoRunAfterTyping, handleRun]);

  const handlePreviewTable = useCallback(tableName => { setPreviewTableName(tableName); }, []);

  const navigateTo = useCallback(direction => {
    const idx = dbQuestions.findIndex(q => q.id === currentQ.id);
    let nextQ = null;
    if (direction === 'prev' && idx > 0) nextQ = dbQuestions[idx - 1];
    if (direction === 'next' && idx < dbQuestions.length - 1) nextQ = dbQuestions[idx + 1];
    if (nextQ) {
      setCurrentQ(nextQ);
      // Restore persisted SQL for this question
      const savedSql = localStorage.getItem(`sql-persist-${nextQ.id}`);
      setSql(savedSql || '');
      setResult(null);
      setValidation(null);
    }
  }, [currentQ, dbQuestions]);

  // Handle selecting question from browser — auto-switch DB if needed
  const handleSelectQuestion = useCallback(q => {
    if (q.db !== db) {
      setDb(q.db);
    }
    setCurrentQ(q);
    setShowBrowser(false);
    setResult(null);
    setValidation(null);
    // Restore persisted SQL for this specific question
    const savedSql = localStorage.getItem(`sql-persist-${q.id}`);
    setSql(savedSql || '');
  }, [db]);

  const currentIdx = dbQuestions.findIndex(q => q.id === currentQ.id);

  // Close DB picker when clicking outside
  useEffect(() => {
    if (!showDbPicker) return;
    const handler = () => setShowDbPicker(false);
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [showDbPicker]);

  if (dbError) {
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, color: 'var(--error)' }}>
      <div style={{ fontSize: 48 }}>💥</div>
      <div style={{ fontWeight: 700 }}>Database Error</div>
      <div style={{ color: 'var(--muted)', maxWidth: 400, textAlign: 'center' }}>{dbError}</div>
      <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Home</button>
    </div>;
  }

    const fontSizeClass = settings.editorFontSize >= 18 ? 'large' : settings.editorFontSize <= 12 ? 'small' : 'medium';
    return <div className="practice-root page-enter" data-theme={settings.darkMode ? 'dark' : 'light'} data-font-size={fontSizeClass}>
    {/* Top Nav */}
    <nav className="practice-nav" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 50, background: 'var(--surface)', borderBottom: '1px solid var(--border)', gap: 12 }}>
      <button id="run-btn" className="btn btn-ghost" onClick={handleRun} disabled={isLoading || !sql.trim()} style={{ color: 'var(--success)', fontWeight: 600, gap: 6, width: 85, justifyContent: 'center' }}>
        {isLoading ? <RotateCcw size={14} className="spin" /> : <Play size={14} strokeWidth={2.5} fill="currentColor" />}
        {isLoading ? 'Running' : 'Run'}
      </button>
      <button className="btn btn-ghost" onClick={() => navigate('/guide')} style={{ color: 'var(--text-secondary)', gap: 6 }}>
        <BookOpen size={14} />
        Docs
      </button>
      <button className="btn btn-ghost" title="Settings" onClick={onShowSettings} style={{ gap: 6 }}>
        <SettingsIcon size={14} />
        Settings
      </button>
      <button id="browse-btn" className="btn btn-ghost" onClick={() => setShowBrowser(true)} style={{ gap: 6 }}>
        <List size={14} />
        Questions
      </button>

      <div style={{ flex: 1 }} />

      {!user ? (
        <button className="btn btn-ghost" onClick={onShowAuth} style={{ color: 'var(--primary)' }}>Login</button>
      ) : (
        <span style={{ fontSize: 12, color: 'var(--muted)', marginRight: 8 }}>{user.email}</span>
      )}

      <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ gap: 5 }}>
        <Home size={14} />
        Home
      </button>

      {/* Choose DB button + dropdown */}
      <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button
          className="btn btn-ghost"
          onClick={() => setShowDbPicker(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>{dbInfo.icon}</span>
          <span>{dbInfo.label}</span>
          <ChevronDown size={13} strokeWidth={2} style={{ opacity: 0.6 }} />
        </button>
        {showDbPicker && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            zIndex: 9999,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            minWidth: 220,
            padding: '8px 0',
            marginTop: 4,
          }}>
            <div style={{ padding: '6px 14px 8px', fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
              Switch Database
            </div>
            {Object.keys(DB_INFO).map(d => {
              const info = DB_INFO[d];
              const dbQs = getQuestionsForDb(d);
              const comp = dbQs.filter(q => progress[q.id] === 'complete').length;
              const isActive = d === db;
              return (
                <button
                  key={d}
                  onClick={() => handleSwitchDb(d)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 14px',
                    background: isActive ? 'var(--primary-light, rgba(171,136,109,0.12))' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 18 }}>{info.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isActive ? 700 : 500 }}>{info.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{comp}/{info.questionCount} done</div>
                  </div>
                  {isActive && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button className="btn btn-ghost" onClick={() => setShowERDiagram(true)} title="View ER Diagram" style={{ gap: 5 }}>
        <Database size={14} />
        {dbInfo.label} Schema
      </button>

      <button
        className="btn btn-ghost"
        onClick={onToggleDark}
        title={settings.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        style={{ padding: '6px 9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {settings.darkMode
          ? <Sun size={16} strokeWidth={2} />
          : <Moon size={16} strokeWidth={2} />}
      </button>
    </nav>

    {/* Loading overlay */}
    {isLoading && <div className="loading-overlay">
      <div className="spinner" />
      <div style={{ marginTop: 12, color: 'var(--muted)' }}>Loading {dbInfo.label} database…</div>
    </div>}

    {/* Main layout */}
    <div className="practice-layout" style={{ 
      '--sidebar-width': sidebarOpen ? '280px' : '0px',
      '--right-panel-width': rightPanelOpen ? '350px' : '0px'
    }}>
      {/* 1. Left Panel: Schema Sidebar */}
      <aside className="sidebar-wrap">
        <SchemaSidebar dbName={db} executeQuery={executeQuery} onPreviewTable={handlePreviewTable} />
      </aside>

      {/* 2. Center Panel: Editor + Results */}
      <main className="center-workspace" ref={workspaceRef} style={{ gridTemplateRows: `${editorHeightPct}% 6px 1fr` }}>
        {/* Editor */}
        <div className="editor-col">
          <div className="editor-col-header">
            <span className="editor-label">SQL Editor</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {!sidebarOpen && <button className="btn btn-ghost btn-sm" onClick={() => setSidebarOpen(true)}>📊 Schema</button>}
            </div>
          </div>
          <div className="monaco-wrap">
            <SqlEditor value={sql} onChange={setSql} onRun={handleRun} disabled={isLoading} dbName={db} fontSize={settings.editorFontSize} autoComplete={settings.autoCompleteSql} darkMode={settings.darkMode} />
          </div>
          <div className="editor-actions" style={{ position: 'relative' }}>
            <button id="run-query-btn" className="btn btn-primary" onClick={handleRun} disabled={isLoading || isExecuting || !sql.trim()}>
              {isExecuting ? <RotateCcw size={16} className="spinner" /> : '▶ Run Query'}
            </button>
            <button id="explain-query-btn" className="btn btn-secondary" onClick={handleExplain} disabled={isLoading || isExecuting || !sql.trim()} title="View Query Execution Plan">🔍 Explain</button>
            {/\bJOIN\b/i.test(sql) && (
              <button 
                className="btn btn-secondary" 
                onClick={() => setJoinAnalysisData({ db: executeQuery, sql })}
                title="Open Advanced Join Analysis"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                🔗 Visualize Joins
              </button>
            )}
            <EdgeCaseTester getEdgeCaseResults={getEdgeCaseResults} sql={sql} />
            
            {hasSubquery(sql) && (
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowCteModal(true)} 
                title="Convert subquery to a Common Table Expression (CTE)"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                🪄 Convert to CTE
              </button>
            )}

            {queryHistory.length > 0 && (
              <div style={{ position: 'relative', marginLeft: 'auto' }}>
                <select 
                  className="btn btn-ghost btn-sm"
                  style={{ appearance: 'none', paddingRight: '24px', maxWidth: '220px', cursor: 'pointer' }}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value, 10);
                    if (!isNaN(idx) && queryHistory[idx]) {
                      const entry = queryHistory[idx];
                      // Restore full context: switch DB + question + SQL
                      if (entry.dbName && entry.dbName !== db) {
                        navigate('/practice/' + entry.dbName);
                      }
                      if (entry.questionId) {
                        const q = allQuestions.find(q => q.id === entry.questionId);
                        if (q) setCurrentQ(q);
                      }
                      setSql(entry.sql);
                    }
                    e.target.value = "";
                  }}
                  value=""
                >
                  <option value="" disabled>📜 History</option>
                  {queryHistory.map((entry, i) => (
                    <option key={i} value={i}>
                      {entry.prompt ? `${entry.prompt.substring(0,25)}… | ${entry.sql.substring(0,20)}` : entry.sql?.substring(0, 40)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Resizer */}
        <div 
          onMouseDown={() => setIsDragging(true)}
          style={{
            height: '6px',
            cursor: 'row-resize',
            background: isDragging ? 'var(--primary)' : 'var(--surface-2)',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => { if (!isDragging) e.currentTarget.style.background = 'var(--primary-light)'; }}
          onMouseLeave={e => { if (!isDragging) e.currentTarget.style.background = 'var(--surface-2)'; }}
        />

        {/* Results */}
        <div className="results-col">
          <ResultsPanel
            result={result}
            validation={validation}
            sql={sql}
            executeQuery={executeQuery}
            isRunning={isExecuting || isLoading}
          />
        </div>
      </main>

      {/* 3. Right Panel: Question & Hints */}
      <aside className="question-pane-wrap">
        <QuestionCard
          question={currentQ}
          expectedResult={expectedResult}
          status={progress[currentQ.id] ?? 'incomplete'}
          onOpenBrowser={() => setShowBrowser(true)}
          onNavigate={navigateTo}
          hasPrev={currentIdx > 0}
          hasNext={currentIdx < dbQuestions.length - 1}
          questionNumber={currentIdx + 1}
          totalQuestions={dbQuestions.length}
          timedChallenges={settings.timedChallenges}
          onTimerExpire={() => {
            // Auto-run when timer expires so user sees their result
            if (sql.trim()) handleRun();
          }}
        />
      </aside>
    </div>

    {/* Question Browser */}
    {showBrowser && <QuestionBrowser
      questions={allQuestions}
      progress={progress}
      currentQuestionId={currentQ.id}
      onSelectQuestion={handleSelectQuestion}
      onClose={() => setShowBrowser(false)}
    />}

    {/* ER Diagram Modal */}
    {showERDiagram && <ERDiagramModal dbName={db} onClose={() => setShowERDiagram(false)} />}

    {/* Table Preview Modal */}
    {previewTableName && <TablePreviewModal db={db} tableName={previewTableName} onClose={() => setPreviewTableName(null)} />}

    {joinAnalysisData && (
      <JoinAnalysisModal 
        executeQuery={joinAnalysisData.db} 
        sql={joinAnalysisData.sql} 
        onClose={() => setJoinAnalysisData(null)} 
      />
    )}

    <CteConverterModal 
      isOpen={showCteModal}
      onClose={() => setShowCteModal(false)}
      originalSql={sql}
      convertedSql={convertSubqueryToCTE(sql) || sql}
      onUseConverted={(newSql) => {
        setSql(newSql);
        setResult(null);
      }}
    />
    <ConfettiComponent />
  </div>;
}
