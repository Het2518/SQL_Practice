import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  RotateCcw,
  Play,
  Settings as SettingsIcon,
  List,
  Home,
  ChevronDown,
  Database,
  Sun,
  Moon,
} from 'lucide-react';
import { DB_INFO } from '@/data/schemas';
import { allQuestions, getQuestionsForDb } from '@/data/index';
import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { SchemaSidebar } from '@/features/practice/SchemaSidebar';
import { QuestionCard } from '@/features/practice/QuestionCard';
import { QuestionBrowser } from '@/features/practice/QuestionBrowser';
import { AiTutorPanel } from '@/features/ai/AiTutorPanel';
const SqlEditor = lazy(() =>
  import('@/features/practice/SqlEditor').then((m) => ({ default: m.SqlEditor }))
);
const ResultsPanel = lazy(() =>
  import('@/features/practice/ResultsPanel').then((m) => ({ default: m.ResultsPanel }))
);
const ERDiagramModal = lazy(() =>
  import('@/features/visualizers/ERDiagramModal').then((m) => ({ default: m.ERDiagramModal }))
);
const TablePreviewModal = lazy(() =>
  import('@/features/visualizers/TablePreviewModal').then((m) => ({ default: m.TablePreviewModal }))
);
const AnimatedJoinVisualizer = lazy(() =>
  import('@/features/visualizers/AnimatedJoinVisualizer').then((m) => ({
    default: m.AnimatedJoinVisualizer,
  }))
);
const CteConverterModal = lazy(() =>
  import('@/features/visualizers/CteConverterModal').then((m) => ({ default: m.CteConverterModal }))
);
import { useConfetti } from '@/features/gamification/ConfettiBlast';
import { useToast } from '@/shared/ui/ToastSystem';
import { loadShortcuts, isShortcutMatch } from '@/utils/shortcutManager';
import { hasSubquery, convertSubqueryToCTE } from '@/utils/sqlAnalysis';
import { useQuerySafetyGuard } from '@/features/ai/QuerySafetyGuard';
import { Button } from '@/shared/ui/Button';
import { Header } from '@/shared/ui/Header';
import { useAuth } from '@/hooks/useAuth';
import { useProgressStore } from '@/stores/useProgressStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export function PracticeView({ onShowAuth, onProgressUpdate, onShowSettings }) {
  const { user } = useAuth();
  const { progress } = useProgressStore();
  const { gameState } = useGamificationStore();
  const { settings, toggleDarkMode } = useSettingsStore();
  const navigate = useNavigate();
  const { db: routeDb } = useParams();

  const initialDb = routeDb || 'airlines';
  const [db, setDb] = useState(initialDb);

  const [searchParams] = useSearchParams();
  const qParam = searchParams.get('q');

  const [currentQ, setCurrentQ] = useState(() => {
    const dbQs = getQuestionsForDb(initialDb);
    if (qParam) {
      const found = dbQs.find((q) => q.id === qParam);
      if (found) return found;
    }
    return dbQs.find((q) => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
  });

  useEffect(() => {
    if (routeDb) {
      if (routeDb !== db) setDb(routeDb);
      const dbQs = getQuestionsForDb(routeDb);
      let targetQ;
      if (qParam) {
        targetQ = dbQs.find((q) => String(q.id) === qParam);
      }
      // If we found a targetQ (either from qParam, or initial load, or db change), and it's different
      if (!targetQ && (!currentQ || currentQ.db !== routeDb)) {
        // Auto-select first incomplete question if currentQ belongs to another DB
        targetQ = dbQs.find((q) => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
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
  const [showAiTutor, setShowAiTutor] = useState(false);
  const [previewTableName, setPreviewTableName] = useState(null);
  const [showCteModal, setShowCteModal] = useState(false);
  const [showDbPicker, setShowDbPicker] = useState(false);
  const [joinAnalysisData, setJoinAnalysisData] = useState(null);

  useEffect(() => {
    const handleOpenJoinAnalysis = (e) => setJoinAnalysisData(e.detail);
    const handleOpenERDiagram = () => setShowERDiagram(true);

    window.addEventListener('open-join-analysis', handleOpenJoinAnalysis);
    window.addEventListener('open-er-diagram', handleOpenERDiagram);
    return () => {
      window.removeEventListener('open-join-analysis', handleOpenJoinAnalysis);
      window.removeEventListener('open-er-diagram', handleOpenERDiagram);
    };
  }, []);

  // Idle prefetching for heavy visualizers
  useEffect(() => {
    const prefetch = () => {
      import('@/features/visualizers/ERDiagramModal');
      import('@/features/visualizers/TablePreviewModal');
      import('@/features/visualizers/AnimatedJoinVisualizer');
      import('@/features/visualizers/CteConverterModal');
    };
    if (window.requestIdleCallback) {
      window.requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 2000);
    }
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showOverflow, setShowOverflow] = useState(false);

  // Column widths (px) — draggable
  const [questionW, setQuestionW] = useState(360);
  const [schemaW, setSchemaW] = useState(280);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const layoutRef = useRef(null);

  // Horizontal column resize
  useEffect(() => {
    const onMove = (e) => {
      if (!layoutRef.current) return;
      const rect = layoutRef.current.getBoundingClientRect();
      if (isDraggingLeft) setQuestionW(Math.max(220, Math.min(600, e.clientX - rect.left)));
      if (isDraggingRight) setSchemaW(Math.max(180, Math.min(500, rect.right - e.clientX)));
    };
    const onUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
    };
    if (isDraggingLeft || isDraggingRight) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
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
    return dbInfo.tables
      .map((t) => `${t.name}(${(t.columns || []).map((c) => c.name).join(', ')})`)
      .join('; ');
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

  const {
    isLoading,
    error: dbError,
    executeQuery,
    resetDb,
    validateAnswer,
    runVerification,
    getExpectedResultDynamic,
    getExplainPlan,
  } = useSqlDatabase(db);
  const [isExecuting, setIsExecuting] = useState(false);

  // Switch DB inline
  const handleSwitchDb = useCallback(
    (newDb) => {
      if (newDb === db) {
        setShowDbPicker(false);
        return;
      }
      navigate('/practice/' + newDb);
      setShowDbPicker(false);
    },
    [db, navigate]
  );

  // History now stores { sql, questionId, dbName } objects for full context restore
  const [queryHistory, setQueryHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('sql-practice-history-v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sql-practice-history-v2', JSON.stringify(queryHistory.slice(0, 50)));
  }, [queryHistory]);

  // Fetch expected results when question changes (SQL restore is handled by navigation handlers)
  useEffect(() => {
    let mounted = true;
    setExpectedResult(null);
    if (!isLoading && !dbError) {
      getExpectedResultDynamic(currentQ.solutionSQL, currentQ.verificationSQL).then((er) => {
        if (mounted) setExpectedResult(er);
      });
    }
    return () => {
      mounted = false;
    };
  }, [
    currentQ.id,
    currentQ.solutionSQL,
    currentQ.verificationSQL,
    isLoading,
    dbError,
    getExpectedResultDynamic,
  ]);

  const handleRun = useCallback(async () => {
    if (!sql.trim()) return;

    // Run safety check first (client-side is instant, LLM check is async but non-blocking for fast queries)
    const isSafe = await checkSafety(sql, currentQ);
    if (!isSafe) return; // user chose to edit query

    setIsExecuting(true);
    setExecutedSql(sql);

    // Add full context entry to history if not a duplicate of last
    setQueryHistory((prev) => {
      const entry = {
        sql,
        questionId: currentQ.id,
        dbName: db,
        prompt: currentQ.prompt?.substring(0, 50),
      };
      const filtered = prev.filter((h) => h.sql !== sql);
      return [entry, ...filtered].slice(0, 50);
    });
    try {
      // Execute the user query and (if verification is configured) hidden solutions + diff in ONE pass
      if (currentQ && currentQ.solutionSQL && !currentQ.isAiGenerated) {
        const val = await validateAnswer(
          sql,
          currentQ.solutionSQL,
          currentQ.verificationSQL,
          currentQ.requiresOrder
        );
        // The worker payload returns userResult alongside the validation status
        if (val.userResult) {
          setResult(val.userResult);
        } else if (
          val.message.startsWith('SQL Error:') ||
          val.message.startsWith('System Error:')
        ) {
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
              title:
                diff === 'hard'
                  ? '🔥 Hard Problem Solved!'
                  : diff === 'medium'
                    ? '⭐ Nice Work!'
                    : '✅ Correct!',
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
  }, [
    sql,
    executeQuery,
    runVerification,
    currentQ,
    validateAnswer,
    expectedResult,
    onProgressUpdate,
    progress,
    db,
    fireConfetti,
    toast,
  ]);

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
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT'
      ) {
        return;
      }

      if (isShortcutMatch(e, shortcuts.toggleSidebar.combo)) {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      } else if (isShortcutMatch(e, shortcuts.toggleRightPanel.combo)) {
        e.preventDefault();
        setRightPanelOpen((prev) => !prev);
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
    const timer = setTimeout(() => {
      handleRun();
    }, 1200);
    return () => clearTimeout(timer);
  }, [sql, settings.autoRunAfterTyping, handleRun]);

  const handlePreviewTable = useCallback((tableName) => {
    setPreviewTableName(tableName);
  }, []);

  const navigateTo = useCallback(
    (direction) => {
      const idx = dbQuestions.findIndex((q) => q.id === currentQ.id);
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
    },
    [currentQ, dbQuestions]
  );

  // Handle selecting question from browser — auto-switch DB if needed
  const handleSelectQuestion = useCallback(
    (q) => {
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
    },
    [db]
  );

  const currentIdx = dbQuestions.findIndex((q) => q.id === currentQ.id);

  // Close DB picker when clicking outside
  useEffect(() => {
    if (!showDbPicker) return;
    const handler = () => setShowDbPicker(false);
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [showDbPicker]);

  if (dbError) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 16,
          color: 'var(--error)',
        }}
      >
        <div style={{ fontSize: 48 }}>💥</div>
        <div style={{ fontWeight: 700 }}>Database Error</div>
        <div style={{ color: 'var(--muted)', maxWidth: 400, textAlign: 'center' }}>{dbError}</div>
        <Button variant="ghost" size="sm" icon={Home} onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    );
  }

  const fontSizeClass =
    settings.editorFontSize >= 18 ? 'large' : settings.editorFontSize <= 12 ? 'small' : 'medium';
  return (
    <div
      className="practice-root page-enter"
      data-theme={settings.darkMode ? 'dark' : 'light'}
      data-font-size={fontSizeClass}
    >
      {/* ══ NAV ══ */}
      <Header
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        leftContent={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setRightPanelOpen((v) => !v)}
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: '6px 12px',
                background: rightPanelOpen ? 'var(--primary-muted)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: rightPanelOpen ? 'var(--primary)' : 'var(--text-secondary)',
                borderRadius: 6,
                transition: 'all 0.15s',
              }}
              title={rightPanelOpen ? 'Hide problem panel' : 'Show problem panel'}
            >
              <List size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />
              Problem
            </button>
            <div
              style={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDbPicker((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '6px 12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  borderRadius: 6,
                }}
              >
                {dbInfo.label} <ChevronDown size={12} style={{ opacity: 0.5 }} />
              </button>
              {showDbPicker && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    zIndex: 999,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    minWidth: 230,
                    padding: '6px 0',
                  }}
                >
                  <div
                    style={{
                      padding: '5px 14px 6px',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Switch Database
                  </div>
                  {Object.keys(DB_INFO).map((d) => {
                    const info = DB_INFO[d];
                    const dbQs = getQuestionsForDb(d);
                    const comp = dbQs.filter((q) => progress[q.id] === 'complete').length;
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
                          padding: '8px 14px',
                          background: isActive ? 'var(--primary-muted)' : 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text)',
                          fontSize: 13,
                          fontFamily: 'var(--font-sans)',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'var(--surface-2)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'none';
                        }}
                      >
                        <span
                          style={{ flex: 1, fontWeight: isActive ? 700 : 400, textAlign: 'left' }}
                        >
                          {info.label}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--muted)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {comp}/{info.questionCount}
                        </span>
                        {isActive && (
                          <span style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 700 }}>
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all progress for ' + dbInfo.label + '?'))
                        resetDb(db);
                      setShowDbPicker(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '8px 14px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--error)',
                      fontSize: 12,
                      fontWeight: 600,
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface-2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    ↺ Reset Progress
                  </button>
                </div>
              )}
            </div>
          </div>
        }
        navLinks={[
          { label: 'All Questions', onClick: () => setShowBrowser(true) },
          { label: 'ER Diagram', onClick: () => setShowERDiagram(true) },
          { label: 'Schema', primary: sidebarOpen, onClick: () => setSidebarOpen((v) => !v) },
        ]}
        rightContent={
          <div style={{ position: 'relative' }}>
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
                  style={{ position: 'fixed', inset: 0, zIndex: 98 }}
                  onClick={() => setShowOverflow(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    zIndex: 99,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
                    minWidth: 220,
                    padding: '6px 0',
                  }}
                >
                  <div
                    style={{
                      padding: '4px 14px',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Query History
                  </div>
                  {queryHistory.length === 0 && (
                    <div style={{ padding: '8px 14px', fontSize: 12, color: 'var(--muted)' }}>
                      No recent queries
                    </div>
                  )}
                  {queryHistory.slice(0, 10).map((entry, i) => (
                    <button
                      key={i}
                      className="overflow-menu-item"
                      style={{
                        fontSize: 12,
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 14px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--surface-2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                      }}
                      onClick={() => {
                        if (entry.dbName && entry.dbName !== db)
                          navigate('/practice/' + entry.dbName);
                        if (entry.questionId) {
                          const q = allQuestions.find((q) => q.id === entry.questionId);
                          if (q) setCurrentQ(q);
                        }
                        setSql(entry.sql);
                        setShowOverflow(false);
                      }}
                    >
                      📜{' '}
                      {entry.prompt
                        ? entry.prompt.substring(0, 28) + '…'
                        : entry.sql?.substring(0, 32)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        }
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <div style={{ marginTop: 12, color: 'var(--muted)' }}>Loading {dbInfo.label}…</div>
        </div>
      )}

      {/* ══ MAIN: 3-column flex layout ══ */}
      <div
        ref={layoutRef}
        className="practice-layout"
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0,
          background: 'var(--bg)',
          padding: '12px',
          gap: '12px',
        }}
      >
        {/* LEFT: Question panel */}
        <div
          className={`question-pane-wrap ${rightPanelOpen ? 'open' : ''}`}
          style={{
            width: rightPanelOpen ? questionW : 0,
            minWidth: 0,
            overflow: 'hidden',
            flexShrink: 0,
            transition: 'width 0.22s ease',
            border: 'none',
            borderRadius: '16px',
            background: 'var(--surface)',
            boxShadow: rightPanelOpen ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
          }}
        >
          <div style={{ width: questionW, height: '100%', overflow: 'hidden' }}>
            <QuestionCard
              question={currentQ}
              expectedResult={expectedResult}
              status={progress[currentQ.id] ?? 'incomplete'}
              onOpenBrowser={() => setShowBrowser(true)}
              onOpenAiTutor={() => setShowAiTutor(true)}
              onNavigate={navigateTo}
              hasPrev={currentIdx > 0}
              hasNext={currentIdx < dbQuestions.length - 1}
              questionNumber={currentIdx + 1}
              totalQuestions={dbQuestions.length}
              timedChallenges={settings.timedChallenges}
              onTimerExpire={() => {
                if (sql.trim()) handleRun();
              }}
              currentSql={sql}
              lastValidation={validation}
              dbSchemaContext={dbSchemaContext}
              executeQuery={executeQuery}
            />
          </div>
        </div>

        {/* Drag handle: left column */}
        {rightPanelOpen && (
          <div
            onMouseDown={() => setIsDraggingLeft(true)}
            style={{
              width: 8,
              margin: '0 -10px',
              zIndex: 10,
              flexShrink: 0,
              cursor: 'col-resize',
              background: isDraggingLeft ? 'var(--primary)' : 'transparent',
              transition: 'background 0.2s',
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.opacity = '0.4';
            }}
            onMouseLeave={(e) => {
              if (!isDraggingLeft) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.opacity = '1';
              }
            }}
          />
        )}

        {/* CENTER: Editor + Results */}
        <main
          className="center-workspace"
          ref={workspaceRef}
          style={{
            flex: 1,
            minWidth: 0,
            display: 'grid',
            gridTemplateRows: `${editorHeightPct}% 8px 1fr`,
            overflow: 'hidden',
            background: 'transparent',
          }}
        >
          <div className="editor-col">
            <div className="editor-col-header">
              <span className="editor-label">SQL Editor</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCteModal(true)}
                  style={{ fontSize: 11 }}
                >
                  🪄 CTE
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setJoinAnalysisData({ db: executeQuery, sql })}
                  style={{ fontSize: 11 }}
                >
                  🔗 Joins
                </Button>
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>Ctrl+Enter to run</span>
              </div>
            </div>
            <div className="monaco-wrap">
              <Suspense
                fallback={
                  <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
                    Loading Editor...
                  </div>
                }
              >
                <SqlEditor
                  value={sql}
                  onChange={setSql}
                  onRun={handleRun}
                  disabled={isLoading}
                  dbName={db}
                  fontSize={settings.editorFontSize}
                  autoComplete={settings.autoCompleteSql}
                  darkMode={settings.darkMode}
                />
              </Suspense>
            </div>
            <div className="editor-actions">
              <Button
                id="run-query-btn"
                variant="primary"
                size="md"
                icon={Play}
                onClick={handleRun}
                disabled={isLoading || isExecuting || !sql.trim()}
              >
                {isExecuting ? 'Running…' : 'Run Query'}
              </Button>
              <Button
                id="explain-query-btn"
                variant="secondary"
                size="md"
                onClick={handleExplain}
                disabled={isLoading || isExecuting || !sql.trim()}
              >
                Explain
              </Button>
            </div>
          </div>

          {/* Vertical drag handle */}
          <div
            onMouseDown={() => setIsDragging(true)}
            style={{
              height: 8,
              margin: '-4px 0',
              zIndex: 10,
              cursor: 'row-resize',
              background: isDragging ? 'var(--primary)' : 'transparent',
              transition: 'background 0.2s',
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              if (!isDragging) e.currentTarget.style.background = 'var(--primary-muted)';
            }}
            onMouseLeave={(e) => {
              if (!isDragging) e.currentTarget.style.background = 'transparent';
            }}
          />

          <div className="results-col">
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center text-[var(--muted)]">
                  Loading Results...
                </div>
              }
            >
              <ResultsPanel
                result={result}
                validation={validation}
                sql={executedSql}
                executeQuery={executeQuery}
                isRunning={isExecuting}
                question={currentQ}
              />
            </Suspense>
          </div>
        </main>

        {/* Drag handle: right column */}
        {sidebarOpen && (
          <div
            onMouseDown={() => setIsDraggingRight(true)}
            style={{
              width: 8,
              margin: '0 -10px',
              zIndex: 10,
              flexShrink: 0,
              cursor: 'col-resize',
              background: isDraggingRight ? 'var(--primary)' : 'transparent',
              transition: 'background 0.2s',
              borderRadius: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.opacity = '0.4';
            }}
            onMouseLeave={(e) => {
              if (!isDraggingRight) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.opacity = '1';
              }
            }}
          />
        )}

        {/* RIGHT: Schema sidebar */}
        <div
          className={`sidebar-wrap ${sidebarOpen ? 'open' : ''}`}
          style={{
            width: sidebarOpen ? schemaW : 0,
            minWidth: 0,
            overflow: 'hidden',
            flexShrink: 0,
            transition: 'width 0.22s ease',
            border: 'none',
            borderRadius: '16px',
            background: 'var(--surface)',
            boxShadow: sidebarOpen ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
            position: 'relative',
          }}
        >
          <div style={{ width: schemaW, height: '100%', overflow: 'hidden' }}>
            <SchemaSidebar
              dbName={db}
              executeQuery={executeQuery}
              onPreviewTable={handlePreviewTable}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRight: 'none',
              borderRadius: '8px 0 0 8px',
              padding: '12px 6px',
              cursor: 'pointer',
              boxShadow: '-2px 0 10px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              zIndex: 50,
              transition: 'background 0.2s',
            }}
            title="Open Schema"
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
          >
            <Database size={16} />
          </button>
        )}
      </div>

      {/* Modals wrapped in Suspense */}
      <Suspense fallback={null}>
        {showBrowser && (
          <QuestionBrowser
            questions={allQuestions}
            progress={progress}
            currentQuestionId={currentQ.id}
            onSelectQuestion={handleSelectQuestion}
            onClose={() => setShowBrowser(false)}
          />
        )}
        {showERDiagram && <ERDiagramModal dbName={db} onClose={() => setShowERDiagram(false)} />}
        {previewTableName && (
          <TablePreviewModal
            db={db}
            tableName={previewTableName}
            onClose={() => setPreviewTableName(null)}
          />
        )}
        {joinAnalysisData && (
          <AnimatedJoinVisualizer
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
          onUseConverted={(s) => {
            setSql(s);
            setResult(null);
          }}
        />
      </Suspense>
      <AiTutorPanel
        isOpen={showAiTutor}
        onClose={() => setShowAiTutor(false)}
        question={currentQ}
        currentSql={sql}
        dbSchemaContext={dbSchemaContext}
      />
      <ConfettiComponent />
      <SafetyModal />
    </div>
  );
}
