import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { RotateCcw, Play, Settings as SettingsIcon, List, Home, ChevronDown, Database, Sun, Moon } from 'lucide-react';
import { DB_INFO } from '@/data/schemas';
import { allQuestions, getQuestionsForDb } from '@/data/index';
import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { SchemaSidebar } from '@/features/practice/SchemaSidebar';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { ResultsPanel } from '@/features/practice/ResultsPanel';
import { QuestionCard } from '@/features/practice/QuestionCard';
import { QuestionBrowser } from '@/features/practice/QuestionBrowser';
import { ERDiagramModal } from '@/features/visualizers/ERDiagramModal';
import { TablePreviewModal } from '@/features/visualizers/TablePreviewModal';
import { AnimatedJoinVisualizer } from '@/features/visualizers/AnimatedJoinVisualizer';
import { CteConverterModal } from '@/features/visualizers/CteConverterModal';
import { useConfetti } from '@/features/gamification/ConfettiBlast';
import { useToast } from '@/shared/ui/ToastSystem';
import { loadShortcuts, isShortcutMatch } from '@/utils/shortcutManager';
import { hasSubquery, convertSubqueryToCTE } from '@/utils/sqlAnalysis';
import { useQuerySafetyGuard } from '@/features/ai/QuerySafetyGuard';

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
      // If we found a targetQ (either from qParam, or initial load, or db change), and it's different
      if (!targetQ && (!currentQ || currentQ.db !== routeDb)) {
        // Auto-select first incomplete question if currentQ belongs to another DB
        targetQ = dbQs.find(q => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
      }

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
  const [executedSql, setExecutedSql] = useState('');
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
  const [showOverflow, setShowOverflow] = useState(false);

  // Column widths (px) — draggable
  const [questionW, setQuestionW] = useState(360);
  const [schemaW, setSchemaW]     = useState(280);
  const [isDraggingLeft, setIsDraggingLeft]   = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const layoutRef = useRef(null);

  // Horizontal column resize
  useEffect(() => {
    const onMove = (e) => {
      if (!layoutRef.current) return;
      const rect = layoutRef.current.getBoundingClientRect();
      if (isDraggingLeft)  setQuestionW(Math.max(220, Math.min(600, e.clientX - rect.left)));
      if (isDraggingRight) setSchemaW(Math.max(180, Math.min(500, rect.right - e.clientX)));
    };
    const onUp = () => { setIsDraggingLeft(false); setIsDraggingRight(false); };
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [isDraggingLeft, isDraggingRight]);

  // Global Keyboard Shortcuts (Moved downwards to unify)
  // Resizable Panes State
  const workspaceRef = useRef(null);
  const [editorHeightPct, setEditorHeightPct] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const toast = useToast();
  const { fireConfetti, ConfettiComponent } = useConfetti();
  const { checkSafety, SafetyModal } = useQuerySafetyGuard();

  // Build schema context string for AI features
  const dbSchemaContext = useMemo(() => {
    const dbInfo = DB_INFO[db];
    if (!dbInfo || !dbInfo.tables) return '';
    return dbInfo.tables.map(t =>
      `${t.name}(${(t.columns || []).map(c => c.name).join(', ')})`
    ).join('; ');
  }, [db]);

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
  const dbQuestions = useMemo(() => {
    return getQuestionsForDb(db);
  }, [db]);

  const { isLoading, error: dbError, executeQuery, resetDb, validateAnswer, runVerification, getExpectedResultDynamic, getExplainPlan } = useSqlDatabase(db);
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

    // Run safety check first (client-side is instant, LLM check is async but non-blocking for fast queries)
    const isSafe = await checkSafety(sql, currentQ);
    if (!isSafe) return; // user chose to edit query

    setIsExecuting(true);
    setExecutedSql(sql);
    
    // Add full context entry to history if not a duplicate of last
    setQueryHistory(prev => {
      const entry = { sql, questionId: currentQ.id, dbName: db, prompt: currentQ.prompt?.substring(0, 50) };
      const filtered = prev.filter(h => h.sql !== sql);
      return [entry, ...filtered].slice(0, 50);
    });
    try {
      // Execute the user query and (if verification is configured) hidden solutions + diff in ONE pass
      if (currentQ && currentQ.solutionSQL && !currentQ.isAiGenerated) {
        const val = await validateAnswer(sql, currentQ.solutionSQL, currentQ.verificationSQL, currentQ.requiresOrder);
        // The worker payload returns userResult alongside the validation status
        if (val.userResult) {
           setResult(val.userResult);
        } else if (val.message.startsWith('SQL Error:') || val.message.startsWith('System Error:')) {
           setResult({ error: val.message });
        }
        
        setValidation(val);
        if (val.isCorrect) {
          onProgressUpdate(currentQ, db, 'complete');
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
        } else {
          if (progress[currentQ.id] !== 'complete') {
            onProgressUpdate(currentQ, db, 'attempted');
          }
        }
      } else {
        // Sandbox mode or free-play mode (no active question checking)
        const originalRes = await executeQuery(sql);
        setResult(originalRes);
        if (originalRes.error) {
           setValidation({ isCorrect: false, message: originalRes.error });
        } else {
           setValidation(null);
        }
      }
    } finally {
      setIsExecuting(false);
    }
  }, [sql, executeQuery, runVerification, currentQ, validateAnswer, expectedResult, onProgressUpdate, progress, db, fireConfetti, toast]);

  const handleExplain = useCallback(async () => {
    if (!sql.trim()) return;
    setIsExecuting(true);
    setExecutedSql(sql);
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

    {/* ══ NAV ══ */}
    <nav style={{ display: 'flex', alignItems: 'center', height: 48, background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0, position: 'relative', zIndex: 20, overflow: 'visible' }}>

      {/* ── LEFT cluster ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, height: '100%', flex: 1 }}>
        {/* Home */}
        <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ gap: 5, fontSize: 12, padding: '0 12px', borderRadius: 0 }}>
          <Home size={13} /> Home
        </button>

        <div style={{ width: 1, background: 'var(--border)', margin: '8px 0' }} />

        {/* Problem toggle — underline style like LeetCode */}
        <button
          onClick={() => setRightPanelOpen(v => !v)}
          style={{ fontSize: 12, fontWeight: 600, padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', color: rightPanelOpen ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: rightPanelOpen ? '2px solid var(--primary)' : '2px solid transparent', borderRadius: 0, height: '100%', transition: 'color 0.15s, border-color 0.15s' }}
          title={rightPanelOpen ? 'Hide problem panel' : 'Show problem panel'}
        >
          Problem
        </button>

        <div style={{ width: 1, background: 'var(--border)', margin: '8px 0' }} />

        {/* DB picker */}
        <div style={{ position: 'relative', height: '100%', display: 'flex' }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowDbPicker(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', borderRadius: 0, height: '100%' }}
          >
            {dbInfo.label} <ChevronDown size={11} style={{ opacity: 0.5 }} />
          </button>
          {showDbPicker && (
            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 999, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', minWidth: 230, padding: '6px 0', marginTop: 2 }}>
              <div style={{ padding: '5px 14px 6px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Switch Database</div>
              {Object.keys(DB_INFO).map(d => {
                const info = DB_INFO[d]; const dbQs = getQuestionsForDb(d);
                const comp = dbQs.filter(q => progress[q.id] === 'complete').length;
                const isActive = d === db;
                return (
                  <button key={d} onClick={() => handleSwitchDb(d)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 14px', background: isActive ? 'var(--primary-muted)' : 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 13, fontFamily: 'var(--font-sans)', transition: 'background 0.12s' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; }}
                  >
                    <span style={{ flex: 1, fontWeight: isActive ? 700 : 400 }}>{info.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{comp}/{info.questionCount}</span>
                    {isActive && <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>


      </div>

      {/* ── CENTER: Run button ── */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="nav-run-wrap">
          <button id="run-btn" className="btn btn-primary" onClick={handleRun}
            disabled={isLoading || isExecuting || !sql.trim()}
            style={{ gap: 7, padding: '0 22px', height: 34, fontWeight: 700, fontSize: 13, borderRadius: 8, minWidth: 100 }}
          >
            {isExecuting ? <><RotateCcw size={13} className="spin" /> Running</> : <><Play size={13} strokeWidth={2.5} fill="currentColor" /> Run</>}
          </button>
          <span className="nav-run-shortcut">Ctrl + Enter</span>
        </div>
      </div>

      {/* ── RIGHT cluster ── */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, height: '100%', flex: 1, justifyContent: 'flex-end' }}>
        {/* Schema toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          style={{ fontSize: 12, fontWeight: 600, padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', color: sidebarOpen ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: sidebarOpen ? '2px solid var(--primary)' : '2px solid transparent', borderRadius: 0, height: '100%', transition: 'color 0.15s, border-color 0.15s' }}
          title={sidebarOpen ? 'Hide schema panel' : 'Show schema panel'}
        >
          Schema
        </button>

        <div style={{ width: 1, background: 'var(--border)', margin: '8px 0' }} />

        {/* ⋯ Overflow menu */}
        <div style={{ position: 'relative', height: '100%', display: 'flex' }}>
          <button
            onClick={() => setShowOverflow(v => !v)}
            style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: showOverflow ? 'var(--surface-2)' : 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18, fontWeight: 700, letterSpacing: 1, borderRadius: 0, height: '100%', transition: 'background 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = showOverflow ? 'var(--text)' : 'var(--muted)'; }}
            title="More options"
          >
            ⋯
          </button>
          {showOverflow && (
            <>
              {/* Backdrop to close */}
              <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setShowOverflow(false)} />
              <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 99, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.22)', minWidth: 220, padding: '6px 0', marginTop: 2 }}>
                {/* User info */}
                {user && (
                  <div style={{ padding: '8px 14px 6px', fontSize: 11, color: 'var(--muted)', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                    Logged in as <strong style={{ color: 'var(--text)' }}>{user.email}</strong>
                  </div>
                )}
                {!user && (
                  <button className="overflow-menu-item" onClick={() => { onShowAuth(); setShowOverflow(false); }}>
                    👤 Login
                  </button>
                )}

                <button className="overflow-menu-item" onClick={() => { setShowBrowser(true); setShowOverflow(false); }}>
                  <List size={14} /> All Questions
                </button>

                <button className="overflow-menu-item" onClick={() => { handleExplain(); setShowOverflow(false); }}
                  disabled={isLoading || isExecuting || !sql.trim()}>
                  🔍 Explain Query <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>Ctrl+E</span>
                </button>

                {/\bJOIN\b/i.test(sql) && (
                  <button className="overflow-menu-item" onClick={() => { setJoinAnalysisData({ db: executeQuery, sql }); setShowOverflow(false); }}>
                    🔗 Visualize Joins
                  </button>
                )}

                {hasSubquery(sql) && (
                  <button className="overflow-menu-item" onClick={() => { setShowCteModal(true); setShowOverflow(false); }}>
                    🪄 Convert to CTE
                  </button>
                )}

                {queryHistory.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                    <div style={{ padding: '4px 14px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Query History</div>
                    {queryHistory.slice(0, 5).map((entry, i) => (
                      <button key={i} className="overflow-menu-item" style={{ fontSize: 11 }}
                        onClick={() => {
                          if (entry.dbName && entry.dbName !== db) navigate('/practice/' + entry.dbName);
                          if (entry.questionId) { const q = allQuestions.find(q => q.id === entry.questionId); if (q) setCurrentQ(q); }
                          setSql(entry.sql); setShowOverflow(false);
                        }}>
                        📜 {entry.prompt ? entry.prompt.substring(0, 28) + '…' : entry.sql?.substring(0, 32)}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                  <button className="overflow-menu-item" onClick={() => { setShowERDiagram(true); setShowOverflow(false); }}>
                    <Database size={13} /> ER Diagram
                  </button>
                  <button className="overflow-menu-item" onClick={() => { onShowSettings(); setShowOverflow(false); }}>
                    <SettingsIcon size={13} /> Settings
                  </button>
                  <button className="overflow-menu-item" onClick={() => { onToggleDark(); setShowOverflow(false); }}>
                    {settings.darkMode ? <Sun size={13} /> : <Moon size={13} />} {settings.darkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>

    {/* Loading overlay */}
    {isLoading && <div className="loading-overlay"><div className="spinner" /><div style={{ marginTop: 12, color: 'var(--muted)' }}>Loading {dbInfo.label}…</div></div>}

    {/* ══ MAIN: 3-column flex layout ══ */}
    <div ref={layoutRef} style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

      {/* LEFT: Question panel */}
      <div style={{ width: rightPanelOpen ? questionW : 0, minWidth: 0, overflow: 'hidden', flexShrink: 0, transition: 'width 0.22s ease', background: 'var(--surface)', borderRight: rightPanelOpen ? '1px solid var(--border)' : 'none' }}>
        <div style={{ width: questionW, height: '100%', overflow: 'hidden' }}>
          <QuestionCard
            question={currentQ} expectedResult={expectedResult}
            status={progress[currentQ.id] ?? 'incomplete'}
            onOpenBrowser={() => setShowBrowser(true)}
            onNavigate={navigateTo}
            hasPrev={currentIdx > 0} hasNext={currentIdx < dbQuestions.length - 1}
            questionNumber={currentIdx + 1} totalQuestions={dbQuestions.length}
            timedChallenges={settings.timedChallenges}
            onTimerExpire={() => { if (sql.trim()) handleRun(); }}
            currentSql={sql} lastValidation={validation}
            dbSchemaContext={dbSchemaContext} executeQuery={executeQuery}
          />
        </div>
      </div>

      {/* Drag handle: left column */}
      {rightPanelOpen && (
        <div
          onMouseDown={() => setIsDraggingLeft(true)}
          style={{ width: 4, flexShrink: 0, cursor: 'col-resize', background: isDraggingLeft ? 'var(--primary)' : 'transparent', transition: 'background 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.opacity = '0.4'; }}
          onMouseLeave={e => { if (!isDraggingLeft) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '1'; } }}
        />
      )}

      {/* CENTER: Editor + Results */}
      <main ref={workspaceRef} style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateRows: `${editorHeightPct}% 4px 1fr`, overflow: 'hidden' }}>

        <div className="editor-col">
          <div className="editor-col-header">
            <span className="editor-label">SQL Editor</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {hasSubquery(sql) && (
                <button className="btn btn-ghost btn-sm" onClick={() => setShowCteModal(true)} style={{ fontSize: 11 }}>🪄 CTE</button>
              )}
              {/\bJOIN\b/i.test(sql) && (
                <button className="btn btn-ghost btn-sm" onClick={() => setJoinAnalysisData({ db: executeQuery, sql })} style={{ fontSize: 11 }}>🔗 Joins</button>
              )}
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>Ctrl+Enter to run</span>
            </div>
          </div>
          <div className="monaco-wrap">
            <SqlEditor value={sql} onChange={setSql} onRun={handleRun} disabled={isLoading} dbName={db} fontSize={settings.editorFontSize} autoComplete={settings.autoCompleteSql} darkMode={settings.darkMode} />
          </div>
          <div className="editor-actions">
            <button id="run-query-btn" className="btn btn-primary" onClick={handleRun} disabled={isLoading || isExecuting || !sql.trim()}>
              {isExecuting ? <><RotateCcw size={14} className="spin" /> Running…</> : !sql.trim() ? 'Type a query…' : '▶ Run Query'}
            </button>
            <button id="explain-query-btn" className="btn btn-secondary" onClick={handleExplain} disabled={isLoading || isExecuting || !sql.trim()}>
              🔍 Explain
            </button>
          </div>
        </div>

        {/* Vertical drag handle */}
        <div
          onMouseDown={() => setIsDragging(true)}
          style={{ height: 4, cursor: 'row-resize', background: isDragging ? 'var(--primary)' : 'var(--border)', transition: 'background 0.2s' }}
          onMouseEnter={e => { if (!isDragging) e.currentTarget.style.background = 'var(--primary-muted)'; }}
          onMouseLeave={e => { if (!isDragging) e.currentTarget.style.background = 'var(--border)'; }}
        />

        <div className="results-col">
          <ResultsPanel result={result} validation={validation} sql={executedSql} executeQuery={executeQuery} isRunning={isExecuting} question={currentQ} />
        </div>
      </main>

      {/* Drag handle: right column */}
      {sidebarOpen && (
        <div
          onMouseDown={() => setIsDraggingRight(true)}
          style={{ width: 4, flexShrink: 0, cursor: 'col-resize', background: isDraggingRight ? 'var(--primary)' : 'transparent', transition: 'background 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.opacity = '0.4'; }}
          onMouseLeave={e => { if (!isDraggingRight) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.opacity = '1'; } }}
        />
      )}

      {/* RIGHT: Schema sidebar */}
      <div style={{ width: sidebarOpen ? schemaW : 0, minWidth: 0, overflow: 'hidden', flexShrink: 0, transition: 'width 0.22s ease', background: 'var(--surface)', borderLeft: sidebarOpen ? '1px solid var(--border)' : 'none' }}>
        <div style={{ width: schemaW, height: '100%', overflow: 'hidden' }}>
          <SchemaSidebar dbName={db} executeQuery={executeQuery} onPreviewTable={handlePreviewTable} />
        </div>
      </div>

    </div>

    {/* Modals */}
    {showBrowser && <QuestionBrowser questions={allQuestions} progress={progress} currentQuestionId={currentQ.id} onSelectQuestion={handleSelectQuestion} onClose={() => setShowBrowser(false)} />}
    {showERDiagram && <ERDiagramModal dbName={db} onClose={() => setShowERDiagram(false)} />}
    {previewTableName && <TablePreviewModal db={db} tableName={previewTableName} onClose={() => setPreviewTableName(null)} />}
    {joinAnalysisData && <AnimatedJoinVisualizer executeQuery={joinAnalysisData.db} sql={joinAnalysisData.sql} onClose={() => setJoinAnalysisData(null)} />}
    <CteConverterModal isOpen={showCteModal} onClose={() => setShowCteModal(false)} originalSql={sql} convertedSql={convertSubqueryToCTE(sql) || sql} onUseConverted={s => { setSql(s); setResult(null); }} />
    <ConfettiComponent />
    <SafetyModal />
  </div>;
}
