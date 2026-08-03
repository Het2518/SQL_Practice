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
  Network,
} from 'lucide-react';
import { DB_INFO } from '@/data/schemas';
import { allQuestions, getQuestionsForDb } from '@/data/index';
import { format as formatSql } from 'sql-formatter';
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
import { hasGroqKey } from '@/lib/groq';

export function PracticeView({ onShowAuth, onProgressUpdate, onShowSettings }) {
  const { user } = useAuth();
  const { progress, progressLoaded } = useProgressStore();
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
    if (!progressLoaded || qParam) return;

    const dbQs = getQuestionsForDb(initialDb);
    const preferredQuestion = dbQs.find((q) => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];

    if (preferredQuestion && preferredQuestion.id !== currentQ?.id) {
      setCurrentQ(preferredQuestion);
    }
  }, [progressLoaded, qParam, initialDb, progress, currentQ?.id]);

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
        const savedSql = settings?.persistEditorText ? localStorage.getItem(`sql-persist-${targetQ.id}`) : null;
        setSql(savedSql || '');
        setPreviewTableName(null);
      }
    }
    // intentionally omit 'progress' to prevent auto-advancing when user solves a question
    // intentionally omit 'currentQ' so we don't re-run this when currentQ is set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeDb, qParam]);

  const [sql, setSql] = useState(() => {
    return settings?.persistEditorText ? (localStorage.getItem(`sql-persist-${currentQ?.id}`) || '') : '';
  });
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

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('schema-sidebar-open');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleSidebar = useCallback((val) => {
    setSidebarOpen((prev) => {
      const next = typeof val === 'boolean' ? val : !prev;
      localStorage.setItem('schema-sidebar-open', String(next));
      return next;
    });
  }, []);

  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeLeftPane, setActiveLeftPane] = useState('problem'); // 'problem' or 'discussions'
  const [showOverflow, setShowOverflow] = useState(false);

  // Column widths (px) — draggable
  const [questionW, setQuestionW] = useState(360);
  const [schemaW, setSchemaW] = useState(300);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const layoutRef = useRef(null);

  const handleMouseDown = useCallback((e, direction) => {
    e.preventDefault();
    if (direction === 'left') setIsDraggingLeft(true);
    else if (direction === 'right') setIsDraggingRight(true);
    else if (direction === 'vertical') setIsDragging(true);
  }, []);

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
  const { toast } = useToast();
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
    if (settings?.persistEditorText && sql !== undefined) {
      localStorage.setItem(EDITOR_KEY, sql);
    }
  }, [sql, EDITOR_KEY, settings?.persistEditorText]);

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

          onProgressUpdate(currentQ, db, 'complete', sql);
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
            onProgressUpdate(currentQ, db, 'attempted', sql);
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
        // Restore persisted SQL for this question if setting enabled
        const savedSql = settings?.persistEditorText ? localStorage.getItem(`sql-persist-${nextQ.id}`) : null;
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
      // Restore persisted SQL for this specific question if enabled
      const savedSql = settings?.persistEditorText ? localStorage.getItem(`sql-persist-${q.id}`) : null;
      setSql(savedSql || '');
    },
    [db]
  );

  const formatQuery = useCallback((query) => {
    try {
      return formatSql(query, { language: 'sqlite', keywordCase: 'upper' });
    } catch {
      return query;
    }
  }, []);

  const currentIdx = dbQuestions.findIndex((q) => q.id === currentQ.id);
  const currentQIndex = currentIdx !== -1 ? currentIdx : 0;
  const hasPrev = currentQIndex > 0;
  const hasNext = currentQIndex < dbQuestions.length - 1;
  const handleNavigate = navigateTo;
  const runQuery = handleRun;
  const isRunning = isExecuting;

  // Close DB picker when clicking outside
  useEffect(() => {
    if (!showDbPicker) return;
    const handler = () => setShowDbPicker(false);
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [showDbPicker]);

  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-error">
        <div className="text-[48px]">💥</div>
        <div className="font-bold">Database Error</div>
        <div className="text-muted max-w-[400px] text-center">{dbError}</div>
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
      className="practice-root page-enter flex-1 w-full h-full flex flex-col overflow-hidden bg-bg text-text"
      data-theme={settings.darkMode ? 'dark' : 'light'}
      data-font-size={fontSizeClass}
    >
      <Helmet>
        <title>{dbInfo?.label ? `Practice ${dbInfo.label} SQL | DataDesk` : 'SQL Practice Environment | DataDesk'}</title>
        <meta name="description" content={dbInfo?.description ? `Master SQL on the ${dbInfo.label} database: ${dbInfo.description}` : 'Interactive SQL practice environment with real-world databases and instant AI feedback.'} />
        <meta name="keywords" content={`SQL practice, learn ${dbInfo?.label || ''} SQL, interactive SQL, database schema, AI SQL tutor`} />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": dbInfo?.label ? `${dbInfo.label} SQL Mastery` : "Interactive SQL Mastery",
            "description": dbInfo?.description || "Practice standard SQL queries using real-world sandbox environments.",
            "provider": {
              "@type": "Organization",
              "name": "DataDesk",
              "sameAs": "https://sql-practice-sepia.vercel.app"
            }
          })}
        </script>
      </Helmet>
      
      {/* ══ MOBILE WARNING OVERLAY ══ */}
      <div className="md:hidden fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
          <Database size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-text mb-3 tracking-tight">Desktop Recommended</h2>
        <p className="text-text-secondary mb-8 leading-relaxed max-w-sm">
          DataDesk's SQL IDE is designed for larger screens. Please switch to a desktop or tablet for the best practice experience.
        </p>
        <Button onClick={() => navigate('/')} variant="outline" size="lg">
          Back to Home
        </Button>
      </div>

      {/* ══ NAV ══ */}
      <Header
        onShowAuth={onShowAuth}
        onShowSettings={onShowSettings}
        leftContent={
          <div
            className="relative flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDbPicker((v) => !v)}
              className="flex items-center gap-1.5 text-[13px] font-semibold px-2 py-1 bg-transparent border-none cursor-pointer text-text rounded-md transition-colors hover:bg-surface-2"
            >
              {dbInfo.label} <ChevronDown size={14} className="opacity-50" />
            </button>
            {showDbPicker && (
              <div className="absolute top-[calc(100%+4px)] left-0 z-50 bg-surface border border-border rounded-xl shadow-float min-w-[230px] py-1.5">
                <div className="px-3.5 pt-1.5 pb-1.5 text-[10px] font-bold text-muted uppercase tracking-[1px]">
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
                      className={`flex items-center gap-2.5 w-full px-3.5 py-2 border-none cursor-pointer text-[13px] font-sans transition-colors ${
                        isActive ? 'bg-primary-muted font-semibold text-text' : 'bg-transparent font-normal text-text hover:bg-surface-2'
                      }`}
                    >
                      <span className="flex-1 text-left">
                        {info.label}
                      </span>
                      <span className="text-[11px] text-muted tabular-nums">
                        {comp}/{info.questionCount}
                      </span>
                      {isActive && (
                        <span className="text-text text-[11px] font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    if (window.confirm('Reset all progress for ' + dbInfo.label + '?'))
                      resetDb(db);
                    setShowDbPicker(false);
                  }}
                  className="flex items-center w-full px-3.5 py-2 bg-transparent hover:bg-surface-2 border-none cursor-pointer text-error text-xs font-semibold transition-colors"
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowERDiagram(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer bg-surface-2 text-text-secondary border-border hover:text-text hover:bg-surface-3"
              title="View ER Diagram"
            >
              <Network size={13} />
              <span className="hidden sm:inline">ER Diagram</span>
            </button>
            <button
              onClick={() => toggleSidebar()}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                sidebarOpen
                  ? 'bg-primary/10 text-primary border-primary/30 shadow-xs'
                  : 'bg-surface-2 text-text-secondary border-border hover:text-text hover:bg-surface-3'
              }`}
              title={sidebarOpen ? "Hide Database Schema & Tables" : "Open Database Schema & Tables"}
            >
              <Database size={13} className={sidebarOpen ? "text-primary" : "text-text-secondary"} />
              <span>Schema</span>
              <span className={`w-1.5 h-1.5 rounded-full ${sidebarOpen ? 'bg-primary' : 'bg-muted'}`} />
            </button>

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
                <div className="absolute top-[calc(100%+4px)] right-0 z-50 bg-surface border border-border rounded-xl shadow-float min-w-[220px] py-1.5">
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
          </div>
        }
      />

      {/* Database Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-bg/80 backdrop-blur-sm">
          <div className="w-8 h-8 border-3 border-surface-3 border-t-primary rounded-full animate-spin" />
          <p className="mt-4 text-sm font-semibold text-text-secondary animate-pulse">Initializing Database...</p>
        </div>
      )}

      <main 
        ref={layoutRef}
        className="flex-1 flex overflow-hidden min-h-0 relative bg-surface-2"
      >
        {/* LEFT PANE */}
        <div 
          className="shrink-0 border-r border-border bg-bg h-full flex flex-col overflow-hidden transition-all duration-300"
          style={{ 
            width: rightPanelOpen ? questionW : 0, 
            opacity: rightPanelOpen ? 1 : 0 
          }}
        >
          {activeLeftPane === 'problem' ? (
            <QuestionCard
              question={currentQ}
              expectedResult={expectedResult}
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
                if (hasGroqKey()) setShowAiTutor(true);
                else {
                  toast({
                    title: 'AI Disabled',
                    message: 'Please configure your Groq API Key in Settings.',
                    type: 'error',
                  });
                }
              }}
              currentSql={sql}
              lastValidation={validation}
              dbSchemaContext={dbSchemaContext}
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
        <div 
          ref={workspaceRef}
          className="flex-1 flex flex-col h-full overflow-hidden bg-bg min-w-[300px]"
        >
          {/* EDITOR SECTION */}
          <div 
            className="shrink-0 flex flex-col bg-surface border-b border-border min-h-[140px] overflow-hidden"
            style={{ height: `${editorHeightPct}%` }}
          >
            <div className="flex-1 relative min-h-0 bg-surface overflow-hidden">
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
                  onFormat={() => setSql(formatQuery(sql))}
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
                <Button variant="ghost" size="sm" onClick={() => setSql(formatQuery(sql))} title="Format">
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
                sql={sql}
                executeQuery={executeQuery}
                question={currentQ}
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
          className="shrink-0 border-l border-border bg-surface h-full transition-all duration-300 relative"
          style={{ width: sidebarOpen ? schemaW : 0, display: sidebarOpen ? 'block' : 'none' }}
        >
          {sidebarOpen && (
            <div className="w-full h-full overflow-hidden">
              <SchemaSidebar
                dbName={db}
                executeQuery={executeQuery}
                onPreviewTable={handlePreviewTable}
                onClose={() => toggleSidebar(false)}
              />
            </div>
          )}
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
