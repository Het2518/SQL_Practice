import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Timer, Cpu, Zap, Check } from 'lucide-react';
import { isDailyChallenge } from '@/utils/dailyChallenge';

const DIFFICULTY_STYLES = {
  easy:   { className: 'bg-emerald-500/10 text-success', label: 'Easy' },
  medium: { className: 'bg-amber-500/10 text-warning', label: 'Medium' },
  hard:   { className: 'bg-red-500/10 text-error', label: 'Hard' },
};

const STATUS_STYLES = {
  complete:   { className: 'bg-emerald-500/10 text-success', label: 'Solved',     icon: <Check size={10} strokeWidth={2.5} /> },
  attempted:  { className: 'bg-amber-500/10 text-warning', label: 'Attempted',  icon: null },
  incomplete: { className: 'bg-transparent text-muted', label: 'Unsolved',   icon: null },
};

export const QuestionHeader = React.memo(function QuestionHeader({
  question,
  status,
  timeLeft,
  timedChallenges,
  questionNumber,
  totalQuestions,
  hasPrev,
  hasNext,
  onNavigate,
  onOpenBrowser,
}) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const diff = DIFFICULTY_STYLES[question.difficulty] || DIFFICULTY_STYLES.easy;
  const st   = STATUS_STYLES[status] || STATUS_STYLES.incomplete;
  const isDaily = isDailyChallenge(question.id);

  return (
    <>
      {/* ── Top bar: DB selector + Navigation ── */}
      <div className="flex items-center justify-between mb-5">

        <button
          onClick={onOpenBrowser}
          className="flex items-center gap-1.5 bg-transparent border border-border px-2.5 py-1.5 rounded-md text-[13px] font-medium text-text-secondary cursor-pointer transition-all duration-150 hover:border-primary hover:text-text"
        >
          {question.db}
          <ChevronDown size={13} />
        </button>

        <div className="flex items-center gap-2">
          {timedChallenges && (
            <div 
              aria-live="polite"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tabular-nums border ${timeLeft <= 60 ? 'bg-red-500/10 text-error border-error/30' : 'bg-surface-2 text-text-secondary border-border'}`}
            >
              <Timer size={13} /> {formatTime(timeLeft)}
            </div>
          )}

          {/* Question navigator */}
          <div className="flex items-center bg-surface-2 border border-border rounded-md overflow-hidden">
            <button
              onClick={() => onNavigate('prev')} disabled={!hasPrev}
              className={`flex items-center justify-center w-7 h-7 bg-transparent border-none border-r border-border ${hasPrev ? 'cursor-pointer text-text' : 'cursor-default text-border'}`}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2.5 text-xs font-semibold text-text-secondary select-none">
              {questionNumber} / {totalQuestions}
            </span>
            <button
              onClick={() => onNavigate('next')} disabled={!hasNext}
              className={`flex items-center justify-center w-7 h-7 bg-transparent border-none border-l border-border ${hasNext ? 'cursor-pointer text-text' : 'cursor-default text-border'}`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Title row ── */}
      <div className="mb-4">
        {/* Badges row — compact, subtle */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {/* Difficulty */}
          <span className={`text-[10px] font-bold tracking-[0.06em] px-2 py-1 rounded-[5px] uppercase ${diff.className}`}>
            {diff.label}
          </span>

          {/* Status */}
          <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-[5px] ${st.className}`}>
            {st.icon}{st.label}
          </span>

          {/* Daily Challenge — subtle, not huge */}
          {isDaily && (
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-[0.04em] px-2 py-1 rounded-[5px] bg-amber-500/10 text-warning uppercase">
              <Zap size={10} strokeWidth={2.5} /> Daily
            </span>
          )}

          {/* AI Generated */}
          {question.isAiGenerated && (
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-[0.04em] px-2 py-1 rounded-[5px] bg-primary/10 text-primary uppercase">
              <Cpu size={10} /> AI
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="m-0 text-lg font-bold text-text tracking-[-0.02em] leading-[1.35]">
          {question.title || `Question ${question.id}`}
        </h2>
      </div>
    </>
  );
});
