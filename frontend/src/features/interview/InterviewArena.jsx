import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bot, User, Loader2, ShieldAlert, Clock, Smartphone, AlertOctagon,
  Keyboard, X, CheckCircle2, Sun, Moon, Play, RotateCcw, Database,
  ChevronLeft, ChevronRight, Code2, MessageSquare, FileText, CheckCircle,
  Table, Check, Info, AlertCircle, GripHorizontal, Minimize2,
  Maximize2, Copy, Bookmark, ChevronDown, ListChecks,
  Terminal, Layers
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
import { formatTime, compareQueryResult } from './utils/interviewUtils';

// ─── Copyable Table Name Button ───────────────────────────────────────────────

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

// ─── Problem Detail View ──────────────────────────────────────────────────────

function ProblemDetailView({ question, sqlIndex, difficulty, dbSwitching }) {
  if (!question) return null;

  return (
    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
      {/* Header Tag */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
            SQL Challenge {(sqlIndex ?? 0) + 1} of 5
          </span>
          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-surface-3 text-text-secondary border border-border capitalize">
            {difficulty}
          </span>
        </div>
        {dbSwitching && (
          <span className="text-xs text-primary font-semibold animate-pulse flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> Switching DB...
          </span>
        )}
      </div>

      {/* 1. Problem Statement */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
          <FileText size={14} className="text-primary" /> Business Problem
        </h3>
        <div className="text-sm font-semibold text-text leading-relaxed bg-surface border border-border rounded-xl p-4 shadow-sm">
          {question.problemStatement}
        </div>
      </div>

      {/* 2. Context & Logic */}
      {question.explanation && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
            <Info size={14} className="text-primary" /> Context & Data Relationships
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
            <AlertCircle size={14} className="text-warning" /> Constraints & Edge Cases
          </h3>
          <div className="text-xs text-text-secondary bg-warning/5 border border-warning/20 rounded-xl p-3.5 leading-relaxed">
            {question.constraints}
          </div>
        </div>
      )}

      {/* 4. Expected Output Preview */}
      {question.expectedOutput && question.expectedOutput.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-success mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Expected Output Sample
          </h3>
          <div className="bg-surface rounded-xl border border-success/30 overflow-hidden shadow-sm">
            <div className="px-3.5 py-2 bg-success/10 border-b border-success/20 text-xs font-bold text-success flex items-center justify-between">
              <span>Sample Rows Expected</span>
              <span className="text-[10px] opacity-80 font-normal">Matching format</span>
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

// ─── Schema Panel ─────────────────────────────────────────────────────────────

function SchemaPanel({ question, dbStatus }) {
  if (!question) return <div className="p-4 text-xs text-text-secondary">No schema loaded.</div>;
  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
      {/* DB status banner */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border">
        <div className="flex items-center gap-2">
          <Database size={14} className="text-primary" />
          <span className="text-xs font-bold text-text">Live SQLite Database</span>
        </div>
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
          dbStatus === 'ready' ? 'bg-success/10 text-success border border-success/30' :
          dbStatus === 'loading' ? 'bg-primary/10 text-primary border border-primary/30 animate-pulse' :
          'bg-surface-3 text-text-secondary border border-border'
        }`}>
          {dbStatus === 'ready' ? '● Ready' : dbStatus === 'loading' ? '● Loading' : dbStatus.toUpperCase()}
        </span>
      </div>

      {question.tables?.map((table) => {
        const sampleRows = (table.sampleData || []).slice(0, 5);
        const cols = table.columns?.map(c => (typeof c === 'string' ? c : c.name)) || (sampleRows[0] ? Object.keys(sampleRows[0]) : []);

        return (
          <div key={table.name} className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="px-3 py-2 bg-surface-2 border-b border-border flex items-center justify-between">
              <CopyableTableName name={table.name} />
              <span className="text-[10px] text-text-secondary font-medium">
                {table.sampleData?.length ?? 0} sample rows
              </span>
            </div>

            {/* Column definitions */}
            <div className="divide-y divide-border border-b border-border">
              {table.columns?.map((col, i) => {
                const colName = typeof col === 'string' ? col : col.name;
                const colType = typeof col === 'object' && col.type ? col.type : 'TEXT';
                return (
                  <div key={i} className="px-3 py-1.5 flex justify-between items-center text-xs hover:bg-surface-2/50 transition-colors">
                    <span className="font-mono text-text font-medium">{colName}</span>
                    <span className="text-[10px] font-mono text-text-secondary uppercase px-1.5 py-0.5 rounded bg-surface-3 border border-border/50">
                      {colType}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Sample Table Preview */}
            {sampleRows.length > 0 && (
              <div className="overflow-x-auto custom-scrollbar p-2 bg-surface/50">
                <table className="w-full text-[11px] text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-border text-text-secondary">
                      {cols.map((c, ci) => (
                        <th key={ci} className="py-1 px-2 font-semibold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {sampleRows.map((row, ri) => (
                      <tr key={ri} className="hover:bg-surface-2/40">
                        {cols.map((c, ci) => (
                          <td key={ci} className="py-1 px-2 text-text whitespace-nowrap">
                            {row[c] !== undefined && row[c] !== null ? String(row[c]) : <span className="opacity-40 italic">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MCQ Question Card ────────────────────────────────────────────────────────

function McqCard({ question, mcqIndex, savedAnswer, onAnswer }) {
  const [selected, setSelected] = useState(savedAnswer?.selectedIndex ?? null);

  useEffect(() => {
    setSelected(savedAnswer?.selectedIndex ?? null);
  }, [mcqIndex, savedAnswer]);

  const handleSelect = (i) => {
    setSelected(i);
    onAnswer({ selectedIndex: i });
  };

  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Question tag */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
            Q{mcqIndex + 6}
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary">Conceptual SQL MCQ</p>
            <p className="text-xs text-text-secondary">Select the single correct answer · 4 points</p>
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
            let optClasses = 'border-border bg-surface hover:border-primary/50 text-text hover:bg-surface-2 cursor-pointer';
            if (isSelected) {
              optClasses = 'border-primary bg-primary/10 text-primary shadow-sm font-semibold';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full flex items-center gap-3.5 p-4 rounded-xl border-2 transition-all duration-150 text-left ${optClasses}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-surface-2 text-text-secondary'
                  }`}
                >
                  {labels[i]}
                </div>
                <span className="text-sm font-medium leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>
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
      setPos((p) => ({
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
            onClick={() => setIsMinimized((prev) => !prev)}
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

// ─── Submit Confirmation Modal ────────────────────────────────────────────────

function SubmitConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  sqlAnsweredCount,
  mcqAnsweredCount,
  flaggedCount,
  timeLeft,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-border bg-surface-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="font-black text-base text-text">Finish & Submit Assessment?</h3>
              <p className="text-xs text-text-secondary">Review your progress before final evaluation</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text p-1 rounded-lg hover:bg-surface-3 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-2 border border-border rounded-xl p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">SQL Coding</span>
              <p className="text-xl font-black text-text mt-0.5">{sqlAnsweredCount} <span className="text-xs text-text-secondary font-medium">/ 5 answered</span></p>
            </div>
            <div className="bg-surface-2 border border-border rounded-xl p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">MCQ Concepts</span>
              <p className="text-xl font-black text-text mt-0.5">{mcqAnsweredCount} <span className="text-xs text-text-secondary font-medium">/ 5 answered</span></p>
            </div>
          </div>

          {flaggedCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20 text-xs text-warning font-semibold">
              <Bookmark size={14} className="fill-warning" />
              <span>You have {flaggedCount} question{flaggedCount !== 1 ? 's' : ''} marked for review.</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-surface-2 border border-border text-xs text-text-secondary leading-relaxed">
            Time remaining: <span className="font-mono font-bold text-text">{formatTime(timeLeft)}</span>.
            Once submitted, your solutions will be graded by the AI interviewer and your final scorecard will be generated.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="md" onClick={onClose} className="font-semibold text-xs">
              Keep Working
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={onConfirm}
              className="font-bold text-xs bg-success hover:bg-success/90 text-white shadow-md shadow-success/20 px-5"
            >
              <CheckCircle2 size={15} /> Yes, Submit Assessment
            </Button>
          </div>
        </div>
      </div>
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

  // ── Local UI State ──────────────────────────────────────────────────────────
  const [sqlCode, setSqlCode]                 = useState('-- Write your SQL solution below\n\n');
  const [scratchpadSql, setScratchpadSql]     = useState('-- Sandbox for quick exploratory queries\nSELECT * FROM \nLIMIT 5;\n');
  const [queryResult, setQueryResult]         = useState(null);
  const [scratchResult, setScratchResult]     = useState(null);
  const [isRunning, setIsRunning]             = useState(false);
  const [isScratchRunning, setIsScratchRunning] = useState(false);
  const [executionTimeMs, setExecutionTimeMs] = useState(null);

  const [leftPanel, setLeftPanel]             = useState('problem'); // 'problem' | 'schema' | 'chat'
  const [consoleTab, setConsoleTab]           = useState('result');  // 'result' | 'input' | 'sandbox'
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [outputViewMode, setOutputViewMode]   = useState('yours');   // 'yours' | 'expected'

  const [leftPaneW, setLeftPaneW]             = useState(42); // percentage width
  const [consoleHeightPct, setConsoleHeightPct] = useState(42); // percentage height of right pane
  const [isResizingH, setIsResizingH]         = useState(false);
  const [isResizingV, setIsResizingV]         = useState(false);

  const [flagged, setFlagged]                 = useState({});
  const [showQuestionDrawer, setShowQuestionDrawer] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showShortcuts, setShowShortcuts]     = useState(false);
  const [chatInput, setChatInput]             = useState('');
  const [isChatLoading, setIsChatLoading]     = useState(false);

  const arenaRef = useRef(null);
  const rightPaneRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ── Session ─────────────────────────────────────────────────────────────────
  const handleFinalSubmit = async (_isTimeUp = false) => {
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
    setOutputViewMode('yours');
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

  const toggleFlag = (idx) => {
    setFlagged((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // ── Validation result computation ───────────────────────────────────────────
  const validation = useMemo(() => {
    return compareQueryResult(queryResult, currentQuestion?.expectedOutput);
  }, [queryResult, currentQuestion?.expectedOutput]);

  // ── Run Graded SQL Query ────────────────────────────────────────────────────
  const handleRunSql = async () => {
    const trimmed = sqlCode.trim();
    if (!trimmed) {
      toast({ title: 'No SQL Query', message: 'Type a SQL query to execute.', type: 'info' });
      return;
    }

    setIsRunning(true);
    setConsoleCollapsed(false);
    setConsoleTab('result');
    const start = performance.now();
    try {
      const res = await executeQuery(trimmed);
      const elapsed = Math.max(1, Math.round(performance.now() - start));
      setExecutionTimeMs(elapsed);
      setQueryResult(res);
      if (!isMCQ) {
        saveAnswer({ sql: sqlCode, queryResult: res });
      }
    } catch (err) {
      const elapsed = Math.max(1, Math.round(performance.now() - start));
      setExecutionTimeMs(elapsed);
      setQueryResult({ columns: [], rows: [], error: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  // ── Run Sandbox Scratchpad Query ────────────────────────────────────────────
  const handleRunScratch = async () => {
    const trimmed = scratchpadSql.trim();
    if (!trimmed) return;
    setIsScratchRunning(true);
    try {
      const res = await executeQuery(trimmed);
      setScratchResult(res);
    } catch (err) {
      setScratchResult({ columns: [], rows: [], error: err.message });
    } finally {
      setIsScratchRunning(false);
    }
  };

  // ── Resizing Handlers ───────────────────────────────────────────────────────
  const handleStartResizeH = (e) => {
    e.preventDefault();
    setIsResizingH(true);
  };

  const handleStartResizeV = (e) => {
    e.preventDefault();
    setIsResizingV(true);
  };

  useEffect(() => {
    const onMove = (e) => {
      if (isResizingH && arenaRef.current) {
        const rect = arenaRef.current.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        setLeftPaneW(Math.max(25, Math.min(65, pct)));
      }
      if (isResizingV && rightPaneRef.current) {
        const rect = rightPaneRef.current.getBoundingClientRect();
        const pct = ((rect.bottom - e.clientY) / rect.height) * 100;
        setConsoleHeightPct(Math.max(15, Math.min(75, pct)));
      }
    };

    const onUp = () => {
      setIsResizingH(false);
      setIsResizingV(false);
    };

    if (isResizingH || isResizingV) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.body.style.userSelect = 'none';
      if (isResizingH) document.body.style.cursor = 'col-resize';
      if (isResizingV) document.body.style.cursor = 'row-resize';
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isResizingH, isResizingV]);

  // ── AI Chat ─────────────────────────────────────────────────────────────────
  const handleSendChat = async (textToSend) => {
    const msg = typeof textToSend === 'string' ? textToSend : chatInput;
    if (!msg.trim() || isChatLoading || isTerminated) return;
    const userMsg = msg.trim();
    setChatInput('');
    const newMsgs = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(newMsgs);
    setIsChatLoading(true);
    try {
      const contextTask = currentQuestion
        ? `${currentQuestion.problemStatement ?? ''}`
        : 'General SQL interview';
      const res = await chatInterview({ companyName, initialTask: contextTask, messages: newMsgs });
      setChatMessages((prev) => [...prev, { role: 'assistant', content: res }]);
    } catch (err) {
      if (err.message === 'MISSING_API_KEY') {
        toast({ title: 'Missing API Key', message: 'Add your Groq API key in Settings.', type: 'error' });
      } else {
        setChatMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Network error. Please try again.' }]);
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  // ── Violation Report ────────────────────────────────────────────────────────
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

  // ── Global Shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && !isMCQ) {
        e.preventDefault();
        handleRunSql();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMCQ, sqlCode, dbStatus, dbSwitching]);

  // ── Header metrics ──────────────────────────────────────────────────────────
  const timeColor = timeLeft <= 300 ? 'text-error' : timeLeft <= 600 ? 'text-warning' : 'text-success';
  const answeredCount = answers.filter((a) => a !== null).length;
  const sqlAnsweredCount = answers.slice(0, 5).filter((a) => a !== null).length;
  const mcqAnsweredCount = answers.slice(5, 10).filter((a) => a !== null).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;

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

      {/* ══ SUBMIT CONFIRMATION MODAL ══ */}
      <SubmitConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={() => {
          setShowSubmitModal(false);
          handleFinalSubmit(false);
        }}
        sqlAnsweredCount={sqlAnsweredCount}
        mcqAnsweredCount={mcqAnsweredCount}
        flaggedCount={flaggedCount}
        timeLeft={timeLeft}
      />

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

      {/* ══ MAIN INTERVIEW ARENA LAYOUT ══ */}
      <div className={`w-full h-screen bg-bg flex flex-col select-none overflow-hidden ${isTerminated ? 'blur-md pointer-events-none' : ''}`}>

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface shrink-0 z-30">
          {/* Left: Assessment Brand & Proctoring */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm md:text-base tracking-tight text-text">{companyName} Technical Assessment</h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/20 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert size={11} /> Proctored
              </span>
            </div>
          </div>

          {/* Center: Question Breadcrumbs & Quick Navigator */}
          <div className="relative">
            <button
              onClick={() => setShowQuestionDrawer((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-xs font-bold text-text transition-colors cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>
                Q{currentIndex + 1} of {totalQuestions}: {isMCQ ? `Conceptual MCQ ${mcqIndex + 1}` : `SQL Challenge ${sqlIndex + 1}`}
              </span>
              <ChevronDown size={13} className={`opacity-60 transition-transform ${showQuestionDrawer ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Grid */}
            {showQuestionDrawer && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowQuestionDrawer(false)} />
                <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50 w-80 bg-surface border border-border rounded-2xl shadow-2xl p-4 animate-scale-in">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-border">
                    <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Questions Overview</span>
                    <span className="text-[11px] font-bold text-primary">{answeredCount}/{totalQuestions} Answered</span>
                  </div>

                  {/* SQL section */}
                  <div className="mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">SQL Challenges (16 pts each)</p>
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 5 }, (_, i) => {
                        const isAns = answers[i] !== null;
                        const isCur = currentIndex === i;
                        const isFlg = flagged[i];
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              navigateTo(i);
                              setShowQuestionDrawer(false);
                            }}
                            className={`h-9 rounded-xl border text-xs font-bold flex flex-col items-center justify-center relative transition-all ${
                              isCur
                                ? 'bg-primary text-primary-foreground border-primary shadow'
                                : isAns
                                ? 'bg-success/15 text-success border-success/30 hover:bg-success/25'
                                : 'bg-surface-2 text-text-secondary border-border hover:bg-surface-3'
                            }`}
                          >
                            <span>Q{i + 1}</span>
                            {isFlg && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warning" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* MCQ section */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-2">Conceptual MCQs (4 pts each)</p>
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 5 }, (_, i) => {
                        const idx = i + 5;
                        const isAns = answers[idx] !== null;
                        const isCur = currentIndex === idx;
                        const isFlg = flagged[idx];
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              navigateTo(idx);
                              setShowQuestionDrawer(false);
                            }}
                            className={`h-9 rounded-xl border text-xs font-bold flex flex-col items-center justify-center relative transition-all ${
                              isCur
                                ? 'bg-primary text-primary-foreground border-primary shadow'
                                : isAns
                                ? 'bg-success/15 text-success border-success/30 hover:bg-success/25'
                                : 'bg-surface-2 text-text-secondary border-border hover:bg-surface-3'
                            }`}
                          >
                            <span>Q{idx + 1}</span>
                            {isFlg && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-warning" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Timer, Shortcuts & Submit */}
          <div className="flex items-center gap-2.5">
            {/* Flag button */}
            <button
              onClick={() => toggleFlag(currentIndex)}
              className={`p-1.5 rounded-lg border transition-colors ${
                flagged[currentIndex]
                  ? 'bg-warning/15 text-warning border-warning/40'
                  : 'bg-surface border-border text-text-secondary hover:text-text hover:bg-surface-2'
              }`}
              title={flagged[currentIndex] ? 'Marked for review' : 'Mark for review'}
            >
              <Bookmark size={15} className={flagged[currentIndex] ? 'fill-warning' : ''} />
            </button>

            {/* Timer */}
            <div className={`font-mono font-black text-xs md:text-sm px-3 py-1.5 rounded-xl bg-surface-2 border border-border flex items-center gap-1.5 ${timeColor}`}>
              <Clock size={14} /> {formatTime(timeLeft)}
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary hover:text-text transition-colors"
              title="Toggle theme"
            >
              {settings.darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={() => setShowShortcuts(true)}
              className="p-1.5 rounded-lg hover:bg-surface-2 text-text-secondary hover:text-text transition-colors"
              title="Shortcuts"
            >
              <Keyboard size={15} />
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSubmitModal(true)}
              className="font-bold text-xs bg-success hover:bg-success/90 text-white shadow-sm shadow-success/20 px-4"
            >
              Submit Test
            </Button>
          </div>
        </header>

        {/* ── BODY ──────────────────────────────────────────────────────────── */}
        <div ref={arenaRef} className="flex flex-1 overflow-hidden relative">

          {generating ? (
            /* Generating Screen */
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
                  Building 5 SQL challenges with dedicated SQLite schemas + 5 conceptual MCQs...
                </p>
                <div className="mt-5 flex items-center justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : isMCQ ? (
            /* ── MCQ Screen ─────────────────────────────────────────────────── */
            <div className="flex-1 flex flex-col overflow-hidden bg-bg">
              <div className="px-6 py-3 border-b border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListChecks size={16} className="text-primary" />
                  <span className="text-xs font-bold text-text">MCQ Question {(mcqIndex ?? 0) + 1} of 5</span>
                </div>
                <span className="text-xs font-bold text-text-secondary bg-surface-2 px-2.5 py-1 rounded-lg border border-border">
                  Score Weight: 4 pts
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
                  <ChevronLeft size={16} /> Previous Question
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
                    onClick={() => setShowSubmitModal(true)}
                    className="font-bold text-xs px-5 shadow-sm bg-success text-white hover:bg-success/90"
                  >
                    <CheckCircle2 size={16} /> Finish Assessment
                  </Button>
                )}
              </footer>
            </div>
          ) : (
            /* ── SQL 2-Pane Arena (Modern IDE Layout) ────────────────────────── */
            <div className="flex-1 flex overflow-hidden w-full">

              {/* LEFT PANE: Problem Description / Schema / AI Interviewer */}
              <div
                style={{ width: `${leftPaneW}%` }}
                className="shrink-0 border-r border-border flex flex-col bg-surface-2 overflow-hidden min-w-[300px] max-w-[800px]"
              >
                {/* Tabs */}
                <div className="flex bg-surface border-b border-border px-3 pt-2 gap-1 shrink-0">
                  {[
                    { id: 'problem', icon: FileText, label: 'Problem' },
                    { id: 'schema',  icon: Database,  label: 'Tables & Schema' },
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

                {/* Tab: Problem Description */}
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
                    {/* Prompt suggestions chip bar */}
                    <div className="p-2.5 bg-surface border-b border-border flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                      {[
                        '💡 Give me a subtle hint',
                        '❓ Clarify constraints',
                        '🔍 Check my approach',
                        '📊 Explain table relations',
                      ].map((prompt, pi) => (
                        <button
                          key={pi}
                          disabled={isChatLoading || isTerminated}
                          onClick={() => handleSendChat(prompt)}
                          className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-surface-2 hover:bg-surface-3 border border-border text-text-secondary hover:text-text transition-colors cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

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
                            className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
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

                    <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="p-3 border-t border-border bg-surface">
                      <div className="flex gap-2">
                        <input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
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

              {/* DRAGGABLE HORIZONTAL SPLITTER */}
              <div
                onMouseDown={handleStartResizeH}
                className="w-1.5 hover:w-2 bg-border hover:bg-primary/50 cursor-col-resize transition-all z-20 shrink-0 select-none"
                title="Drag to resize columns"
              />

              {/* RIGHT PANE: Code Editor & Execution Test Suite */}
              <div ref={rightPaneRef} className="flex-1 flex flex-col overflow-hidden bg-bg">

                {/* Editor Header Toolbar */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-surface shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-text bg-surface-2 border border-border px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <Code2 size={12} className="text-primary" /> SQLite Solution
                    </span>
                    {answers[currentIndex]?.sql && (
                      <span className="text-[10px] font-bold text-success border border-success/30 bg-success/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle size={10} /> Auto-Saved
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
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
                      {isRunning ? 'Running...' : 'Run Code'}
                    </Button>
                  </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-hidden min-h-[160px]">
                  <SqlEditor
                    value={sqlCode}
                    onChange={handleSqlChange}
                    onRun={handleRunSql}
                    darkMode={settings.darkMode}
                    fontSize={settings.fontSize}
                    readOnly={isTerminated}
                  />
                </div>

                {/* DRAGGABLE VERTICAL SPLITTER */}
                {!consoleCollapsed && (
                  <div
                    onMouseDown={handleStartResizeV}
                    className="h-1.5 hover:h-2 bg-border hover:bg-primary/50 cursor-row-resize transition-all z-20 shrink-0 select-none"
                    title="Drag to resize test console"
                  />
                )}

                {/* ── TEST CONSOLE / RESULTS PANEL ───────────────────────────── */}
                <div
                  style={consoleCollapsed ? { height: '36px' } : { height: `${consoleHeightPct}%`, minHeight: '180px', maxHeight: '80%' }}
                  className="border-t border-border bg-surface flex flex-col shrink-0 overflow-hidden transition-[height] duration-150"
                >
                  {/* Console Header Tabs */}
                  <div className="flex items-center justify-between px-3 py-1 bg-surface-2 border-b border-border shrink-0">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setConsoleCollapsed(false);
                          setConsoleTab('result');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          consoleTab === 'result' && !consoleCollapsed
                            ? 'bg-surface text-text border border-border shadow-sm'
                            : 'text-text-secondary hover:text-text hover:bg-surface-3'
                        }`}
                      >
                        <Terminal size={12} className={consoleTab === 'result' ? 'text-primary' : ''} />
                        <span>Test Result</span>
                        {validation.status === 'accepted' && (
                          <span className="w-2 h-2 rounded-full bg-success" />
                        )}
                        {validation.status === 'wrong_answer' && (
                          <span className="w-2 h-2 rounded-full bg-warning" />
                        )}
                        {validation.status === 'error' && (
                          <span className="w-2 h-2 rounded-full bg-error" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setConsoleCollapsed(false);
                          setConsoleTab('input');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          consoleTab === 'input' && !consoleCollapsed
                            ? 'bg-surface text-text border border-border shadow-sm'
                            : 'text-text-secondary hover:text-text hover:bg-surface-3'
                        }`}
                      >
                        <Table size={12} />
                        <span>Input Tables</span>
                      </button>

                      <button
                        onClick={() => {
                          setConsoleCollapsed(false);
                          setConsoleTab('sandbox');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          consoleTab === 'sandbox' && !consoleCollapsed
                            ? 'bg-surface text-text border border-border shadow-sm'
                            : 'text-text-secondary hover:text-text hover:bg-surface-3'
                        }`}
                      >
                        <Layers size={12} />
                        <span>Query Sandbox</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-text-secondary opacity-70 hidden sm:inline">
                        Ctrl + Enter to Run
                      </span>
                      <button
                        onClick={() => setConsoleCollapsed((v) => !v)}
                        className="p-1 rounded-lg hover:bg-surface-3 text-text-secondary hover:text-text transition-colors cursor-pointer text-xs flex items-center gap-1"
                        title={consoleCollapsed ? 'Expand Test Console' : 'Collapse Test Console'}
                      >
                        {consoleCollapsed ? 'Expand' : 'Collapse'}
                      </button>
                    </div>
                  </div>

                  {/* Console Body */}
                  {!consoleCollapsed && (
                    <div className="flex-1 overflow-hidden flex flex-col p-3 bg-surface">

                      {/* Tab 1: Test Result */}
                      {consoleTab === 'result' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                          {/* Status Verdict Banner */}
                          {validation.status !== 'idle' && (
                            <div className="mb-2 shrink-0 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                {validation.status === 'accepted' && (
                                  <span className="px-3 py-1 rounded-lg bg-success/15 border border-success/30 text-success text-xs font-black flex items-center gap-1.5">
                                    <CheckCircle2 size={14} /> Accepted
                                  </span>
                                )}
                                {validation.status === 'wrong_answer' && (
                                  <span className="px-3 py-1 rounded-lg bg-warning/15 border border-warning/30 text-warning text-xs font-black flex items-center gap-1.5">
                                    <AlertCircle size={14} /> Wrong Answer
                                  </span>
                                )}
                                {validation.status === 'error' && (
                                  <span className="px-3 py-1 rounded-lg bg-error/15 border border-error/30 text-error text-xs font-black flex items-center gap-1.5">
                                    <AlertOctagon size={14} /> Runtime Error
                                  </span>
                                )}
                                <span className="text-xs text-text-secondary font-medium">
                                  {validation.message}
                                </span>
                              </div>

                              {executionTimeMs !== null && (
                                <span className="text-[10px] font-mono text-text-secondary bg-surface-2 px-2 py-0.5 rounded border border-border">
                                  Runtime: {executionTimeMs}ms
                                </span>
                              )}
                            </div>
                          )}

                          {/* Output Table or Empty State */}
                          {validation.status === 'idle' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-secondary">
                              <Terminal size={28} className="text-primary/50 mb-2" />
                              <p className="text-xs font-bold text-text">No execution output yet</p>
                              <p className="text-[11px] text-text-secondary mt-1">
                                Click <strong className="text-primary">Run Code</strong> (or press <kbd className="font-mono bg-surface-2 px-1 rounded">Ctrl + Enter</kbd>) to test your query against the live SQLite tables.
                              </p>
                            </div>
                          ) : validation.status === 'error' ? (
                            <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-error/5 border border-error/20 font-mono text-xs text-error">
                              {validation.message}
                            </div>
                          ) : (
                            /* Comparison / Table output */
                            <div className="flex-1 flex flex-col overflow-hidden">
                              {/* Toggle: Your Output vs Expected Output */}
                              {currentQuestion?.expectedOutput?.length > 0 && (
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border shrink-0">
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setOutputViewMode('yours')}
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                                        outputViewMode === 'yours'
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-surface-2 text-text-secondary hover:text-text'
                                      }`}
                                    >
                                      Your Output ({validation.userRows?.length ?? 0} rows)
                                    </button>
                                    <button
                                      onClick={() => setOutputViewMode('expected')}
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                                        outputViewMode === 'expected'
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-surface-2 text-text-secondary hover:text-text'
                                      }`}
                                    >
                                      Expected Output ({validation.expectedRows?.length ?? 0} rows)
                                    </button>
                                  </div>

                                  <span className="text-[10px] text-text-secondary font-mono">
                                    Cols: {outputViewMode === 'yours' ? validation.userCols.join(', ') : validation.expectedCols.join(', ')}
                                  </span>
                                </div>
                              )}

                              {/* Table Content */}
                              <div className="flex-1 overflow-auto custom-scrollbar border border-border rounded-xl">
                                {outputViewMode === 'yours' ? (
                                  validation.userRows.length > 0 ? (
                                    <table className="w-full text-xs text-left border-collapse font-mono">
                                      <thead>
                                        <tr className="bg-surface-2 border-b border-border text-[11px] text-text-secondary sticky top-0 z-10">
                                          <th className="py-1.5 px-3 w-10 border-r border-border/40">#</th>
                                          {validation.userCols.map((c, ci) => (
                                            <th key={ci} className="py-1.5 px-3 font-semibold border-r border-border/40 last:border-r-0 whitespace-nowrap">
                                              {c}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border/30">
                                        {validation.userRows.map((row, ri) => (
                                          <tr key={ri} className="hover:bg-surface-2/40">
                                            <td className="py-1 px-3 text-text-secondary text-[10px] border-r border-border/40 font-bold">{ri + 1}</td>
                                            {row.map((val, vi) => (
                                              <td key={vi} className="py-1 px-3 text-text border-r border-border/40 last:border-r-0 whitespace-nowrap">
                                                {val !== null && val !== undefined ? String(val) : <span className="opacity-40 italic">NULL</span>}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <div className="p-4 text-xs text-text-secondary text-center">0 rows returned.</div>
                                  )
                                ) : (
                                  validation.expectedRows.length > 0 ? (
                                    <table className="w-full text-xs text-left border-collapse font-mono">
                                      <thead>
                                        <tr className="bg-surface-2 border-b border-border text-[11px] text-text-secondary sticky top-0 z-10">
                                          <th className="py-1.5 px-3 w-10 border-r border-border/40">#</th>
                                          {validation.expectedCols.map((c, ci) => (
                                            <th key={ci} className="py-1.5 px-3 font-semibold border-r border-border/40 last:border-r-0 whitespace-nowrap">
                                              {c}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border/30">
                                        {validation.expectedRows.map((row, ri) => (
                                          <tr key={ri} className="hover:bg-surface-2/40">
                                            <td className="py-1 px-3 text-text-secondary text-[10px] border-r border-border/40 font-bold">{ri + 1}</td>
                                            {validation.expectedCols.map((colKey, vi) => (
                                              <td key={vi} className="py-1 px-3 text-text border-r border-border/40 last:border-r-0 whitespace-nowrap">
                                                {row[colKey] !== null && row[colKey] !== undefined ? String(row[colKey]) : <span className="opacity-40 italic">NULL</span>}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <div className="p-4 text-xs text-text-secondary text-center">No expected sample rows.</div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab 2: Input Tables */}
                      {consoleTab === 'input' && (
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                          {currentQuestion?.tables?.map((table) => (
                            <div key={table.name} className="border border-border rounded-xl p-3 bg-surface-2/40">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-xs font-bold text-primary">{table.name}</span>
                                <span className="text-[10px] text-text-secondary">{table.sampleData?.length ?? 0} sample rows</span>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-[11px] font-mono border-collapse">
                                  <thead>
                                    <tr className="border-b border-border text-text-secondary">
                                      {table.columns?.map((c, ci) => (
                                        <th key={ci} className="py-1 px-2 font-semibold">
                                          {typeof c === 'string' ? c : c.name}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border/30">
                                    {(table.sampleData || []).slice(0, 4).map((row, ri) => (
                                      <tr key={ri}>
                                        {table.columns?.map((c, ci) => {
                                          const colName = typeof c === 'string' ? c : c.name;
                                          return (
                                            <td key={ci} className="py-1 px-2 whitespace-nowrap text-text">
                                              {row[colName] !== undefined && row[colName] !== null ? String(row[colName]) : <span className="opacity-40">NULL</span>}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tab 3: Sandbox Scratchpad */}
                      {consoleTab === 'sandbox' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                            <span className="text-xs text-text-secondary">
                              Ad-hoc exploratory SQL sandbox (does not affect your graded solution):
                            </span>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleRunScratch}
                              disabled={isScratchRunning}
                              className="font-bold text-xs"
                            >
                              {isScratchRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                              Run Sandbox Query
                            </Button>
                          </div>
                          <textarea
                            value={scratchpadSql}
                            onChange={(e) => setScratchpadSql(e.target.value)}
                            rows={3}
                            className="w-full bg-surface-2 border border-border rounded-xl p-2.5 font-mono text-xs text-text resize-none focus:outline-none focus:ring-1 focus:ring-primary/40 mb-2"
                            placeholder="SELECT COUNT(*) FROM table_name;"
                          />
                          {scratchResult && (
                            <div className="flex-1 overflow-auto border border-border rounded-xl p-2 font-mono text-xs">
                              {scratchResult.error ? (
                                <span className="text-error">{scratchResult.error}</span>
                              ) : (
                                <span>{scratchResult.rows?.length ?? 0} rows returned. Columns: {(scratchResult.columns || []).join(', ')}</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation Action Footer */}
                  <footer className="px-4 py-2 border-t border-border bg-surface-2 flex justify-between items-center shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goPrev}
                      disabled={currentIndex === 0}
                      className="font-semibold text-xs text-text-secondary"
                    >
                      <ChevronLeft size={15} /> Previous Question
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          handleSaveCurrentSql();
                          goNext();
                        }}
                        className="font-bold text-xs px-5 shadow-sm"
                      >
                        Save & Next Question <ChevronRight size={15} />
                      </Button>
                    </div>
                  </footer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Proctoring PIP Feed */}
        <DraggableProctorFeed cameraStream={cameraStream} screenStream={screenStream} />
      </div>
    </>
  );
}
