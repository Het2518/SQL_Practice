import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
import { DiscussionsPanel } from '@/features/practice/DiscussionsPanel';
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeLeftPane, setActiveLeftPane] = useState('problem'); // 'problem' or 'discussions'
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

    // FREEMIUM GATING LOGIC
    if (!user) {
      const freemiumCount = parseInt(localStorage.getItem('freemiumCount') || '0', 10);
      if (freemiumCount >= 15) {
        toast({
          type: 'error',
          title: 'Free Limit Reached',
          message: 'You have solved 15 free problems! Create an account to continue your SQL journey and save your progress.'
        });
        if (onShowAuth) onShowAuth();
        return;
      }
    }

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
          if (!user) {
            const count = parseInt(localStorage.getItem('freemiumCount') || '0', 10);
            localStorage.setItem('freemiumCount', (count + 1).toString());
          }

          onProgressUpdate(currentQ, db, 'complete');
          if (progress[currentQ.id] !== 'complete') {
            const diff = (currentQ.difficulty || '').toLowerCase();
            const pts = diff === 'hard' ? 50 : diff === 'medium' ? 30 : 10;
            fireConfetti();
            toast({
              type: 'success',
              title:
                diff === 'hard'
                  ? 'Hard Problem Solved!'
                  : diff === 'medium'
                    ? 'Nice Work!'
                    : 'Correct!',
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
    user,
    onShowAuth,
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
      <Helmet>
        <title>{dbInfo?.label ? `Practice ${dbInfo.label} | DataDesk` : 'SQL Practice | DataDesk'}</title>
        <meta name="description" content={dbInfo?.description || 'Interactive SQL practice environment.'} />
      </Helmet>
      {/* ══ NAV ══ */}
      <Header
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        leftContent={
          <div
            style={{
              position: 'relative',
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
                fontWeight: 600,
                padding: '4px 8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text)',
                borderRadius: 'var(--radius)',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {dbInfo.label} <ChevronDown size={14} style={{ opacity: 0.5 }} />
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
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-float)',
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
                        background: isActive ? 'var(--primary-muted)' : 'transparent',
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
                        if (!isActive) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span
                        style={{ flex: 1, fontWeight: isActive ? 600 : 400, textAlign: 'left' }}
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
                        <span style={{ color: 'var(--text)', fontSize: 11, fontWeight: 700 }}>
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
        }
        centerContent={
          <div className="relative flex items-center p-1 bg-surface-2 rounded-lg border border-border shadow-inner mx-4">
            <button
              onClick={() => {
                if (!rightPanelOpen) setRightPanelOpen(true);
                if (activeLeftPane === 'problem' && rightPanelOpen) {
                  setRightPanelOpen(false);
                } else {
                  setActiveLeftPane('problem');
                }
              }}
              className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold cursor-pointer transition-colors rounded-md bg-transparent border-none ${rightPanelOpen && activeLeftPane === 'problem' ? 'text-text' : 'text-text-secondary hover:text-text'}`}
            >
              <List size={14} /> Description
            </button>
            <button
              onClick={() => {
                if (!rightPanelOpen) setRightPanelOpen(true);
                if (activeLeftPane === 'discussions' && rightPanelOpen) {
                  setRightPanelOpen(false);
                } else {
                  setActiveLeftPane('discussions');
                }
              }}
              className={`relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold cursor-pointer transition-colors rounded-md bg-transparent border-none ${rightPanelOpen && activeLeftPane === 'discussions' ? 'text-text' : 'text-text-secondary hover:text-text'}`}
            >
              Discussion
            </button>
            <div 
              className="absolute top-1 bottom-1 w-1/2 bg-surface border border-border rounded-md shadow-sm transition-transform duration-200 ease-in-out pointer-events-none" 
              style={{
                transform: rightPanelOpen 
                  ? (activeLeftPane === 'problem' ? 'translateX(0)' : 'translateX(100%)')
                  : 'scaleX(0)',
                opacity: rightPanelOpen ? 1 : 0
              }} 
            />
          </div>
        }
        navLinks={[]}
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
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-float)',
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

      {/* Global Loading Overlay */}
      {globalLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg/80 backdrop-blur-sm">
          <div className="w-8 h-8 border-4 border-surface-3 border-t-primary rounded-full animate-spin" />
          <p className="mt-4 text-sm font-semibold text-text-secondary animate-pulse">{globalLoadingMsg}</p>
        </div>
      )}

      <main 
        className="flex-1 flex overflow-hidden min-h-0 relative bg-surface-2"
        onMouseMove={handleMouseMove} 
        onMouseUp={handleMouseUp} 
        onMouseLeave={handleMouseUp}
      >
        {/* LEFT PANE */}
        <div 
          className="shrink-0 border-r border-border bg-bg h-full flex flex-col overflow-hidden transition-all duration-300"
          style={{ 
            width: rightPanelOpen ? leftPaneWidth : 0, 
            opacity: rightPanelOpen ? 1 : 0 
          }}
        >
          {activeLeftPane === 'problem' ? (
            <QuestionCard
              question={currentQ}
              status={progress[currentQ.id]}
              onNavigate={handleNavigate}
              hasPrev={hasPrev}
              hasNext={hasNext}
              questionNumber={currentQIndex + 1}
              totalQuestions={getQuestionsForDb(db).length}
              timedChallenges={settings.timedChallenges}
              onTimerExpire={() =>
                toast({
                  title: "Time's up!",
                  message: 'The timer for this challenge has expired.',
                  type: 'warning',
                })
              }
              onOpenBrowser={() => setShowBrowser(true)}
              onOpenAiTutor={() => {
                if (settings.aiFeatures) setShowAiTutor(true);
                else {
                  toast({
                    title: 'AI Disabled',
                    message: 'Enable AI features in settings.',
                    type: 'error',
                  });
                }
              }}
              currentSql={sql}
              lastValidation={validation}
              dbSchemaContext={schemaContextForAi}
              executeQuery={executeQuery}
            />
          ) : (
            <DiscussionsPanel 
              questionId={currentQ?.id} 
              user={user} 
              onShowAuth={onShowAuth} 
            />
          )}
        </div>

        {/* RESIZER 1 */}
        {rightPanelOpen && (
          <div
            onMouseDown={(e) => handleMouseDown(e, 'left')}
            className="w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 transition-colors z-10"
          />
        )}

        {/* CENTER PANE: EDITOR & RESULTS */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg min-w-[300px]">
          {/* EDITOR SECTION */}
          <div 
            className="shrink-0 flex flex-col bg-surface border-b border-border"
            style={{ height: `${editorHeightPct}%` }}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">SQL Editor</span>
              <div className="flex gap-2">
                 <button
                   className="p-1 text-text-secondary hover:text-text rounded transition-colors"
                   onClick={() => setSql(formatQuery(sql))}
                   title="Format SQL (Alt+Shift+F)"
                 >
                   <SettingsIcon size={14} />
                 </button>
              </div>
            </div>
            <div className="flex-1 relative min-h-0 bg-surface">
              <Suspense fallback={
                <div className="flex-1 flex items-center justify-center text-muted h-full w-full">
                  Loading editor...
                </div>
              }>
                <SqlEditor
                  value={sql}
                  onChange={(val) => {
                    setSql(val);
                    localStorage.setItem(`sql-persist-${currentQ?.id}`, val);
                  }}
                  onRun={runQuery}
                  onFormat={() => setSql(formatQuery(sql))}
                  height="100%"
                />
              </Suspense>
            </div>
            <div className="flex items-center justify-end gap-2 p-3 bg-surface-2 border-t border-border">
              <Button variant="secondary" onClick={() => setSql('')}>
                <RotateCcw size={14} /> Reset
              </Button>
              <Button onClick={runQuery} isLoading={isRunning}>
                <Play size={14} fill="currentColor" /> Run Code
              </Button>
            </div>
          </div>

          {/* RESIZER 2 (Vertical) */}
          <div
            onMouseDown={(e) => handleMouseDown(e, 'vertical')}
            className="h-1.5 cursor-row-resize hover:bg-primary/20 active:bg-primary/40 transition-colors z-10"
          />

          {/* RESULTS SECTION */}
          <div className="flex-1 flex flex-col min-h-0 bg-surface">
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center text-muted h-full w-full">
                  Loading results...
                </div>
            }>
              <ResultsPanel
                result={result}
                validation={validation}
                isRunning={isRunning}
              />
            </Suspense>
          </div>
        </div>

        {/* RESIZER 3 */}
        {sidebarOpen && (
          <div
            onMouseDown={(e) => handleMouseDown(e, 'right')}
            className="w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/40 transition-colors z-10"
          />
        )}

        {/* RIGHT PANE: SCHEMA SIDEBAR */}
        <div 
          className="shrink-0 border-l border-border bg-surface h-full transition-all duration-300"
          style={{ width: sidebarOpen ? schemaW : 0 }}
        >
          <div className="w-full h-full overflow-hidden">
            <SchemaSidebar
              dbName={db}
              executeQuery={executeQuery}
              onPreviewTable={handlePreviewTable}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      </main>

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
