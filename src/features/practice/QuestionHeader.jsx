import React from 'react';
import { ChevronDown } from 'lucide-react';
import { isDailyChallenge } from '@/utils/dailyChallenge';

const difficultyLabel = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
};

const statusIcon = {
  complete: '✅',
  attempted: '🔄',
  incomplete: '○',
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

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <button
          onClick={onOpenBrowser}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-muted)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          {question.db}
          <ChevronDown size={14} style={{ color: 'var(--muted)' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {timedChallenges && (
            <div
              style={{
                background: timeLeft <= 60 ? 'var(--error-muted)' : 'var(--surface-2)',
                color: timeLeft <= 60 ? 'var(--error)' : 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                border: timeLeft <= 60 ? '1px solid var(--error)' : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              ⏱️ {formatTime(timeLeft)}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--surface-2)',
              borderRadius: 8,
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => onNavigate('prev')}
              disabled={!hasPrev}
              style={{
                padding: '6px 10px',
                background: 'none',
                border: 'none',
                borderRight: '1px solid var(--border)',
                cursor: hasPrev ? 'pointer' : 'not-allowed',
                color: hasPrev ? 'var(--text)' : 'var(--border)',
              }}
            >
              ◀
            </button>
            <div
              style={{
                padding: '0 12px',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              {questionNumber} / {totalQuestions}
            </div>
            <button
              onClick={() => onNavigate('next')}
              disabled={!hasNext}
              style={{
                padding: '6px 10px',
                background: 'none',
                border: 'none',
                borderLeft: '1px solid var(--border)',
                cursor: hasNext ? 'pointer' : 'not-allowed',
                color: hasNext ? 'var(--text)' : 'var(--border)',
              }}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.02em',
          }}
        >
          {question.title || `Question ${question.id}`}
        </h2>
        <span className={`difficulty-badge ${question.difficulty}`}>
          {difficultyLabel[question.difficulty]}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 99,
            background: 'var(--surface-3)',
            color: 'var(--text-secondary)',
          }}
        >
          {statusIcon[status] || '○'} {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {question.isAiGenerated && (
          <span className="ai-badge" style={{ fontSize: 10, padding: '2px 8px' }}>
            ✨ AI Generated
          </span>
        )}
        {isDailyChallenge(question.id) && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 99,
              background: 'var(--warning-muted)',
              color: 'var(--warning)',
              border: '1px solid var(--warning)',
            }}
          >
            🔥 Daily Challenge
          </span>
        )}
      </div>
    </>
  );
});
