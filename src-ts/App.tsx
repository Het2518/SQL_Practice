import { useState, useCallback, useEffect } from 'react';
import type { Question, DatabaseName, CompletionStatus, QueryResult } from './types';
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
import { SettingsModal } from './components/SettingsModal';
import type { ThemeType, FontSize } from './components/SettingsModal';
import { TablePreviewModal } from './components/TablePreviewModal';
import './styles.css';

// ─── Progress persistence ────────────────────────────────────────────────────
const PROGRESS_KEY = 'sql-practice-progress';
function loadProgress(): Record<string, CompletionStatus> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}');
  } catch {
    return {};
  }
}
function saveProgress(p: Record<string, CompletionStatus>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}

// ─── DB Selector Screen ──────────────────────────────────────────────────────
const DB_NAMES = Object.keys(DB_INFO) as DatabaseName[];

function DbSelector({
  progress,
  onSelect,
}: {
  progress: Record<string, CompletionStatus>;
  onSelect: (db: DatabaseName) => void;
}) {
  const totalComplete = Object.values(progress).filter((s) => s === 'complete').length;
  const totalAttempted = Object.values(progress).filter((s) => s === 'attempted').length;
  const totalPct = Math.round(((totalComplete + totalAttempted * 0.5) / 600) * 100);

  return (
    <div className="home-root">
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
      </header>

      {/* Progress bar */}
      <div className="global-progress-bar">
        <div className="global-progress-fill" style={{ width: `${totalPct}%` }} />
      </div>

      {/* DB Grid */}
      <main className="db-grid">
        {DB_NAMES.map((db) => {
          const info = DB_INFO[db];
          const dbQuestions = getQuestionsForDb(db);
          const completed = dbQuestions.filter((q) => progress[q.id] === 'complete').length;
          const attempted = dbQuestions.filter((q) => progress[q.id] === 'attempted').length;
          const pct = Math.round((completed / info.questionCount) * 100);

          return (
            <button
              key={db}
              id={`db-card-${db}`}
              className="db-card"
              onClick={() => onSelect(db)}
            >
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
                {info.concepts.map((c) => <span key={c} className="tag">{c}</span>)}
              </div>
              <div className="db-card-progress">
                <div className="db-progress-bar">
                  <div
                    className="db-progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                  {attempted > 0 && (
                    <div
                      className="db-progress-attempted"
                      style={{
                        width: `${Math.round((attempted / info.questionCount) * 100)}%`,
                        left: `${pct}%`,
                      }}
                    />
                  )}
                </div>
                <span className="db-progress-label">
                  {completed}/{info.questionCount}
                </span>
              </div>
            </button>
          );
        })}
      </main>
    </div>
  );
}

// ─── Main Practice View ──────────────────────────────────────────────────────
function PracticeView({
  db,
  initialQuestion,
  progress,
  onProgressUpdate,
  onHome,
}: {
  db: DatabaseName;
  initialQuestion: Question;
  progress: Record<string, CompletionStatus>;
  onProgressUpdate: (id: number, status: CompletionStatus) => void;
  onHome: () => void;
}) {
  const dbInfo = DB_INFO[db];
  const dbQuestions = getQuestionsForDb(db);
  const [currentQ, setCurrentQ] = useState<Question>(initialQuestion);
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [expectedResult, setExpectedResult] = useState<QueryResult | null>(null);
  const [validation, setValidation] = useState<{ isCorrect: boolean; message: string; mismatchedRows?: number[] } | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showERDiagram, setShowERDiagram] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewTableName, setPreviewTableName] = useState<string | null>(null);
  
  // Settings state
  const [theme, setTheme] = useState<ThemeType>('light');
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  const { isLoading, error, executeQuery, resetDb, validateAnswer, runVerification, getExpectedResultDynamic } = useSqlDatabase(db);

  // Reset state when question changes and compute true expected result
  useEffect(() => {
    setSql('');
    setResult(null);
    setValidation(null);
    setHintsUsed(0);
    setSolutionVisible(false);
    setShowHints(false);

    if (!isLoading && !error) {
      const er = getExpectedResultDynamic(currentQ.solutionSQL, currentQ.verificationSQL);
      setExpectedResult(er);
    }
  }, [currentQ.id, isLoading, error, getExpectedResultDynamic]);

  const handleRun = useCallback(() => {
    if (!sql.trim()) return;
    
    let res = executeQuery(sql);
    
    if (!res.error && currentQ.verificationSQL) {
      res = runVerification(currentQ.verificationSQL);
    }
    
    setResult(res);

    if (res.error) {
      setValidation({ isCorrect: false, message: res.error });
      onProgressUpdate(currentQ.id, 'attempted');
    } else {
      if (!expectedResult || expectedResult.columns.length === 0) {
        setValidation({ isCorrect: true, message: '✓ Query ran successfully! Review the results below.' });
        onProgressUpdate(currentQ.id, 'complete');
      } else {
        const requiresOrder = currentQ.solutionSQL.toUpperCase().includes('ORDER BY');
        const vr = validateAnswer(res, expectedResult, requiresOrder);
        setValidation(vr);
        onProgressUpdate(currentQ.id, vr.isCorrect ? 'complete' : 'attempted');
      }
    }
  }, [sql, executeQuery, runVerification, currentQ, validateAnswer, expectedResult, onProgressUpdate]);

  const handlePreviewTable = useCallback((tableName: string) => {
    setPreviewTableName(tableName);
  }, []);

  const handleRevealSolution = useCallback(() => {
    setSolutionVisible(true);
    setShowHints(true); // Open the drawer to show the solution
    onProgressUpdate(currentQ.id, 'attempted');
  }, [currentQ, onProgressUpdate]);

  const handleRevealHint = useCallback(() => {
    setHintsUsed((n) => Math.min(n + 1, 3));
    onProgressUpdate(currentQ.id, progress[currentQ.id] === 'complete' ? 'complete' : 'attempted');
  }, [currentQ, progress, onProgressUpdate]);

  const navigateTo = useCallback((direction: 'prev' | 'next') => {
    const idx = dbQuestions.findIndex((q) => q.id === currentQ.id);
    if (direction === 'prev' && idx > 0) setCurrentQ(dbQuestions[idx - 1]);
    if (direction === 'next' && idx < dbQuestions.length - 1) setCurrentQ(dbQuestions[idx + 1]);
  }, [currentQ, dbQuestions]);

  const currentIdx = dbQuestions.findIndex((q) => q.id === currentQ.id);
  const completed = dbQuestions.filter((q) => progress[q.id] === 'complete').length;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    },
    [handleRun]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, color: 'var(--error)' }}>
        <div style={{ fontSize: 48 }}>💥</div>
        <div style={{ fontWeight: 700 }}>Database Error</div>
        <div style={{ color: 'var(--muted)', maxWidth: 400, textAlign: 'center' }}>{error}</div>
        <button className="btn btn-primary" onClick={onHome}>← Back to Home</button>
      </div>
    );
  }

  return (
    <div className="practice-root" data-theme={theme} data-font-size={fontSize}>
      {/* Top Nav */}
      <nav className="practice-nav" style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        height: 50,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        gap: 12
      }}>
        <button id="run-btn" className="btn btn-ghost" onClick={handleRun} disabled={isLoading || !sql.trim()} style={{ color: 'var(--success)', fontWeight: 600 }}>
          Run ▶
        </button>
        <button className="btn btn-ghost" title="Settings" onClick={() => setShowSettings(true)}>
          Settings
        </button>
        <button id="browse-btn" className="btn btn-ghost" onClick={() => setShowBrowser(true)}>
          View Questions
        </button>
        
        <div style={{ flex: 1 }} />
        
        <button className="btn btn-ghost" onClick={onHome}>
          Home
        </button>
        <button 
          className="btn btn-ghost"
          onClick={() => setShowERDiagram(true)}
          title="View ER Diagram"
        >
          {dbInfo.label} Schema
        </button>
        <button id="reset-btn" className="btn btn-ghost" onClick={resetDb} disabled={isLoading}>
          Reset DB
        </button>
      </nav>

      {/* Loading overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <div style={{ marginTop: 12, color: 'var(--muted)' }}>Loading {dbInfo.label} database…</div>
        </div>
      )}

      {/* Main layout */}
      <div className="practice-layout" style={{ '--sidebar-width': sidebarOpen ? '280px' : '0px' } as React.CSSProperties}>
        {/* 1. Left Panel: Schema Sidebar */}
        <aside className="sidebar-wrap" style={{ display: sidebarOpen ? 'block' : 'none' }}>
          <SchemaSidebar dbName={db} onPreviewTable={handlePreviewTable} />
        </aside>

        {/* 2. Center Panel: Editor + Results */}
        <main className="center-workspace">
          {/* Editor */}
          <div className="editor-col">
            <div className="editor-col-header">
              <span className="editor-label">SQL Editor</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {!sidebarOpen && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setSidebarOpen(true)}>📊 Schema</button>
                )}
              </div>
            </div>
            {/* Monaco gets all the middle flex space */}
            <div className="monaco-wrap">
              <SqlEditor value={sql} onChange={setSql} onRun={handleRun} disabled={isLoading} dbName={db} />
            </div>
            <div className="editor-actions">
              <button id="run-btn" className="btn btn-primary" onClick={handleRun} disabled={isLoading || !sql.trim()}>▶ Run Query</button>
              <button id="hint-btn" className="btn btn-ghost btn-sm" onClick={() => setShowHints(true)}>💡 Hints</button>
              <button id="solution-btn" className="btn btn-ghost btn-sm" onClick={handleRevealSolution}>👁 Solution</button>
            </div>
          </div>

          {/* Results */}
          <div className="results-col">
            <ResultsPanel
              result={result}
              validation={validation}
              isRunning={false}
              onHint={() => { setShowHints(true); handleRevealHint(); }}
              onShowSolution={handleRevealSolution}
              hasQuestion={true}
              hintsUsed={hintsUsed}
            />
          </div>
        </main>

        {/* 3. Right Panel: Question & Hints */}
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
      </div>

      {/* Hint Drawer */}
      {showHints && (
        <HintDrawer
          question={currentQ}
          hintsUsed={hintsUsed}
          onRevealHint={handleRevealHint}
          solutionVisible={solutionVisible}
          onRevealSolution={handleRevealSolution}
          onClose={() => setShowHints(false)}
        />
      )}

      {/* Question Browser */}
      {showBrowser && (
        <QuestionBrowser
          questions={allQuestions}
          progress={progress}
          currentQuestionId={currentQ.id}
          onSelectQuestion={(q) => { setCurrentQ(q); }}
          onClose={() => setShowBrowser(false)}
        />
      )}

      {/* ER Diagram Modal */}
      {showERDiagram && (
        <ERDiagramModal dbName={db} onClose={() => setShowERDiagram(false)} />
      )}

      {/* Table Preview Modal */}
      {previewTableName && (
        <TablePreviewModal
          db={db}
          tableName={previewTableName}
          onClose={() => setPreviewTableName(null)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          theme={theme} setTheme={setTheme}
          fontSize={fontSize} setFontSize={setFontSize}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// ─── App Root ────────────────────────────────────────────────────────────────
export default function App() {
  const [progress, setProgress] = useState<Record<string, CompletionStatus>>(loadProgress);
  const [activeDb, setActiveDb] = useState<DatabaseName | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  const handleSelectDb = useCallback((db: DatabaseName) => {
    const dbQs = getQuestionsForDb(db);
    // Find first incomplete question or fallback to first
    const firstIncomplete = dbQs.find((q) => !progress[q.id] || progress[q.id] === 'incomplete') ?? dbQs[0];
    setActiveDb(db);
    setActiveQuestion(firstIncomplete);
  }, [progress]);

  const handleProgressUpdate = useCallback((id: number, status: CompletionStatus) => {
    setProgress((prev) => {
      const next = { ...prev, [id]: status };
      saveProgress(next);
      return next;
    });
  }, []);

  const handleHome = useCallback(() => {
    setActiveDb(null);
    setActiveQuestion(null);
  }, []);

  if (activeDb && activeQuestion) {
    return (
      <PracticeView
        db={activeDb}
        initialQuestion={activeQuestion}
        progress={progress}
        onProgressUpdate={handleProgressUpdate}
        onHome={handleHome}
      />
    );
  }

  return <DbSelector progress={progress} onSelect={handleSelectDb} />;
}
