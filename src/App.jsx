import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Sun, Moon, BookOpen, Settings as SettingsIcon, User, Zap, ChevronDown, RotateCcw, Play, List, Home, Database } from 'lucide-react';
import { DB_INFO } from './types';
import { allQuestions, getQuestionsForDb } from './data/index';
import { useSqlDatabase } from './hooks/useSqlDatabase';
import { SchemaSidebar } from './components/SchemaSidebar';
import { SqlEditor } from './components/SqlEditor';
import { ResultsPanel } from './components/ResultsPanel';
import { ERDiagramModal } from './components/ERDiagramModal';
import { QuestionCard } from './components/QuestionCard';
import { QuestionBrowser } from './components/QuestionBrowser';
import { loadSettings, SettingsModal, defaultSettings } from './components/SettingsModal';
import { loadShortcuts, isShortcutMatch } from './utils/shortcutManager';
import { ProfileView } from './components/ProfileView';
import { TablePreviewModal } from './components/TablePreviewModal';
import { EdgeCaseTester } from './components/EdgeCaseTester';
import { CteConverterModal } from './components/CteConverterModal';
import { useGamification } from './hooks/useGamification';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import { UserGuide } from './components/UserGuide';
import { JoinAnalysisModal } from './components/JoinAnalysisModal';
import { hasSubquery, convertSubqueryToCTE } from './utils/sqlAnalysis';
import { useToast } from './components/ToastSystem';
import { useConfetti } from './components/ConfettiBlast';
import './styles.css';

// ─── Progress persistence ────────────────────────────────────────────────────
const PROGRESS_KEY = 'sql-practice-progress';
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}');
  } catch {
    return {};
  }
}
function saveProgress(p) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

// ─── DB Selector Screen ──────────────────────────────────────────────────────
const DB_NAMES = Object.keys(DB_INFO);
function DbSelector({ progress, gameState, user, onShowAuth, onShowSettings, settings, onToggleDark }) {
  const navigate = useNavigate();
  const totalComplete = Object.values(progress).filter(s => s === 'complete').length;
  const totalAttempted = Object.values(progress).filter(s => s === 'attempted').length;
  const totalPct = Math.round((totalComplete + totalAttempted * 0.5) / 600 * 100);
  const score = gameState?.score ?? 0;
  const badges = (gameState?.badges ?? []).length;

  return <div className="home-root">

    {/* ── Sticky Navbar ── */}
    <header className="home-header">
      <div className="home-logo" onClick={() => {}} style={{ cursor: 'default' }}>
        <div className="home-logo-badge">
          <Zap size={17} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div className="home-title">SQL Practice Platform</div>
          <div className="home-subtitle">10 databases · 600 questions</div>
        </div>
      </div>

      <div className="home-header-sep" />

      <div className="home-stats">
        <div className="stat-pill solved">
          <span className="stat-num">{totalComplete}</span>
          <span className="stat-label">Solved</span>
        </div>
        <div className="stat-pill tried">
          <span className="stat-num">{totalAttempted}</span>
          <span className="stat-label">Tried</span>
        </div>
        <div className="stat-pill done">
          <span className="stat-num">{totalPct}%</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      <nav className="home-nav">
        <button className="nav-btn" onClick={() => navigate('/guide')}>
          <BookOpen size={14} />
          Docs
        </button>
        <button className="nav-btn" onClick={onShowSettings}>
          <SettingsIcon size={14} />
          Settings
        </button>
        <button
          className="nav-btn nav-btn-icon"
          onClick={onToggleDark}
          title={settings?.darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {settings?.darkMode ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
        </button>
        {user ? (
          <button className="nav-btn-primary" onClick={() => navigate('/profile')}>
            <User size={14} strokeWidth={2.5} />
            My Profile
          </button>
        ) : (
          <button className="nav-btn-primary" onClick={onShowAuth}>
            Sign In
          </button>
        )}
      </nav>
    </header>

    {/* ── Progress Strip ── */}
    <div className="global-progress-bar">
      <div className="global-progress-fill" style={{ width: `${totalPct}%` }} />
    </div>

    {/* ── Hero Banner ── */}
    <section className="home-hero">
      <div className="home-hero-content">
        <div className="home-hero-badge">
          <Zap size={11} />
          Real-World SQL Practice Platform
        </div>
        <h2>Master SQL with <span>Real Data</span></h2>
        <p>10 hand-crafted databases. 600 progressive questions. From beginner JOINs to advanced Window Functions — practice the SQL that matters in real jobs.</p>

        <div className="hero-cta-row">
          <button className="hero-btn-start" onClick={() => navigate('/practice/airlines')}>
            <Play size={15} strokeWidth={2.5} />
            Start Practicing
          </button>
          <span className="hero-meta">
            🏆 {score.toLocaleString()} pts · 🎖 {badges} badges earned
          </span>
        </div>

        <div className="hero-stats-row">
          <div className="hero-stat-card">
            <div className="hero-stat-icon" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.15)' }}>✅</div>
            <div className="hero-stat-info">
              <span className="hero-stat-value" style={{ color: 'var(--success)' }}>{totalComplete}</span>
              <span className="hero-stat-label">Solved</span>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-icon" style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.15)' }}>⚡</div>
            <div className="hero-stat-info">
              <span className="hero-stat-value" style={{ color: '#d97706' }}>{totalAttempted}</span>
              <span className="hero-stat-label">In Progress</span>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-icon" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.15)' }}>🏆</div>
            <div className="hero-stat-info">
              <span className="hero-stat-value" style={{ color: '#7c3aed' }}>{score.toLocaleString()}</span>
              <span className="hero-stat-label">Score</span>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}>📊</div>
            <div className="hero-stat-info">
              <span className="hero-stat-value" style={{ color: '#059669' }}>{totalPct}%</span>
              <span className="hero-stat-label">Complete</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Grid Header ── */}
    <div className="db-grid-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Choose a Database
        </h3>
        <span style={{ background: 'var(--primary-muted)', color: 'var(--primary)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
          10
        </span>
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
        {600 - totalComplete} questions remaining
      </span>
    </div>

    {/* ── DB Cards ── */}
    <main className="db-grid">
      {DB_NAMES.map((db, i) => {
        const info = DB_INFO[db];
        const dbQs = getQuestionsForDb(db);
        const completed = dbQs.filter(q => progress[q.id] === 'complete').length;
        const attempted = dbQs.filter(q => progress[q.id] === 'attempted').length;
        const pct = Math.round(completed / info.questionCount * 100);
        return (
          <button
            key={db}
            id={`db-card-${db}`}
            className="db-card"
            onClick={() => navigate('/practice/' + db)}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <div className="db-card-body">
              <div className="db-card-header">
                <span className="db-card-icon">{info.icon}</span>
                <div className="db-card-meta">
                  <span className="db-card-name">{info.label}</span>
                  <span className="db-card-count">{info.tableCount} tables · {info.questionCount} questions</span>
                </div>
                <div className={`db-card-pct${pct === 100 ? ' complete' : ''}`}>{pct}%</div>
              </div>
              <p className="db-card-desc">{info.description}</p>
              <div className="db-card-concepts">
                {info.concepts.slice(0, 4).map(c => <span key={c} className="tag">{c}</span>)}
              </div>
            </div>
            <div className="db-card-footer">
              <div className="db-progress-bar">
                <div className="db-progress-fill" style={{ width: `${pct}%` }} />
                {attempted > 0 && (
                  <div className="db-progress-attempted" style={{
                    width: `${Math.round(attempted / info.questionCount * 100)}%`,
                    left: `${pct}%`
                  }} />
                )}
              </div>
              <span className="db-progress-label">{completed}/{info.questionCount}</span>
            </div>
          </button>
        );
      })}
    </main>
  </div>;
}

// ─── Main Practice View ──────────────────────────────────────────────────────

function PracticeView({
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
  
  const [currentQ, setCurrentQ] = useState(() => {
    const dbQs = getQuestionsForDb(initialDb);
    return dbQs.find(q => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
  });

  useEffect(() => {
    if (routeDb && routeDb !== db) {
      setDb(routeDb);
      const dbQs = getQuestionsForDb(routeDb);
      const firstIncomplete = dbQs.find(q => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
      setCurrentQ(firstIncomplete);
      setResult(null);
      setValidation(null);
      setSql('');
      setPreviewTableName(null);
    }
  }, [routeDb, db, progress]);

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
  const { fire: fireConfetti, node: confettiNode } = useConfetti();

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

  // Persist editor text
  const EDITOR_KEY = `sql-persist-${currentQ.id}`;
  useEffect(() => {
    if (settings.persistEditorText) {
      const saved = localStorage.getItem(EDITOR_KEY);
      if (saved) setSql(saved);
    }
  }, [currentQ.id, settings.persistEditorText, EDITOR_KEY]);
  useEffect(() => {
    if (settings.persistEditorText && sql) {
      localStorage.setItem(EDITOR_KEY, sql);
    }
  }, [sql, settings.persistEditorText, EDITOR_KEY]);

  const dbInfo = DB_INFO[db];
  const dbQuestions = useMemo(() => getQuestionsForDb(db), [db]);

  const { isLoading, error: dbError, executeQuery, resetDb, validateAnswer, runVerification, getExpectedResultDynamic, getExplainPlan, dbInstance } = useSqlDatabase(db);

  // Switch DB inline
  const handleSwitchDb = useCallback((newDb) => {
    if (newDb === db) { setShowDbPicker(false); return; }
    navigate('/practice/' + newDb);
    setShowDbPicker(false);
  }, [db, navigate]);

  const [queryHistory, setQueryHistory] = useState(() => {
    const saved = localStorage.getItem('sql-practice-history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sql-practice-history', JSON.stringify(queryHistory.slice(0, 50)));
  }, [queryHistory]);

  // Reset state when question changes and compute true expected result
  useEffect(() => {
    setSql('');
    setResult(null);
    setValidation(null);
    if (!isLoading && !dbError) {
      const er = getExpectedResultDynamic(currentQ.solutionSQL, currentQ.verificationSQL);
      setExpectedResult(er);
    }
  }, [currentQ.id, currentQ.solutionSQL, currentQ.verificationSQL, isLoading, dbError, getExpectedResultDynamic]);

  const handleRun = useCallback(() => {
    if (!sql.trim()) return;
    
    // Add to history if not duplicate of last
    setQueryHistory(prev => {
      const next = [sql, ...prev.filter(q => q !== sql)].slice(0, 50);
      return next;
    });

    let originalRes = executeQuery(sql);
    let finalRes = { ...originalRes };
    if (!originalRes.error && currentQ.verificationSQL) {
      const verRes = runVerification(currentQ.verificationSQL);
      finalRes = { ...verRes, execTimeMs: originalRes.execTimeMs };
    }
    setResult(finalRes);
    if (finalRes.error) {
      setValidation({ isCorrect: false, message: finalRes.error });
      onProgressUpdate(currentQ.id, 'attempted');
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
  }, [sql, executeQuery, runVerification, currentQ, validateAnswer, expectedResult, onProgressUpdate]);

  const handleExplain = useCallback(() => {
    if (!sql.trim()) return;
    const plan = getExplainPlan(sql);
    if (plan.error) {
       setResult({ error: plan.error });
       setValidation({ isCorrect: false, message: 'Syntax Error while parsing EXPLAIN plan.' });
    } else {
       setResult(plan);
       setValidation({ isCorrect: true, message: 'Query Execution Plan' });
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
    if (direction === 'prev' && idx > 0) setCurrentQ(dbQuestions[idx - 1]);
    if (direction === 'next' && idx < dbQuestions.length - 1) setCurrentQ(dbQuestions[idx + 1]);
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
    setSql('');
  }, [db]);

  const currentIdx = dbQuestions.findIndex(q => q.id === currentQ.id);

  // (handleKeyDown replaced by Unified Global Shortcuts above)

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
    return <div className="practice-root" data-theme={settings.darkMode ? 'dark' : 'light'} data-font-size={fontSizeClass}>
    {/* Top Nav */}
    <nav className="practice-nav" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 50, background: 'var(--surface)', borderBottom: '1px solid var(--border)', gap: 12 }}>
      <button id="run-btn" className="btn btn-ghost" onClick={handleRun} disabled={isLoading || !sql.trim()} style={{ color: 'var(--success)', fontWeight: 600, gap: 5 }}>
        <Play size={14} strokeWidth={2.5} />
        Run
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
            {isSandbox && (
              <button className="db-picker-item active">
                <span className="db-picker-icon">📁</span>
                <span className="db-picker-name">{db.name} (Custom)</span>
              </button>
            )}
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
      <button className="btn btn-ghost" id="reset-btn" onClick={async () => {
        await resetDb();
        setResult(null);
        setValidation({ isCorrect: true, message: 'Database successfully restored to original state!' });
      }} disabled={isLoading} style={{ gap: 5 }}>
        <RotateCcw size={14} />
        Reset DB
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
        <SchemaSidebar dbName={db} dbInstance={dbInstance} onPreviewTable={handlePreviewTable} />
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
            <button id="run-query-btn" className="btn btn-primary" onClick={handleRun} disabled={isLoading || !sql.trim()}>▶ Run Query</button>
            <button id="explain-query-btn" className="btn btn-secondary" onClick={handleExplain} disabled={isLoading || !sql.trim()} title="View Query Execution Plan">🔍 Explain</button>
            {/\bJOIN\b/i.test(sql) && (
              <button 
                className="btn btn-secondary" 
                onClick={() => setJoinAnalysisData({ db: dbInstance, sql })}
                title="Open Advanced Join Analysis"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                🔗 Visualize Joins
              </button>
            )}
            <EdgeCaseTester db={dbInstance} sql={sql} />
            
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
                  style={{ appearance: 'none', paddingRight: '24px', maxWidth: '200px' }}
                  onChange={(e) => {
                    if (e.target.value) setSql(e.target.value);
                    e.target.value = "";
                  }}
                  value=""
                >
                  <option value="" disabled>📜 History</option>
                  {queryHistory.map((q, i) => (
                    <option key={i} value={q}>{q.substring(0, 30) + (q.length > 30 ? '...' : '')}</option>
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
            db={dbInstance}
            isRunning={false}
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

    {/* Join Analysis Modal */}
    {joinAnalysisData && (
      <JoinAnalysisModal 
        db={joinAnalysisData.db} 
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
    {confettiNode}
  </div>;
}


// ─── Protected Route Component ───────────────────────────────────────────────
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/?login=true" replace />;
  }
  return children;
}

// ─── App Root ────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(loadProgress);
  const { user, loading, logout } = useAuth();
  const { gameState, recordActivity } = useGamification(progress, user);
  const [showAuth, setShowAuth] = useState(false);
  
  const [settings, setSettings] = useState(() => ({ ...defaultSettings, ...loadSettings() }));
  const [showSettings, setShowSettings] = useState(false);

  const toggleDark = useCallback(() => {
    setSettings(prev => {
      const next = { ...prev, darkMode: !prev.darkMode };
      localStorage.setItem('sql-platform-settings', JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
  }, [settings.darkMode]);

  useEffect(() => {
    // Check for login query param
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      setShowAuth(true);
      navigate(location.pathname, { replace: true });
    }
    
    // Catch Supabase OAuth redirect errors
    if (window.location.hash && window.location.hash.includes('error_description')) {
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      const errorMsg = hashParams.get('error_description');
      if (errorMsg) {
        alert('Authentication Error: ' + decodeURIComponent(errorMsg).replace(/\+/g, ' '));
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [location, navigate]);

  // Sync progress from Supabase
  useEffect(() => {
    if (user) {
      supabase.from('user_progress').select('completed_questions').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data && data.completed_questions) {
          setProgress(prev => {
            const merged = { ...prev, ...data.completed_questions };
            saveProgress(merged);
            return merged;
          });
        }
      });
    }
  }, [user]);

  const handleProgressUpdate = useCallback((question, dbName, status) => {
    if (!question || !question.id) return;
    const id = question.id;
    setProgress(prev => {
      const next = { ...prev, [id]: status };
      saveProgress(next);
      if (status === 'complete' && prev[id] !== 'complete') {
        recordActivity(question, dbName, status);
      }
      if (user) {
        supabase.from('user_progress').upsert({ user_id: user.id, completed_questions: next }).then();
      }
      return next;
    });
  }, [recordActivity, user]);

  if (loading) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)'}}>Loading...</div>;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<DbSelector progress={progress} gameState={gameState} user={user} onShowAuth={() => setShowAuth(true)} onShowSettings={() => setShowSettings(true)} settings={settings} onToggleDark={toggleDark} />} />

        <Route path="/guide" element={<UserGuide />} />
        
        <Route path="/practice/:db" element={
          <ProtectedRoute user={user}>
            <PracticeView
              progress={progress}
              user={user}
              settings={settings}
              onShowAuth={() => setShowAuth(true)}
              onShowSettings={() => setShowSettings(true)}
              onProgressUpdate={handleProgressUpdate}
              onToggleDark={toggleDark}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute user={user}>
            <ProfileView 
              user={user} 
              gameState={gameState} 
              progress={progress} 
              settings={settings}
              onSaveSettings={setSettings}
              onHome={() => navigate('/')} 
              onSignOut={async () => {
                await logout();
                window.location.href = '/';
              }} 
            />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showSettings && <SettingsModal settings={settings} onSave={setSettings} onClose={() => setShowSettings(false)} />}
    </>
  );
}

// ─── Login Redirect Handler ──────────────────────────────────────────────────
// We extract useLocation to a small component to keep App clean and outside Router logic
export function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      navigate(location.pathname, { replace: true });
      // We can't easily trigger showAuth from here without context, 
      // but protected route redirected here. Let's just rely on the user clicking Login for now.
    }
  }, [location, navigate]);

  return <App />;
}
