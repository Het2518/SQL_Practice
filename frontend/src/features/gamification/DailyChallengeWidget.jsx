import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Star, Clock } from 'lucide-react';
import { getDailyChallenge } from '@/utils/dailyChallenge';
import { Button } from '@/shared/ui/Button';

export function DailyChallengeWidget({ progress }) {
  const navigate = useNavigate();

  // Use centralized daily challenge logic
  const { dailyQuestion, isCompleted } = useMemo(() => {
    const q = getDailyChallenge();
    const completed = progress && q && progress[q.id];
    return { dailyQuestion: q, isCompleted: completed };
  }, [progress]);

  if (!dailyQuestion) return null;

  return (
    <div
      style={{
        margin: '0 auto 32px',
        maxWidth: 900,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.background = 'var(--surface)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'var(--surface-2)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            flexShrink: 0,
            background: isCompleted ? 'var(--success-muted)' : 'var(--primary-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isCompleted ? 'var(--success)' : 'var(--primary)',
          }}
        >
          {isCompleted ? <Star size={18} /> : <Target size={18} />}
        </div>

        {/* Content */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {isCompleted ? 'Completed' : 'Daily Challenge'}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            {dailyQuestion.title || 'Mystery SQL Problem'}
          </h3>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            className={`badge badge-${dailyQuestion.difficulty?.toLowerCase() || 'easy'}`}
            style={{ padding: '2px 8px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase' }}
          >
            {dailyQuestion.difficulty || 'Easy'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {dailyQuestion.db}
          </span>
        </div>

        <Button
          variant={isCompleted ? 'secondary' : 'primary'}
          onClick={() => navigate(`/practice/${dailyQuestion.db}?q=${dailyQuestion.id}`)}
          style={{ padding: '6px 14px', fontSize: 12, height: 'auto' }}
        >
          {isCompleted ? 'Review' : 'Solve'} <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
