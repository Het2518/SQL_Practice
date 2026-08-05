import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot, User, Loader2, ShieldAlert, Clock, Smartphone, AlertOctagon,
  Keyboard, X, CheckCircle2, Sun, Moon, Play, RotateCcw, Database,
  ChevronLeft, ChevronRight, Code2, MessageSquare, FileText, CheckCircle,
  Circle, HelpCircle, ListChecks, Table, Sparkles, Check, Info, AlertCircle,
  GripHorizontal, Minimize2, Maximize2, Copy
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
  let bg = 'bg-surface-2 hover:bg-surface-3 text-text-secondary border-border hover:text-text';
  if (isCurrent) {
    bg = 'bg-primary text-primary-foreground border-primary shadow-md font-black';
  } else if (isAnswered) {
    bg = 'bg-success/15 text-success border-success/40 font-bold';
  }

  return (
    <button
      onClick={onClick}
      title={`Question ${label}${isMcq ? ' (MCQ)' : ' (SQL)'}`}
      className={`w-9 h-9 rounded-xl border text-xs flex items-center justify-center transition-all duration-150 active:scale-95 ${bg}`}
    >
      {isAnswered && !isCurrent ? <Check size={14} className="stroke-[3]" /> : label}
    </button>
  );
}

// ─── Schema Panel ─────────────────────────────────────────────────────────────

function SchemaPanel({ question, dbStatus }) {
  if (!question) return <div className="p-4 text-xs text-text-secondary">No schema loaded.</div>;
  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
      {/* DB status banner */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-primary" />
          <span className="text-xs font-bold text-text">Database Schema</span>
        </div>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
          dbStatus === 'ready' ? 'bg-success/10 text-success border border-success/30' :
          dbStatus === 'loading' ? 'bg-primary/10 text-primary border border-primary/30 animate-pulse' :
          'bg-surface-3 text-text-secondary border border-border'
        }`}>
          {dbStatus === 'ready' ? '● Ready' : dbStatus === 'loading' ? '● Loading' : dbStatus.toUpperCase()}
        </span>
      </div>

      {question.tables?.map((table) => (
        <div key={table.name} className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-3 py-2 bg-surface-2 border-b border-border flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-text flex items-center gap-1.5">
              <Table size={13} className="text-primary" /> {table.name}
            </span>
            <span className="text-[10px] text-text-secondary font-medium">
              {table.sampleData?.length ?? 0} rows
            </span>
          </div>
          <div className="divide-y divide-border">
            {table.columns?.map((col, i) => (
              <div key={i} className="px-3 py-1.5 flex justify-between items-center text-xs hover:bg-surface-2/50 transition-colors">
                <span className="font-mono text-text font-medium">{col.name}</span>
                <span className="text-[10px] font-mono text-text-secondary uppercase px-1.5 py-0.5 rounded bg-surface-3 border border-border/50">
                  {col.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CopyableTableName({ name }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(name);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-3 hover:bg-primary/10 border border-border hover:border-primary/40 transition-all text-text cursor-pointer"
      title="Click to copy table name"
    >
      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
      <span className="font-mono text-xs font-extrabold text-primary">{name}</span>
      {copied ? (
        <span className="text-[10px] text-success font-semibold flex items-center gap-0.5">
          <Check size={11} /> Copied
        </span>
      ) : (
        <Copy size={11} className="text-text-secondary opacity-50 group-hover:opacity-100 group-hover:text-primary transition-opacity" />
      )}
    </button>
  );
}

// ─── Problem Detail View (Problem, Explanation, Tables with Samples, Expected Output) ──

function ProblemDetailView({ question, sqlIndex, difficulty, dbSwitching }) {
  if (!question) return null;

  return (
    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
      {/* Header Tag */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
            SQL Question {(sqlIndex ?? 0) + 1} of 5
          </span>
          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-surface-3 text-text-secondary border border-border capitalize">
            {difficulty}
          </span>
        </div>
        {dbSwitching && (
          <span className="text-xs text-primary font-semibold animate-pulse flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> Loading Schema...
          </span>
        )}
      </div>

      {/* 1. Problem Statement */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
          <FileText size={14} className="text-primary" /> Problem Statement
        </h3>
        <div className="text-sm font-semibold text-text leading-relaxed bg-surface border border-border rounded-xl p-4 shadow-sm">
          {question.problemStatement}
        </div>
      </div>

      {/* 2. Context & Explanation */}
      {question.explanation && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
            <Info size={14} className="text-primary" /> Context & Logic
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed bg-surface/60 border border-border/70 rounded-xl p-3.5">
            {question.explanation}
          </p>
        </div>
      )}

      {/* 3. Constraints */}
      {question.constraints && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
            <AlertCircle size={14} className="text-warning" /> Constraints & Requirements
          </h3>
          <div className="text-xs text-text-secondary bg-warning/5 border border-warning/20 rounded-xl p-3.5 leading-relaxed">
            {question.constraints}
          </div>
        </div>
      )}

      {/* 4. Table Information & Top 5 Sample Rows */}
      {question.tables && question.tables.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
              <Table size={14} className="text-primary" /> Input Tables & Sample Data
            </h3>
            <span className="text-[10px] text-text-secondary font-medium">Click table name to copy</span>
          </div>

          {question.tables.map((table, tIdx) => {
            const cols = table.columns?.map(c => (typeof c === 'string' ? c : c.name)) || (table.sampleData?.[0] ? Object.keys(table.sampleData[0]) : []);
            const sampleRows = (table.sampleData || []).slice(0, 5);

            return (
              <div key={table.name || tIdx} className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="px-3.5 py-2.5 bg-surface-2 border-b border-border flex flex-wrap items-center justify-between gap-2">
                  <CopyableTableName name={table.name} />
                  <div className="flex flex-wrap items-center gap-1">
                    {table.columns?.map((c, ci) => {
                      const colName = typeof c === 'string' ? c : c.name;
                      const colType = typeof c === 'object' && c.type ? c.type : 'TEXT';
                      return (
                        <span key={ci} className="text-[10px] font-mono text-text-secondary bg-surface px-2 py-0.5 rounded-md border border-border">
                          {colName} <span className="opacity-60 text-[9px] font-bold">({colType})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Sample Data Table */}
                {sampleRows.length > 0 ? (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-3 border-b border-border text-[11px] font-mono text-text-secondary">
                          {cols.map((col, ci) => (
                            <th key={ci} className="py-2 px-3 font-semibold border-r border-border/40 last:border-r-0">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-mono text-xs">
                        {sampleRows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-surface-2/40 transition-colors">
                            {cols.map((col, ci) => (
                              <td key={ci} className="py-1.5 px-3 text-text border-r border-border/40 last:border-r-0 whitespace-nowrap">
                                {row[col] !== undefined && row[col] !== null ? String(row[col]) : <span className="text-text-secondary italic">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 text-xs text-text-secondary italic">No sample rows available.</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Expected Output Table Preview */}
      {question.expectedOutput && question.expectedOutput.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-success mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Expected Output Format
          </h3>
          <div className="bg-surface rounded-xl border border-success/30 overflow-hidden shadow-sm">
            <div className="px-3.5 py-2 bg-success/10 border-b border-success/20 text-xs font-bold text-success flex items-center justify-between">
              <span>Expected Output Sample</span>
              <span className="text-[10px] opacity-80 font-normal">Matching rows</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-surface-3 border-b border-border text-[11px] text-text-secondary">
                    {Object.keys(question.expectedOutput[0] || {}).map((colKey, ki) => (
                      <th key={ki} className="py-2 px-3 font-semibold border-r border-border/40 last:border-r-0">
                        {colKey}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  {question.expectedOutput.slice(0, 5).map((row, ri) => (
                    <tr key={ri} className="hover:bg-success/5 transition-colors">
                      {Object.values(row).map((val, vi) => (
                        <td key={vi} className="py-1.5 px-3 text-text border-r border-border/40 last:border-r-0 whitespace-nowrap">
                          {val !== undefined && val !== null ? String(val) : <span className="text-text-secondary italic">NULL</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
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
    <div className="flex-1 overflow-y-auto p-6 md:p-10 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Question tag */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
            Q{mcqIndex + 6}
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">Conceptual SQL MCQ</p>
            <p className="text-xs text-text-secondary">Select the single correct answer</p>
          </div>
        </div>

        {/* Question statement */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-base md:text-lg font-bold text-text leading-relaxed">{question.question}</p>
        </div>

        {/* Options list */}
        <div className="space-y-3 mb-6">
          {question.options?.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = revealed && i === question.correctIndex;
            const isWrong = revealed && isSelected && i !== question.correctIndex;

            let optClasses = 'border-border bg-surface hover:border-primary/50 text-text hover:bg-surface-2 cursor-pointer';
            if (isSelected && !revealed) {
              optClasses = 'border-primary bg-primary/10 text-primary shadow-sm font-semibold';
            }
            if (isCorrect) {
              optClasses = 'border-success bg-success/10 text-success font-semibold';
            }
            if (isWrong) {
              optClasses = 'border-error bg-error/10 text-error';
            }

            return (
              <button
                key={i}
                onClick={() => !revealed && handleSelect(i)}
                className={`w-full flex items-center gap-3.5 p-4 rounded-xl border-2 transition-all duration-150 text-left ${optClasses}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border transition-colors ${
                    isSelected && !revealed
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCorrect
                      ? 'border-success bg-success text-white'
                      : isWrong
                      ? 'border-error bg-error text-white'
                      : 'border-border bg-surface-2 text-text-secondary'
                  }`}
                >
                  {labels[i]}
                </div>
                <span className="text-sm font-medium leading-relaxed">{opt}</span>
                {isCorrect && <CheckCircle size={18} className="ml-auto text-success shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Reveal answer explanation */}
        {selected !== null && !revealed && (
          <Button
            variant="secondary"
            onClick={() => setRevealed(true)}
            className="w-full py-2.5 text-xs font-bold"
          >
            Check Answer & Explanation
          </Button>
        )}

        {revealed && (
          <div
            className={`p-4 rounded-2xl border text-xs leading-relaxed ${
              selected === question.correctIndex
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-error/40 bg-error/10 text-error'
            }`}
          >
            <p className="font-bold text-sm mb-1">
              {selected === question.correctIndex ? '✓ Correct Answer!' : `✗ Incorrect. Correct answer: Option ${labels[question.correctIndex]}`}
            </p>
            <p className="opacity-90">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Draggable Proctoring Picture-in-Picture Feed ─────────────────────────────

function DraggableProctorFeed({ cameraStream, screenStream }) {
  const videoRef = useRef(null);
  const [pos, setPos] = useState(() => ({
    x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 190) : 100,
    y: typeof window !== 'undefined' ? Math.max(16, window.innerHeight - 170) : 100,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });

  useEffect(() => {
    if (videoRef.current && cameraStream && !isMinimized) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isMinimized]);

  useEffect(() => {
    const onResize = () => {
      setPos(p => ({
        x: Math.min(p.x, window.innerWidth - (isMinimized ? 130 : 190)),
        y: Math.min(p.y, window.innerHeight - (isMinimized ? 50 : 170)),
      }));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isMinimized]);

  const handlePointerDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const maxX = window.innerWidth - (isMinimized ? 140 : 180);
    const maxY = window.innerHeight - (isMinimized ? 44 : 150);
    setPos({
      x: Math.max(12, Math.min(maxX, dragRef.current.origX + dx)),
      y: Math.max(12, Math.min(maxY, dragRef.current.origY + dy)),
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  if (!cameraStream && !screenStream) return null;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        touchAction: 'none',
      }}
      className={`fixed z-50 select-none bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl transition-[box-shadow,border-color] ${
        isDragging ? 'shadow-2xl ring-2 ring-primary/50 cursor-grabbing' : 'cursor-grab hover:border-primary/40'
      } ${isMinimized ? 'p-2' : 'p-2.5'}`}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-success">
          <GripHorizontal size={12} className="text-text-secondary opacity-60" />
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>PROCTORED</span>
        </div>
        <div className="flex items-center gap-1">
          {screenStream && !isMinimized && (
            <span className="text-[8px] font-bold text-text-secondary bg-surface-2 px-1 py-0.5 rounded border border-border">
              Screen
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsMinimized(prev => !prev)}
            className="p-1 rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            title={isMinimized ? 'Expand Video' : 'Minimize to Badge'}
          >
            {isMinimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
          </button>
        </div>
      </div>

      {!isMinimized && cameraStream && (
        <div className="w-36 h-24 bg-black rounded-xl overflow-hidden relative border border-border shadow-inner mt-1.5 pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        </div>
      )}
    </div>
  );
}

// ─── Main InterviewArena Component ────────────────────────────────────────────

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

  const { cameraStream, screenStream, addViolation, isTerminated, restoreSessionState, saveSessionState, clearSessionState } = useProctorStore();

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [sqlCode, setSqlCode]             = useState('-- Write your SQL solution below\n\n');
  const [scratchpad, setScratchpad]       = useState('-- Scratchpad for exploratory queries\n\n');
  const [activeTab, setActiveTab]         = useState('sql'); // 'sql' | 'scratch'
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
    setSqlCode(saved?.sql ?? `-- Write your SQL solution for Q${currentIndex + 1} below\n\n`);
    setQueryResult(saved?.queryResult ?? null);
    setActiveTab('sql');
  }, [currentIndex, isMCQ]);

  // ── Auto-save SQL editor ────────────────────────────────────────────────────
  const handleSqlChange = (code) => {
    setSqlCode(code);
    if (!isMCQ) {
      saveAnswer({ sql: code, queryResult });
    }
  };

  const handleSaveCurrentSql = () => {
    if (!isMCQ) {
      saveAnswer({ sql: sqlCode, queryResult });
    }
  };

  // ── Run SQL Query ───────────────────────────────────────────────────────────
  const handleRunSql = async () => {
    const code = activeTab === 'sql' ? sqlCode : scratchpad;
    const trimmed = code.trim();

    if (!trimmed) {
      toast({ title: 'No SQL Query', message: 'Type a SQL query to execute.', type: 'info' });
      return;
    }

    setIsRunning(true);
    try {
      const res = await executeQuery(code);
      setQueryResult(res);
      if (activeTab === 'sql' && !isMCQ) {
        saveAnswer({ sql: sqlCode, queryResult: res });
      }
    } catch (err) {
      setQueryResult({ columns: [], rows: [], error: err.message });
    } finally {
      setIsRunning(false);
    }
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
      if (e.ctrlKey && e.key === 'Enter' && !isMCQ) {
        e.preventDefault();
        handleRunSql();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMCQ, sqlCode, scratchpad, activeTab, dbStatus, dbSwitching]);

  // ── Time color ───────────────────────────────────────────────────────────────
  const timeColor = timeLeft <= 300 ? 'text-error' : timeLeft <= 600 ? 'text-warning' : 'text-success';

  // ── Answered count ────────────────────────────────────────────────────────────
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
            <h1 className="text-3xl font-black mb-4 text-text">Session Terminated</h1>
            <p className="text-text-secondary mb-8">Your interview was halted due to an integrity policy violation.</p>
            <Button variant="danger" size="lg" onClick={handleFailToReport} className="font-bold text-base">
              Acknowledge & View Report
            </Button>
          </div>
        </div>
      )}

      {/* ══ SHORTCUTS MODAL ══ */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2">
              <h3 className="font-bold text-sm flex items-center gap-2 text-text">
                <Keyboard size={16} className="text-primary" /> Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowShortcuts(false)} className="text-text-secondary hover:text-text">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-xs border-b border-border pb-2.5">
                <span className="text-text">Execute SQL Query</span>
                <kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-[11px] border border-border text-text">Ctrl + Enter</kbd>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-border pb-2.5">
                <span className="text-text">Format SQL Code</span>
                <kbd className="px-2 py-1 bg-surface-3 rounded font-mono text-[11px] border border-border text-text">Ctrl + Q</kbd>
              </div>
              <div className="mt-4 bg-error/10 border border-error/20 rounded-xl p-4 text-xs text-error font-medium leading-relaxed">
                <span className="font-bold block mb-1">PROCTORING RESTRICTIONS:</span>
                Clipboard Copy (Ctrl+C), Paste (Ctrl+V), DevTools (F12), and Fullscreen Exit (ESC) are logged as violations.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MOBILE WARNING ══ */}
      <div className="md:hidden fixed inset-0 z-[100] bg-bg flex flex-col items-center justify-center p-6 text-center">
        <Smartphone size={32} className="text-primary mb-4" />
        <h2 className="text-2xl font-black text-text mb-3">Desktop Required</h2>
        <p className="text-text-secondary mb-6 text-sm">The Interview Arena requires a desktop monitor for live query execution.</p>
        <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
      </div>

      {/* ══ MAIN LAYOUT ══ */}
      <div className={`w-full h-screen bg-bg flex flex-col select-none overflow-hidden ${isTerminated ? 'blur-md pointer-events-none' : ''}`}>

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-surface shadow-sm shrink-0">
          {/* Left: company + proctored tag */}
          <div className="flex items-center gap-3">
            <h1 className="font-black text-base tracking-tight text-text">{companyName}</h1>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-error/10 text-error border border-error/20 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert size={11} /> Proctored
            </span>
          </div>

          {/* Center: Question Progress */}
          <div className="flex items-center gap-3 max-w-md w-full mx-6">
            <span className="text-xs font-bold text-text-secondary whitespace-nowrap">
              Q{currentIndex + 1} of {totalQuestions}
            </span>
            <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden border border-border/40">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-text whitespace-nowrap">
              {answeredCount}/{totalQuestions} Answered
            </span>
          </div>

          {/* Right: Timer & Actions */}
          <div className="flex items-center gap-3">
            <div className={`font-mono font-black text-sm px-3 py-1 rounded-lg bg-surface-2 border border-border flex items-center gap-1.5 ${timeColor}`}>
              <Clock size={15} /> {formatTime(timeLeft)}
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-surface-2 text-text-secondary hover:text-text transition-colors"
              title="Toggle theme"
            >
              {settings.darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 rounded-lg hover:bg-surface-2 text-text-secondary hover:text-text transition-colors"
              title="Shortcuts"
            >
              <Keyboard size={16} />
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleFinalSubmit(false)}
              className="font-bold text-xs shadow-sm"
            >
              Submit All
            </Button>
          </div>
        </header>

        {/* ── BODY ──────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── QUESTION NAVIGATOR (LEFT SIDEBAR) ──────────────────────────── */}
          <aside className="w-14 shrink-0 bg-surface border-r border-border hidden lg:flex flex-col items-center py-3.5 gap-2 overflow-y-auto custom-scrollbar">
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

          {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
          {generating ? (
            /* Loading State */
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-10 bg-bg">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-surface-3 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database size={26} className="text-primary" />
                </div>
              </div>
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-black text-text mb-2">Generating Interview Environment</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  AI is creating 5 custom SQL questions + 5 MCQs with live SQLite databases and sample datasets...
                </p>
                <div className="mt-5 flex items-center justify-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : isMCQ ? (
            /* ── MCQ Full-Width Panel ───────────────────────────────────────── */
            <div className="flex-1 flex flex-col overflow-hidden bg-bg">
              <div className="px-6 py-3 border-b border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks size={16} className="text-primary" />
                  <span className="text-xs font-bold text-text">MCQ Question {(mcqIndex ?? 0) + 1} of 5</span>
                </div>
                <span className="text-xs font-bold text-text-secondary bg-surface-2 px-2.5 py-1 rounded-lg border border-border">
                  Score Weight: 4 pts each
                </span>
              </div>

              {currentQuestion && (
                <McqCard
                  question={currentQuestion}
                  mcqIndex={mcqIndex}
                  savedAnswer={answers[currentIndex]}
                  onAnswer={(ans) => saveAnswer(ans)}
                />
              )}

              {/* Navigation Footer */}
              <footer className="px-6 py-3.5 border-t border-border bg-surface flex justify-between items-center shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="font-semibold text-xs text-text-secondary"
                >
                  <ChevronLeft size={16} /> Previous
                </Button>

                {currentIndex < totalQuestions - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={goNext}
                    className="font-bold text-xs px-5 shadow-sm"
                  >
                    Next Question <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleFinalSubmit(false)}
                    className="font-bold text-xs px-5 shadow-sm bg-success text-white hover:bg-success/90"
                  >
                    <CheckCircle2 size={16} /> Submit Interview
                  </Button>
                )}
              </footer>
            </div>
          ) : (
            /* ── SQL 3-Pane Split Arena ─────────────────────────────────────── */
            <div className="flex-1 flex overflow-hidden">

              {/* LEFT COLUMN: Problem Details / Schema / AI Chat */}
              <div className="w-[42%] min-w-[340px] max-w-[540px] border-r border-border flex flex-col bg-surface-2">
                {/* Tabs */}
                <div className="flex bg-surface border-b border-border px-3 pt-2 gap-1 shrink-0">
                  {[
                    { id: 'problem', icon: FileText, label: 'Problem & Tables' },
                    { id: 'schema',  icon: Database,  label: 'Schema Info' },
                    { id: 'chat',    icon: MessageSquare, label: 'AI Interviewer' },
                  ].map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setLeftPanel(id)}
                      className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        leftPanel === id
                          ? 'bg-surface-2 text-text border border-border border-b-transparent shadow-sm'
                          : 'bg-transparent text-text-secondary hover:bg-surface-2/60 hover:text-text'
                      }`}
                    >
                      <Icon size={13} className={leftPanel === id ? 'text-primary' : ''} /> {label}
                    </button>
                  ))}
                </div>

                {/* Tab: Problem Details */}
                {leftPanel === 'problem' && currentQuestion && (
                  <ProblemDetailView
                    question={currentQuestion}
                    sqlIndex={sqlIndex}
                    difficulty={difficulty}
                    dbSwitching={dbSwitching}
                  />
                )}

                {/* Tab: Schema info */}
                {leftPanel === 'schema' && (
                  <SchemaPanel question={currentQuestion} dbStatus={dbSwitching ? 'loading' : dbStatus} />
                )}

                {/* Tab: AI Chat */}
                {leftPanel === 'chat' && (
                  <div className="flex-1 flex flex-col overflow-hidden bg-surface-2">
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-surface-3 text-text-secondary border border-border'
                            }`}
                          >
                            {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                          </div>
                          <div
                            className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-none font-medium'
                                : 'bg-surface border border-border text-text rounded-tl-none shadow-sm'
                            }`}
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                      {isChatLoading && (
                        <div className="flex gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center">
                            <Bot size={13} className="text-text-secondary" />
                          </div>
                          <div className="bg-surface border border-border rounded-2xl rounded-tl-none p-3 shadow-sm">
                            <Loader2 size={13} className="animate-spin text-text-secondary" />
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
                          placeholder="Ask the interviewer for hints or clarifications..."
                          disabled={isChatLoading || isTerminated}
                          className="flex-1 bg-surface-2 border border-border rounded-xl px-3.5 py-2 text-xs text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={!chatInput.trim() || isChatLoading}
                          className="font-bold text-xs px-4"
                        >
                          Send
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: SQL Editor + Live Results Panel */}
              <div className="flex-1 flex flex-col overflow-hidden bg-bg">

                {/* Editor Header Toolbar */}
                <div className="flex items-center justify-between px-3 pt-2 border-b border-border bg-surface shrink-0">
                  {/* Mode Tabs */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveTab('sql')}
                      className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        activeTab === 'sql'
                          ? 'bg-bg text-text border border-border border-b-transparent shadow-sm'
                          : 'bg-transparent text-text-secondary hover:bg-surface-2/60 hover:text-text'
                      }`}
                    >
                      <Code2 size={13} className={activeTab === 'sql' ? 'text-primary' : ''} /> Solution (Graded)
                    </button>
                    <button
                      onClick={() => setActiveTab('scratch')}
                      className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        activeTab === 'scratch'
                          ? 'bg-bg text-text border border-border border-b-transparent shadow-sm'
                          : 'bg-transparent text-text-secondary hover:bg-surface-2/60 hover:text-text'
                      }`}
                    >
                      <FileText size={13} className={activeTab === 'scratch' ? 'text-primary' : ''} /> Scratchpad (Sandbox)
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pb-1.5">
                    {answers[currentIndex]?.sql && (
                      <span className="text-[10px] font-bold text-success border border-success/30 bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle size={10} /> Auto-Saved
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setSqlCode(`-- Write your SQL solution for Q${currentIndex + 1} below\n\n`);
                        setQueryResult(null);
                      }}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-surface-2 transition-colors"
                      title="Reset code"
                    >
                      <RotateCcw size={13} />
                    </button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleRunSql}
                      disabled={isRunning || dbSwitching}
                      className="font-bold text-xs px-4 shadow-sm"
                    >
                      {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                      {isRunning ? 'Running...' : 'Run SQL'}
                    </Button>
                  </div>
                </div>

                {/* Sub-header Banner */}
                <div className="px-4 py-1.5 bg-surface-2 border-b border-border flex items-center justify-between text-[11px] text-text-secondary shrink-0">
                  <span>
                    {activeTab === 'sql'
                      ? '✍️ Final Solution — this query is auto-saved and evaluated for your score.'
                      : '🧪 Scratchpad — test intermediate queries freely without affecting submission.'}
                  </span>
                  <span className="font-mono text-[10px] opacity-70">
                    Ctrl + Enter to Run
                  </span>
                </div>

                {/* SQL Editor Area */}
                <div className="flex-1 overflow-hidden" style={{ minHeight: '180px' }}>
                  <SqlEditor
                    value={activeTab === 'sql' ? sqlCode : scratchpad}
                    onChange={activeTab === 'sql' ? handleSqlChange : setScratchpad}
                    onRun={handleRunSql}
                    darkMode={settings.darkMode}
                    fontSize={settings.fontSize}
                    readOnly={isTerminated}
                  />
                </div>

                {/* Results Panel */}
                <div className="h-56 border-t border-border shrink-0 overflow-hidden bg-surface">
                  <ResultsPanel
                    result={queryResult}
                    isRunning={isRunning}
                    sql={activeTab === 'sql' ? sqlCode : scratchpad}
                    executeQuery={executeQuery}
                  />
                </div>

                {/* Footer Navigation */}
                <footer className="px-4 py-3 border-t border-border bg-surface flex justify-between items-center shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="font-semibold text-xs text-text-secondary"
                  >
                    <ChevronLeft size={16} /> Previous
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleSaveCurrentSql();
                      goNext();
                    }}
                    className="font-bold text-xs px-5 shadow-sm"
                  >
                    Save & Next Question <ChevronRight size={16} />
                  </Button>
                </footer>
              </div>
            </div>
          )}
        </div>

        {/* Draggable Live Proctoring Feed */}
        <DraggableProctorFeed cameraStream={cameraStream} screenStream={screenStream} />
      </div>
    </>
  );
}
