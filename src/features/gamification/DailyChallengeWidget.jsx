import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Star, Clock } from 'lucide-react';
import { allQuestions } from '@/data';

export function DailyChallengeWidget({ progress }) {
  const navigate = useNavigate();

  // Pseudo-randomly pick a question based on today's date so everyone gets the same one
  const { dailyQuestion, isCompleted } = useMemo(() => {
    if (!allQuestions || allQuestions.length === 0) return { dailyQuestion: null, isCompleted: false };
    
    const today = new Date().toISOString().slice(0, 10);
    // Simple hash function for the date string
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash << 5) - hash + today.charCodeAt(i);
      hash |= 0; 
    }
    const index = Math.abs(hash) % allQuestions.length;
    const q = allQuestions[index];
    
    const completed = progress && progress[q.id];
    return { dailyQuestion: q, isCompleted: completed };
  }, [progress]);

  if (!dailyQuestion) return null;

  return (
    <div style={{
      margin: '0 auto 32px',
      maxWidth: 900,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 8, flexShrink: 0,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCompleted ? 'var(--success)' : 'var(--primary)',
        }}>
          {isCompleted ? <Star size={20} /> : <Target size={20} />}
        </div>

        {/* Content */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {isCompleted ? "Completed" : "Daily Challenge"}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            {dailyQuestion.title || "Mystery SQL Problem"}
          </h3>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge badge-${dailyQuestion.difficulty?.toLowerCase() || 'easy'}`} style={{ padding: '2px 8px', fontSize: 11 }}>
            {dailyQuestion.difficulty || 'Easy'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {dailyQuestion.db}
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate(`/practice/${dailyQuestion.db}?q=${dailyQuestion.id}`)}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            background: isCompleted ? 'var(--surface-2)' : 'var(--primary)',
            color: isCompleted ? 'var(--text)' : '#fff',
            border: isCompleted ? '1px solid var(--border)' : '1px solid var(--primary)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => {
            if (!isCompleted) e.currentTarget.style.background = 'var(--primary-muted)';
            else e.currentTarget.style.background = 'var(--surface-3)';
          }}
          onMouseLeave={e => {
            if (!isCompleted) e.currentTarget.style.background = 'var(--primary)';
            else e.currentTarget.style.background = 'var(--surface-2)';
          }}
        >
          {isCompleted ? 'Review' : 'Solve'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
