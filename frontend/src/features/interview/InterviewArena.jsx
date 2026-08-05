import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot, User, Loader2, ShieldAlert, Clock, Smartphone, AlertOctagon,
  Keyboard, X, CheckCircle2, Sun, Moon, Play, RotateCcw, Database,
  ChevronLeft, ChevronRight, Code2, MessageSquare, FileText, CheckCircle,
  Circle, HelpCircle, ListChecks
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { chatInterview } from '@/lib/groq';
import { useToast } from '@/shared/ui/ToastSystem';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProctorStore } from './useProctorStore';
import { useInterviewSession } from './hooks/useInterviewSession';
import { useProctoring } from './hooks/useProctoring';
import { SqlEditor } from '@/features/practice/SqlEditor';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { ResultsPanel } from '@/features/practice/ResultsPanel';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (seconds) => {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// ─── Question Navigator Tile ──────────────────────────────────────────────────

function QTile({ index, isCurrent, isAnswered, isMcq, onClick }) {
  const label = index + 1;
  let bg = 'bg-surface-2 hover:bg-surface-3 text-text-secondary border-border';
  if (isCurrent) bg = 'bg-primary text-white border-primary shadow-lg shadow-primary/30';
  else if (isAnswered) bg = 'bg-success/15 text-success border-success/40';

  return (
    <button
      onClick={onClick}
      title={`Question ${label}${isMcq ? ' (MCQ)' : ' (SQL)'}`}
      className={`w-9 h-9 rounded-lg border text-xs font-bold flex items-center justify-center transition-all duration-150 hover:scale-105 ${bg}`}
    >
      {isAnswered && !isCurrent ? <CheckCircle size={14} /> : label}
    </button>
  );
}

// ─── Schema sidebar for a SQL question ───────────────────────────────────────

function SchemaPanel({ question, dbStatus }) {
  if (!question) return <div className="p-4 text-xs text-text-secondary">No schema loaded.</div>;
  return (
    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
      {/* DB status badge */}
      <div className="mb-3 flex items-center gap-2">
        <Database size={12} className="text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Schema</span>
        <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded ${
          dbStatus === 'ready' ? 'bg-success/10 text-success border border-success/30' :
          dbStatus === 'loading' ? 'bg-primary/10 text-primary border border-primary/30 animate-pulse' :
          'bg-surface-3 text-text-secondary border border-border'
        }`}>
          {dbStatus === 'ready' ? 'DB READY' : dbStatus === 'loading' ? 'LOADING' : dbStatus.toUpperCase()}
        </span>
      </div>
      {question.tables?.map((table) => (
        <div key={table.name} className="mb-4">
          <div className="font-bold text-[10px] mb-1.5 text-text flex items-center gap-1 uppercase tracking-wide">
            <span className="text-primary">●</span> {table.name}
          </div>
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            {table.columns?.map((col, i) => (
              <div key={i} className="px-2 py-1 flex justify-between text-xs border-b border-border last:border-b-0 hover:bg-surface-2">
                <span className="font-mono text-text">{col.name}</span>
                <span className="text-text-secondary text-[9px] uppercase font-mono">{col.type}</span>
              </div>
            ))}
          </div>
          {/* Sample data pill */}
          {question.tables?.length > 0 && (
            <p className="text-[9px] text-text-secondary mt-1">{table.sampleData?.length ?? 0} sample rows</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── MCQ Question Card ────────────────────────────────────────────────────────

function McqCard({ question, mcqIndex, savedAnswer, onAnswer }) {
  const [selected, setSelected] = useState(savedAnswer?.selectedIndex ?? null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setSelected(savedAnswer?.selectedIndex ?? null);
    setRevealed(false);
  }, [mcqIndex, savedAnswer]);

  const handleSelect = (i) => {
    setSelected(i);
    onAnswer({ selectedIndex: i });
  };

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Question header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <HelpCircle size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Multiple Choice</p>
            <p className="text-xs text-text-secondary">Select the best answer</p>
          </div>
        </div>

        {/* Question text */}
        <div className="bg-surface-2 border border-border rounded-2xl p-6 mb-6">
          <p className="text-base md:text-lg font-semibold text-text leading-relaxed">{question.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options?.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = revealed && i === question.correctIndex;
            const isWrong = revealed && isSelected && i !== question.correctIndex;

            let optStyle = 'border-border bg-surface hover:bg-surface-2 hover:border-primary/40 text-text cursor-pointer';
            if (isSelected && !revealed) optStyle = 'border-primary bg-primary/10 text-primary cursor-pointer';
            if (isCorrect) optStyle = 'border-success bg-success/10 text-success cursor-default';
            if (isWrong) optStyle = 'border-error bg-error/10 text-error cursor-default';

            return (
              <button
                key={i}
                onClick={() => !revealed && handleSelect(i)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left ${optStyle}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 ${
                  isSelected && !revealed ? 'border-primary bg-primary text-white' :
                  isCorrect ? 'border-success bg-success text-white' :
                  isWrong ? 'border-error bg-error text-white' :
                  'border-border bg-surface-2 text-text-secondary'
                }`}>
                  {labels[i]}
                </div>
                <span className="text-sm font-medium">{opt}</span>
                {isCorrect && <CheckCircle size={16} className="ml-auto text-success shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Reveal / explanation */}
        {selected !== null && !revealed && (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-3 rounded-xl border border-border bg-surface-2 text-sm font-semibold text-text-secondary hover:border-primary hover:text-primary transition-all"
          >
            Check Answer
          </button>
        )}
        {revealed && (
          <div className={`p-4 rounded-xl border text-sm ${selected === question.correctIndex ? 'border-success/40 bg-success/10 text-success' : 'border-error/40 bg-error/10 text-error'}`}>
            <p className="font-bold mb-1">{selected === question.correctIndex ? '✓ Correct!' : `✗ Incorrect. Correct answer: ${labels[question.correctIndex]}`}</p>
            <p className="text-xs opacity-80">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main InterviewArena ──────────────────────────────────────────────────────

export function InterviewArena() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, toggleDarkMode } = useSettingsStore();

  const duration       = parseInt(searchParams.get('duration') || '30', 10);
  const rawDifficulty  = searchParams.get('difficulty') || 'mixed';
  const rawCompanyName = searchParams.get('company') || 'FAANG';
  const rawCandidateName = searchParams.get('name') || 'Candidate';
  const rawRoleName    = searchParams.get('role') || 'Software Engineer';

  const difficulty    = ['easy', 'medium', 'hard', 'mixed'].includes(rawDifficulty.toLowerCase()) ? rawDifficulty.toLowerCase() : 'mixed';
  const companyName   = rawCompanyName.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 30) || 'FAANG';
  const candidateName = rawCandidateName.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 30) || 'Candidate';
  const roleName      = rawRoleName.replace(/[^a-zA-Z0-9 -]/g, '').slice(0, 40) || 'Software Engineer';

  const { cameraStream, addViolation, isTerminated, restoreSessionState, saveSessionState, clearSessionState } = useProctorStore();

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [sqlCode, setSqlCode]             = useState('-- Write your SQL solution here...\n\n');
  const [scratchpad, setScratchpad]       = useState('-- Scratchpad for exploration...\n\n');
  const [activeTab, setActiveTab]         = useState('sql');
  const [queryResult, setQueryResult]     = useState(null);
  const [isRunning, setIsRunning]         = useState(false);
  const [leftPanel, setLeftPanel]         = useState('problem'); // 'problem' | 'schema' | 'chat'
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [chatInput, setChatInput]         = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // ── Session ─────────────────────────────────────────────────────────────────
  const handleFinalSubmit = async (isTimeUp = false) => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;

    try { if (document.fullscreenElement) await document.exitFullscreen().catch(() => {}); } catch {}
    try { useProctorStore.getState().stopAllStreams(); } catch {}
    clearSessionState();

    const payload = {
      companyName, candidateName, roleName,
      answers,
      sessionData,
      durationMinutes: Math.round((duration * 60 - timeLeft) / 60),
      chatHistory: chatMessages,
      forceZero: false,
    };
    sessionStorage.setItem('pending_interview_report', JSON.stringify(payload));
    navigate('/interview/report', { state: { sessionPayload: payload } });
  };

  const {
    sessionData, currentIndex, currentQuestion, isMCQ, sqlIndex, mcqIndex,
    totalQuestions, answers, saveAnswer,
    navigateTo, goNext, goPrev,
    generating, dbStatus, dbSwitching,
    timeLeft, chatMessages, setChatMessages,
    isSubmittedRef, executeQuery,
  } = useInterviewSession({
    duration, difficulty, companyName, candidateName, roleName,
    restoreSessionState, saveSessionState,
    isTerminated, handleFinalSubmit, toast,
  });

  // ── Proctoring ──────────────────────────────────────────────────────────────
  const enforceViolation = (reason) => {
    if (isSubmittedRef.current || isTerminated) return;
    isSubmittedRef.current = true;
    addViolation('integrity_breach', reason);
    try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch {}
    handleFailToReport();
  };

  useProctoring({ isSubmittedRef, isTerminated, enforceViolation, addViolation });

  useEffect(() => () => {
    try { useProctorStore.getState().stopAllStreams(); } catch {}
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Reset editor when navigating to a new SQL question ─────────────────────
  useEffect(() => {
    if (isMCQ) return;
    const saved = answers[currentIndex];
    setSqlCode(saved?.sql ?? '-- Write your SQL solution here...\n\n');
    setQueryResult(null);
    setActiveTab('sql');
  }, [currentIndex, isMCQ]);

  // ── Auto-save SQL editor to answers ────────────────────────────────────────
  const handleSqlChange = (code) => {
    setSqlCode(code);
  };

  const handleSaveCurrentSql = () => {
    if (!isMCQ) {
      saveAnswer({ sql: sqlCode, queryResult });
    }
  };

  // ── Run SQL ─────────────────────────────────────────────────────────────────
  const handleRunSql = async () => {
    const code = activeTab === 'sql' ? sqlCode : scratchpad;
    if (!code.trim() || code.includes('Write your SQL solution here') || code.includes('Scratchpad for exploration')) {
      toast({ title: 'No SQL', message: 'Write a query first.', type: 'info' });
      return;
    }
    if (dbStatus !== 'ready' || dbSwitching) {
      toast({ title: 'DB Loading', message: 'Wait for the database to initialize.', type: 'info' });
      return;
    }
    setIsRunning(true);
    const res = await executeQuery(code);
    setQueryResult(res);
    setIsRunning(false);
    // Auto-save answer
    if (activeTab === 'sql') saveAnswer({ sql: sqlCode, queryResult: res });
  };

  // ── AI chat ─────────────────────────────────────────────────────────────────
  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isChatLoading || isTerminated) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const newMsgs = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newMsgs);
    setIsChatLoading(true);
    try {
      const contextTask = currentQuestion
        ? `${currentQuestion.problemStatement ?? ''}`
        : 'General SQL interview';
      const res = await chatInterview({ companyName, initialTask: contextTask, messages: newMsgs });
      setChatMessages(prev => [...prev, { role: 'assistant', content: res }]);
    } catch (err) {
      if (err.message === 'MISSING_API_KEY') {
        toast({ title: 'Missing API Key', message: 'Add your Groq API key in Settings.', type: 'error' });
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network error. Please try again.' }]);
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  // ── Violation report ─────────────────────────────────────────────────────────
  function handleFailToReport() {
    clearSessionState();
    try { useProctorStore.getState().stopAllStreams(); } catch {}
    const payload = {
      companyName, candidateName, roleName,
      answers, sessionData,
      durationMinutes: Math.round((duration * 60 - timeLeft) / 60),
      chatHistory: chatMessages,
      forceZero: true,
      violationMsg: useProctorStore.getState().violations[0]?.message || 'Integrity Policy Violation',
    };
    sessionStorage.setItem('pending_interview_report', JSON.stringify(payload));
    navigate('/interview/report', { state: { sessionPayload: payload } });
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && !isMCQ) { e.preventDefault(); handleRunSql(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMCQ, sqlCode, scratchpad, activeTab, dbStatus, dbSwitching]);

  // ── Time color ───────────────────────────────────────────────────────────────
  const timeColor = timeLeft <= 300 ? 'text-error' : timeLeft <= 600 ? 'text-warning' : 'text-success';

  // ── answered count ────────────────────────────────────────────────────────────
  const answeredCount = answers.filter(a => a !== null).length;

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: '@media print { body { display: none !important; } }' }} />

      {/* ══ TERMINATED OVERLAY ══ */}
      {isTerminated && (
        <div className="fixed inset-0 z-[200] bg-surface/80 backdrop-blur-xl overflow-y-auto flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-surface border border-error/30 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-error to-transparent" />
            <div className="w-20 h-20 bg-error/10 border border-error/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon size={40} className="text-error" />
            </div>
            <h1 className="text-4xl font-black mb-4 text-text">Session Terminated</h1>
            <p className="text-text-secondary mb-8">Your interview was halted due to an integrity policy violation.</p>
            <button onClick={handleFailToReport} className="px-10 py-4 bg-error text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all">
              Acknowledge & View Report
            </button>
          </div>
        </div>
      )}

      {/* ══ SHORTCUTS MODAL ══ */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2">
              <h3 className="font-bold flex items-center gap-2"><Keyboard size={18} className="text-primary" /> Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-text-secondary hover:text-text"><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm border-b border-border pb-2">
                <span className="text-text-secondary">Run SQL</span>
                <kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-xs border border-border">Ctrl + Enter</kbd>
              </div>
              <div className="mt-4 bg-error/10 border border-error/20 rounded-xl p-4 text-xs text-error font-medium">
                <span className="font-bold block mb-1">PROHIBITED:</span>
                Copy (Ctrl+C), Paste (Ctrl+V), DevTools (F12), and exiting Fullscreen (ESC) are monitored.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MOBILE WARNING ══ */}
      <div className="md:hidden fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center p-6 text-center">
        <Smartphone size={32} className="text-primary mb-4" />
        <h2 className="text-2xl font-extrabold text-text mb-3">Desktop Required</h2>
        <p className="text-text-secondary mb-6">The Interview Arena requires a desktop for full functionality.</p>
        <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className={`w-full h-screen bg-bg flex flex-col select-none overflow-hidden ${isTerminated ? 'blur-md pointer-events-none' : ''}`}>

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface shadow-sm shrink-0">
          {/* Left: company + proctored badge */}
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="font-black text-base tracking-tight text-text">{companyName}</h1>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert size={9} /> Proctored
            </span>
          </div>

          {/* Center: Question progress bar */}
          <div className="flex-1 flex items-center gap-2 mx-4">
            <span className="text-xs text-text-secondary font-semibold whitespace-nowrap">Q{currentIndex + 1}/{totalQuestions}</span>
            <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary font-semibold whitespace-nowrap">{answeredCount}/{totalQuestions}</span>
          </div>

          {/* Right: timer + actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`font-mono font-black text-sm flex items-center gap-1 ${timeColor}`}>
              <Clock size={14} /> {formatTime(timeLeft)}
            </div>
            <button onClick={toggleDarkMode} className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary">
              {settings.darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setShowShortcuts(true)} className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary">
              <Keyboard size={16} />
            </button>
            <button
              onClick={() => handleFinalSubmit(false)}
              className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
            >
              Submit All
            </button>
          </div>
        </div>

        {/* ── BODY ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── QUESTION NAVIGATOR (LEFT SIDEBAR) ──────────────────────────── */}
          <aside className="w-14 shrink-0 bg-surface border-r border-border hidden lg:flex flex-col items-center py-3 gap-2 overflow-y-auto custom-scrollbar">
            {/* SQL section */}
            <div className="w-full px-1 mb-1">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary text-center mb-2">SQL</p>
              <div className="flex flex-col gap-1.5 items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <QTile
                    key={i}
                    index={i}
                    isCurrent={currentIndex === i}
                    isAnswered={answers[i] !== null}
                    isMcq={false}
                    onClick={() => navigateTo(i)}
                  />
                ))}
              </div>
            </div>
            <div className="w-8 h-px bg-border my-1" />
            {/* MCQ section */}
            <div className="w-full px-1">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary text-center mb-2">MCQ</p>
              <div className="flex flex-col gap-1.5 items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <QTile
                    key={i + 5}
                    index={i + 5}
                    isCurrent={currentIndex === i + 5}
                    isAnswered={answers[i + 5] !== null}
                    isMcq={true}
                    onClick={() => navigateTo(i + 5)}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* ── CONTENT AREA ────────────────────────────────────────────────── */}
          {generating ? (
            /* Loading state */
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-surface-3 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database size={24} className="text-primary" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-text mb-2">Generating Interview Session</h2>
                <p className="text-text-secondary">AI is creating 5 SQL questions + 5 MCQs with live databases...</p>
                <div className="mt-4 flex items-center justify-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : isMCQ ? (
            /* ── MCQ Panel (full width) ─────────────────────────────────────── */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* MCQ header */}
              <div className="px-6 py-3 border-b border-border bg-surface-2 flex items-center gap-3">
                <ListChecks size={16} className="text-primary" />
                <span className="text-sm font-bold text-text">MCQ Question {(mcqIndex ?? 0) + 1} of 5</span>
                <span className="text-xs text-text-secondary ml-auto">Conceptual Knowledge</span>
              </div>
              {currentQuestion && (
                <McqCard
                  question={currentQuestion}
                  mcqIndex={mcqIndex}
                  savedAnswer={answers[currentIndex]}
                  onAnswer={(ans) => saveAnswer(ans)}
                />
              )}
              {/* MCQ navigation footer */}
              <div className="px-6 py-4 border-t border-border bg-surface flex justify-between items-center shrink-0">
                <button onClick={goPrev} disabled={currentIndex === 0} className="flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text disabled:opacity-40 transition-all">
                  <ChevronLeft size={16} /> Previous
                </button>
                {currentIndex < totalQuestions - 1 ? (
                  <button onClick={goNext} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all">
                    Next Question <ChevronRight size={16} />
                  </button>
                ) : (
                  <button onClick={() => handleFinalSubmit(false)} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-success text-white text-sm font-bold hover:bg-success/90 transition-all">
                    <CheckCircle2 size={16} /> Submit Interview
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── SQL Question Panel (3-pane layout) ─────────────────────────── */
            <div className="flex-1 flex overflow-hidden">

              {/* Left: Problem / Schema / Chat */}
              <div className="w-[38%] min-w-[300px] max-w-[480px] border-r border-border flex flex-col bg-surface-2">
                {/* Tab bar */}
                <div className="flex bg-surface border-b border-border px-2 pt-1.5 gap-0.5 shrink-0">
                  {[
                    { id: 'problem', icon: FileText, label: 'Problem' },
                    { id: 'schema',  icon: Database,  label: 'Schema' },
                    { id: 'chat',    icon: MessageSquare, label: 'AI Chat' },
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setLeftPanel(id)}
                      className={`px-4 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                        leftPanel === id
                          ? 'bg-bg text-primary border border-border border-b-transparent'
                          : 'bg-transparent text-text-secondary hover:bg-surface-2'
                      }`}
                    >
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>

                {/* Problem tab */}
                {leftPanel === 'problem' && currentQuestion && (
                  <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-primary">SQL Q{(sqlIndex ?? 0) + 1}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-3 text-text-secondary border border-border capitalize">{difficulty}</span>
                      {dbSwitching && (
                        <span className="text-xs text-primary animate-pulse ml-auto flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Loading DB...</span>
                      )}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {`### Problem Statement\n${currentQuestion.problemStatement ?? ''}\n\n${currentQuestion.explanation ? `**Context:** ${currentQuestion.explanation}` : ''}\n\n${currentQuestion.constraints ? `**Constraints:** ${currentQuestion.constraints}` : ''}\n\n${currentQuestion.tables?.length > 0 ? `**Available tables:** ${currentQuestion.tables.map(t => `\`${t.name}\``).join(', ')}` : ''}`}
                      </ReactMarkdown>
                    </div>
                    {currentQuestion.expectedOutput?.length > 0 && (
                      <div className="mt-4 p-3 bg-surface-3 rounded-xl border border-border">
                        <p className="text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">Expected Output Preview</p>
                        <div className="overflow-x-auto">
                          <table className="text-xs w-full">
                            <thead>
                              <tr>
                                {Object.keys(currentQuestion.expectedOutput[0] ?? {}).map(k => (
                                  <th key={k} className="text-left py-1 px-2 text-text font-mono border-b border-border">{k}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {currentQuestion.expectedOutput.slice(0, 3).map((row, ri) => (
                                <tr key={ri}>
                                  {Object.values(row).map((v, vi) => (
                                    <td key={vi} className="py-1 px-2 text-text-secondary font-mono">{String(v)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Schema tab */}
                {leftPanel === 'schema' && (
                  <SchemaPanel question={currentQuestion} dbStatus={dbSwitching ? 'loading' : dbStatus} />
                )}

                {/* Chat tab */}
                {leftPanel === 'chat' && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface-3 text-text-secondary border border-border'}`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                          </div>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-surface-3 border border-border text-text rounded-tl-none'}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-surface-3 border border-border flex items-center justify-center">
                            <Bot size={14} className="text-text-secondary" />
                          </div>
                          <div className="bg-surface-3 border border-border rounded-2xl rounded-tl-none p-3">
                            <Loader2 size={14} className="animate-spin text-text-secondary" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendChat} className="p-3 border-t border-border bg-surface">
                      <div className="flex gap-2">
                        <input
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          placeholder="Ask the interviewer..."
                          disabled={isChatLoading || isTerminated}
                          className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-40 hover:bg-primary/90 transition-all">
                          Send
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Right: SQL Editor + Results */}
              <div className="flex-1 flex flex-col overflow-hidden bg-bg">
                {/* Editor tabs + toolbar */}
                <div className="flex items-center gap-1 px-3 pt-2 pb-0 border-b border-border bg-surface shrink-0">
                  <button
                    onClick={() => setActiveTab('sql')}
                    className={`px-4 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 transition-all ${activeTab === 'sql' ? 'bg-bg text-primary border border-border border-b-transparent' : 'text-text-secondary hover:bg-surface-2'}`}
                  >
                    <Code2 size={13} /> Solution
                  </button>
                  <button
                    onClick={() => setActiveTab('scratch')}
                    className={`px-4 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 transition-all ${activeTab === 'scratch' ? 'bg-bg text-primary border border-border border-b-transparent' : 'text-text-secondary hover:bg-surface-2'}`}
                  >
                    <FileText size={13} /> Scratchpad
                  </button>
                  <div className="ml-auto flex items-center gap-2 pb-1">
                    {answers[currentIndex]?.sql && (
                      <span className="text-[9px] font-bold text-success border border-success/30 bg-success/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle size={9} /> Saved
                      </span>
                    )}
                    <button
                      onClick={() => { setSqlCode('-- Write your SQL solution here...\n\n'); setQueryResult(null); }}
                      className="text-text-secondary hover:text-text p-1 rounded"
                      title="Reset editor"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      onClick={handleRunSql}
                      disabled={isRunning || dbSwitching}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all"
                    >
                      {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                      {isRunning ? 'Running...' : 'Run SQL'}
                    </button>
                  </div>
                </div>

                {/* SQL Editor */}
                <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
                  <SqlEditor
                    value={activeTab === 'sql' ? sqlCode : scratchpad}
                    onChange={activeTab === 'sql' ? handleSqlChange : setScratchpad}
                    onRun={handleRunSql}
                    readOnly={isTerminated}
                  />
                </div>

                {/* Results panel */}
                {queryResult && (
                  <div className="h-48 border-t border-border shrink-0 overflow-hidden">
                    <ResultsPanel result={queryResult} isLoading={isRunning} />
                  </div>
                )}

                {/* SQL navigation footer */}
                <div className="px-4 py-3 border-t border-border bg-surface flex justify-between items-center shrink-0">
                  <button onClick={goPrev} disabled={currentIndex === 0} className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text disabled:opacity-40 transition-all">
                    <ChevronLeft size={15} /> Previous
                  </button>
                  <button
                    onClick={() => { handleSaveCurrentSql(); goNext(); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
                  >
                    Save & Next <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
