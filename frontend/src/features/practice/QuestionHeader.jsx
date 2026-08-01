import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Timer, Cpu, Zap, Check } from 'lucide-react';
import { isDailyChallenge } from '@/utils/dailyChallenge';

const DIFFICULTY_STYLES = {
  easy:   { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)',  label: 'Easy' },
  medium: { background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)',  label: 'Medium' },
  hard:   { background: 'rgba(239, 68, 68, 0.1)',  color: 'var(--error)',    label: 'Hard' },
};

const STATUS_STYLES = {
  complete:   { color: 'var(--success)', bg: 'rgba(16,185,129,0.1)', label: 'Solved',     icon: <Check size={10} strokeWidth={2.5} /> },
  attempted:  { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)', label: 'Attempted',  icon: null },
  incomplete: { color: 'var(--muted)',   bg: 'transparent',          label: 'Unsolved',   icon: null },
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>

        <button
          onClick={onOpenBrowser}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent',
            border: '1px solid var(--border)',
            padding: '5px 10px',
            borderRadius: 7,
            fontSize: 13, fontWeight: 500,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {question.db}
          <ChevronDown size={13} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {timedChallenges && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: timeLeft <= 60 ? 'rgba(239,68,68,0.1)' : 'var(--surface-2)',
              color: timeLeft <= 60 ? 'var(--error)' : 'var(--text-secondary)',
              padding: '4px 10px', borderRadius: 6,
              fontSize: 12, fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              border: `1px solid ${timeLeft <= 60 ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
            }}>
              <Timer size={13} /> {formatTime(timeLeft)}
            </div>
          )}

          {/* Question navigator */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 7, overflow: 'hidden',
          }}>
            <button
              onClick={() => onNavigate('prev')} disabled={!hasPrev}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, background: 'none', border: 'none',
                borderRight: '1px solid var(--border)',
                cursor: hasPrev ? 'pointer' : 'default',
                color: hasPrev ? 'var(--text)' : 'var(--border)',
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ padding: '0 10px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', userSelect: 'none' }}>
              {questionNumber} / {totalQuestions}
            </span>
            <button
              onClick={() => onNavigate('next')} disabled={!hasNext}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, background: 'none', border: 'none',
                borderLeft: '1px solid var(--border)',
                cursor: hasNext ? 'pointer' : 'default',
                color: hasNext ? 'var(--text)' : 'var(--border)',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Title row ── */}
      <div style={{ marginBottom: 16 }}>
        {/* Badges row — compact, subtle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {/* Difficulty */}
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            padding: '3px 8px', borderRadius: 5,
            background: diff.background, color: diff.color,
            textTransform: 'uppercase',
          }}>
            {diff.label}
          </span>

          {/* Status */}
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 500,
            padding: '3px 8px', borderRadius: 5,
            background: st.bg, color: st.color,
          }}>
            {st.icon}{st.label}
          </span>

          {/* Daily Challenge — subtle, not huge */}
          {isDaily && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              padding: '3px 8px', borderRadius: 5,
              background: 'rgba(245,158,11,0.1)', color: 'var(--warning)',
              textTransform: 'uppercase',
            }}>
              <Zap size={10} strokeWidth={2.5} /> Daily
            </span>
          )}

          {/* AI Generated */}
          {question.isAiGenerated && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              padding: '3px 8px', borderRadius: 5,
              background: 'rgba(139,92,246,0.1)', color: 'var(--primary)',
              textTransform: 'uppercase',
            }}>
              <Cpu size={10} /> AI
            </span>
          )}
        </div>

        {/* Title */}
        <h2 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
          lineHeight: 1.35,
        }}>
          {question.title || `Question ${question.id}`}
        </h2>
      </div>
    </>
  );
});
