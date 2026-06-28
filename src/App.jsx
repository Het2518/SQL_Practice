import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { DB_INFO } from './types';
import { allQuestions, getQuestionsForDb } from './data/index';
import { useSqlDatabase } from './hooks/useSqlDatabase';
import { SchemaSidebar } from './components/SchemaSidebar';
import { SqlEditor } from './components/SqlEditor';
import { ResultsPanel } from './components/ResultsPanel';
import { ERDiagramModal } from './components/ERDiagramModal';
import { QuestionCard } from './components/QuestionCard';
import { HintDrawer } from './components/HintDrawer';
import { QuestionBrowser } from './components/QuestionBrowser';
import { SettingsModal, loadSettings, defaultSettings } from './components/SettingsModal';
import { ProfileView } from './components/ProfileView';
import { TablePreviewModal } from './components/TablePreviewModal';
import { useGamification } from './hooks/useGamification';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import { CustomDatasetModal } from './components/CustomDatasetModal';
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
function DbSelector({
  progress,
  gameState,
  user,
  onShowAuth,
  
  onShowCustomModal,
  onShowSettings,
  /* onSelect removed */
}) {
  const navigate = useNavigate();
  const totalComplete = Object.values(progress).filter(s => s === 'complete').length;
  const totalAttempted = Object.values(progress).filter(s => s === 'attempted').length;
  const totalPct = Math.round((totalComplete + totalAttempted * 0.5) / 600 * 100);
  return <div className="home-root">
      {/* Hero Header */}
      <header className="home-header">
        <div className="home-logo">
          <span className="home-logo-icon">⚡</span>
          <div>
            <h1 className="home-title">SQL Practice Platform</h1>
            <p className="home-subtitle">Master SQL across 10 real-world databases · 600 questions</p>
          </div>
        </div>
        <div className="home-stats">
          <div className="stat-pill">
            <span className="stat-num">{totalComplete}</span>
            <span className="stat-label">Complete</span>
          </div>
          <div className="stat-pill attempted">
            <span className="stat-num">{totalAttempted}</span>
            <span className="stat-label">Attempted</span>
          </div>
          <div className="stat-pill">
            <span className="stat-num">{totalPct}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-ghost" title="Settings" onClick={onShowSettings} style={{ padding: '6px 12px' }}>
            ⚙️ Settings
          </button>
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate('/profile')} style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>My Profile</span>
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onShowAuth}>Login / Sync</button>
          )}
        </div>
      </header>

      {/* Progress bar */}
      <div className="global-progress-bar">
        <div className="global-progress-fill" style={{
        width: `${totalPct}%`
      }} />
      </div>

      {/* DB Grid */}
      <main className="db-grid">
        {DB_NAMES.map(db => {
        const info = DB_INFO[db];
        const dbQuestions = getQuestionsForDb(db);
        const completed = dbQuestions.filter(q => progress[q.id] === 'complete').length;
        const attempted = dbQuestions.filter(q => progress[q.id] === 'attempted').length;
        const pct = Math.round(completed / info.questionCount * 100);
        return <button key={db} id={`db-card-${db}`} className="db-card" onClick={() => navigate('/practice/' + db)}>
              <div className="db-card-header">
                <span className="db-card-icon">{info.icon}</span>
                <div className="db-card-meta">
                  <span className="db-card-name">{info.label}</span>
                  <span className="db-card-count">{info.tableCount} tables · {info.questionCount} questions</span>
                </div>
                <div className="db-card-pct">{pct}%</div>
              </div>
              <p className="db-card-desc">{info.description}</p>
              <div className="db-card-concepts">
                {info.concepts.map(c => <span key={c} className="tag">{c}</span>)}
              </div>
              <div className="db-card-progress">
                <div className="db-progress-bar">
                  <div className="db-progress-fill" style={{
                width: `${pct}%`
              }} />
                  {attempted > 0 && <div className="db-progress-attempted" style={{
                width: `${Math.round(attempted / info.questionCount * 100)}%`,
                left: `${pct}%`
              }} />}
                </div>
                <span className="db-progress-label">
                  {completed}/{info.questionCount}
                </span>
              </div>
            </button>;
      })}
      </main>

      <div style={{ padding: '0 40px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <button className="db-card" onClick={onShowCustomModal} style={{ border: '2px dashed var(--border)', background: 'transparent', width: '100%', minHeight: 120 }}>
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <span style={{ fontSize: 32 }}>📁</span>
            <h3 style={{ margin: '16px 0 8px', color: 'var(--text)' }}>Upload Custom Dataset (CSV)</h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>Practice SQL queries directly against your own CSV files.</p>
          </div>
        </button>
      </div>
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
      setHintsUsed(0);
      setSolutionVisible(false);
      setShowHints(false);
      setPreviewTableName(null);
    }
  }, [routeDb, db, progress]);

  const [sql, setSql] = useState('');
  const [result, setResult] = useState(null);
  const [expectedResult, setExpectedResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showERDiagram, setShowERDiagram] = useState(false);
  const [showDbPicker, setShowDbPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewTableName, setPreviewTableName] = useState(null);

  // Resizable Panes State
  const workspaceRef = useRef(null);
  const [editorHeightPct, setEditorHeightPct] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

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

  // Apply dark mode to document root (now handled in App Root)

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

  const isSandbox = currentQ.id === 'sandbox';
  const dbInfo = isSandbox ? { label: db.name, icon: '📁' } : DB_INFO[db];
  const dbQuestions = useMemo(() => isSandbox ? [] : getQuestionsForDb(db), [isSandbox, db]);

  const {
    isLoading,
    error,
    executeQuery,
    resetDb,
    validateAnswer,
    runVerification,
    getExpectedResultDynamic,
  } = useSqlDatabase(db);

  // Switch DB inline — pick first incomplete question of the new db
  const handleSwitchDb = useCallback((newDb) => {
    if (newDb === db) { setShowDbPicker(false); return; }
    navigate('/practice/' + newDb);
    setShowDbPicker(false);
  }, [db, navigate]);

  // Reset state when question changes and compute true expected result
  useEffect(() => {
    setSql('');
    setResult(null);
    setValidation(null);
    setHintsUsed(0);
    setSolutionVisible(false);
    setShowHints(false);
    if (!isLoading && !error && !isSandbox) {
      const er = getExpectedResultDynamic(currentQ.solutionSQL, currentQ.verificationSQL);
      setExpectedResult(er);
    }
  }, [currentQ.id, currentQ.solutionSQL, currentQ.verificationSQL, isLoading, error, getExpectedResultDynamic, isSandbox]);

  const handleRun = useCallback(() => {
    if (!sql.trim()) return;
    let originalRes = executeQuery(sql);
    let finalRes = { ...originalRes };
    if (!originalRes.error && !isSandbox && currentQ.verificationSQL) {
      const verRes = runVerification(currentQ.verificationSQL);
      finalRes = { ...verRes, execTimeMs: originalRes.execTimeMs };
    }
    setResult(finalRes);
    if (finalRes.error) {
      setValidation({ isCorrect: false, message: finalRes.error });
      if (!isSandbox) onProgressUpdate(currentQ.id, 'attempted');
    } else {
      if (isSandbox) {
        setValidation({ isCorrect: true, message: 'Query executed successfully.' });
      } else if (!expectedResult || expectedResult.columns.length === 0) {
        setValidation({ isCorrect: true, message: '✓ Query ran successfully! Review the results below.' });
        onProgressUpdate(currentQ.id, 'complete');
      } else {
        const requiresOrder = currentQ.solutionSQL.toUpperCase().includes('ORDER BY');
        const vr = validateAnswer(finalRes, expectedResult, requiresOrder);
        setValidation(vr);
        onProgressUpdate(currentQ.id, vr.isCorrect ? 'complete' : 'attempted');
      }
    }
  }, [sql, executeQuery, runVerification, currentQ, isSandbox, validateAnswer, expectedResult, onProgressUpdate]);

  // Auto-run timer (after handleRun is defined)
  useEffect(() => {
    if (!settings.autoRunAfterTyping || !sql.trim()) return;
    const timer = setTimeout(() => { handleRun(); }, 1200);
    return () => clearTimeout(timer);
  }, [sql, settings.autoRunAfterTyping, handleRun]);

  const handlePreviewTable = useCallback(tableName => { setPreviewTableName(tableName); }, []);
  const handleRevealSolution = useCallback(() => {
    setSolutionVisible(true);
    setShowHints(true);
    onProgressUpdate(currentQ.id, 'attempted');
  }, [currentQ, onProgressUpdate]);
  const handleRevealHint = useCallback(() => {
    setHintsUsed(n => Math.min(n + 1, 3));
    onProgressUpdate(currentQ.id, progress[currentQ.id] === 'complete' ? 'complete' : 'attempted');
  }, [currentQ, progress, onProgressUpdate]);

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
    setHintsUsed(0);
    setSolutionVisible(false);
    setShowHints(false);
  }, [db]);

  const currentIdx = dbQuestions.findIndex(q => q.id === currentQ.id);
  const completed = dbQuestions.filter(q => progress[q.id] === 'complete').length;

  const handleKeyDown = useCallback(e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  }, [handleRun]);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close DB picker when clicking outside
  useEffect(() => {
    if (!showDbPicker) return;
    const handler = () => setShowDbPicker(false);
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [showDbPicker]);

  if (error) {
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, color: 'var(--error)' }}>
      <div style={{ fontSize: 48 }}>💥</div>
      <div style={{ fontWeight: 700 }}>Database Error</div>
      <div style={{ color: 'var(--muted)', maxWidth: 400, textAlign: 'center' }}>{error}</div>
      <button className="btn btn-primary" onClick={() => navigate('/')}>← Back to Home</button>
    </div>;
  }

    const fontSizeClass = settings.editorFontSize >= 18 ? 'large' : settings.editorFontSize <= 12 ? 'small' : 'medium';
    return <div className="practice-root" data-theme={settings.darkMode ? 'dark' : 'light'} data-font-size={fontSizeClass}>
    {/* Top Nav */}
    <nav className="practice-nav" style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 50, background: 'var(--surface)', borderBottom: '1px solid var(--border)', gap: 12 }}>
      <button id="run-btn" className="btn btn-ghost" onClick={handleRun} disabled={isLoading || !sql.trim()} style={{ color: 'var(--success)', fontWeight: 600 }}>
        Run ▶
      </button>
      <button className="btn btn-ghost" title="Settings" onClick={onShowSettings}>
        Settings
      </button>
      <button id="browse-btn" className="btn btn-ghost" onClick={() => setShowBrowser(true)}>
        View Questions
      </button>

      <div style={{ flex: 1 }} />

      {!user ? (
        <button className="btn btn-ghost" onClick={onShowAuth} style={{ color: 'var(--primary)' }}>Login</button>
      ) : (
        <span style={{ fontSize: 12, color: 'var(--muted)', marginRight: 8 }}>{user.email}</span>
      )}

      <button className="btn btn-ghost" onClick={() => navigate('/')}>Home</button>

      {/* Choose DB button + dropdown */}
      <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
        <button
          className="btn btn-ghost"
          onClick={() => setShowDbPicker(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>{dbInfo.icon}</span>
          <span>{dbInfo.label}</span>
          <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
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

      <button className="btn btn-ghost" onClick={() => setShowERDiagram(true)} title="View ER Diagram">
        {dbInfo.label} Schema
      </button>
      <button id="reset-btn" className="btn btn-ghost" onClick={async () => {
        await resetDb();
        setResult(null);
        setValidation({ isCorrect: true, message: 'Database successfully restored to original state!' });
      }} disabled={isLoading}>
        Reset DB
      </button>
    </nav>

    {/* Loading overlay */}
    {isLoading && <div className="loading-overlay">
      <div className="spinner" />
      <div style={{ marginTop: 12, color: 'var(--muted)' }}>Loading {dbInfo.label} database…</div>
    </div>}

    {/* Main layout */}
    <div className="practice-layout" style={{ '--sidebar-width': sidebarOpen ? '280px' : '0px' }}>
      {/* 1. Left Panel: Schema Sidebar */}
      <aside className="sidebar-wrap" style={{ display: sidebarOpen ? 'block' : 'none' }}>
        <SchemaSidebar dbName={db} onPreviewTable={handlePreviewTable} />
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
          <div className="editor-actions">
            <button id="run-query-btn" className="btn btn-primary" onClick={handleRun} disabled={isLoading || !sql.trim()}>▶ Run Query</button>
            {!isSandbox && <button id="hint-btn" className="btn btn-ghost btn-sm" onClick={() => setShowHints(true)}>💡 Hints</button>}
            {!isSandbox && <button id="solution-btn" className="btn btn-ghost btn-sm" onClick={handleRevealSolution}>👁 Solution</button>}
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
            isRunning={false}
            onHint={isSandbox ? undefined : () => { setShowHints(true); handleRevealHint(); }}
            onShowSolution={isSandbox ? undefined : handleRevealSolution}
            hasQuestion={!isSandbox}
            hintsUsed={hintsUsed}
          />
        </div>
      </main>

      {/* 3. Right Panel: Question & Hints */}
      {!isSandbox ? (
        <aside className="question-pane">
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
            onHint={() => setShowHints(true)}
            onSolution={handleRevealSolution}
          />
        </aside>
      ) : (
        <aside className="question-pane" style={{ padding: 24 }}>
          <div style={{ background: 'var(--surface-2)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 8px', color: 'var(--text)' }}>Sandbox Mode</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: 14 }}>
              You are querying a custom CSV database. Use the <strong>Schema Panel</strong> on the left to explore your table structure.
              <br/><br/>
              Write any `SELECT` query in the editor and click Run to analyze your data!
            </p>
          </div>
        </aside>
      )}
    </div>

    {/* Hint Drawer */}
    {showHints && <HintDrawer question={currentQ} hintsUsed={hintsUsed} onRevealHint={handleRevealHint} solutionVisible={solutionVisible} onRevealSolution={handleRevealSolution} onClose={() => setShowHints(false)} />}

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
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  const [settings, setSettings] = useState(() => ({ ...defaultSettings, ...loadSettings() }));
  const [showSettings, setShowSettings] = useState(false);

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

  const handleProgressUpdate = useCallback((id, status) => {
    setProgress(prev => {
      const next = { ...prev, [id]: status };
      saveProgress(next);
      if (status === 'complete' && prev[id] !== 'complete') {
        recordActivity();
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
        <Route path="/" element={
          <DbSelector 
            progress={progress} 
            gameState={gameState} 
            user={user} 
            onShowAuth={() => setShowAuth(true)} 
            onShowCustomModal={() => setShowCustomModal(true)} 
            onShowSettings={() => setShowSettings(true)} 
          />
        } />
        
        <Route path="/practice/:db" element={
          <ProtectedRoute user={user}>
            <PracticeView
              progress={progress}
              user={user}
              settings={settings}
              onShowAuth={() => setShowAuth(true)}
              onShowSettings={() => setShowSettings(true)}
              onProgressUpdate={handleProgressUpdate}
            />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute user={user}>
            <ProfileView 
              user={user} 
              gameState={gameState} 
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
      {showCustomModal && <CustomDatasetModal onClose={() => setShowCustomModal(false)} onDatasetReady={(customDb) => {
         alert('Custom Database Sandbox is currently being updated for React Router. Please use standard databases for now.');
         setShowCustomModal(false);
      }} />}
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
