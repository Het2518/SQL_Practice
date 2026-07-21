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
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative vertical bar */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, 
        background: isCompleted ? 'var(--success)' : 'var(--primary)'
      }} />

      <div style={{ padding: '24px 32px', flex: 1, display: 'flex', alignItems: 'center', gap: 24 }}>
        
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: isCompleted ? 'var(--success-muted)' : 'var(--primary-muted)',
          border: `1px solid ${isCompleted ? 'var(--success-light)' : 'var(--primary-light)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCompleted ? 'var(--success)' : 'var(--primary)',
        }}>
          {isCompleted ? <Star size={24} /> : <Target size={24} />}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ 
              fontSize: 12, fontWeight: 600, 
              color: isCompleted ? 'var(--success)' : 'var(--primary)', 
              textTransform: 'uppercase', letterSpacing: 1
            }}>
              {isCompleted ? "Challenge Completed" : "Daily Challenge"}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} /> Ends at midnight
            </span>
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
            {dailyQuestion.title || "Mystery SQL Problem"}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`badge badge-${dailyQuestion.difficulty?.toLowerCase() || 'easy'}`} style={{ padding: '2px 8px', fontSize: 12 }}>
              {dailyQuestion.difficulty || 'Easy'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Database: <strong style={{ color: 'var(--text)', fontWeight: 500 }}>{dailyQuestion.db}</strong>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => navigate(`/practice/${dailyQuestion.db}?q=${dailyQuestion.id}`)}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: isCompleted ? 'var(--surface-2)' : 'var(--primary)',
              color: isCompleted ? 'var(--text)' : '#fff',
              border: isCompleted ? '1px solid var(--border)' : '1px solid var(--primary)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => {
              if (!isCompleted) e.currentTarget.style.background = 'var(--primary-dark)';
              else e.currentTarget.style.background = 'var(--surface-3)';
            }}
            onMouseLeave={e => {
              if (!isCompleted) e.currentTarget.style.background = 'var(--primary)';
              else e.currentTarget.style.background = 'var(--surface-2)';
            }}
          >
            {isCompleted ? 'Review Answer' : 'Solve Challenge'} <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
