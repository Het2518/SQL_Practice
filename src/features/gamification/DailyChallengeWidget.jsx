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
      background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative'
    }}>
      {/* Decorative gradient block */}
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: isCompleted ? '#10b981' : '#f59e0b' }} />

      <div style={{ padding: '24px 32px', flex: 1, display: 'flex', alignItems: 'center', gap: 24 }}>
        
        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 16, flexShrink: 0,
          background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCompleted ? '#10b981' : '#f59e0b'
        }}>
          {isCompleted ? <Star size={28} fill="currentColor" /> : <Target size={28} />}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: isCompleted ? '#10b981' : '#f59e0b', textTransform: 'uppercase', letterSpacing: 1 }}>
              {isCompleted ? "Challenge Completed" : "Daily Challenge"}
            </span>
            <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> Ends tonight
            </span>
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            {dailyQuestion.title || "Mystery SQL Problem"}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge badge-${dailyQuestion.difficulty?.toLowerCase() || 'easy'}`}>
              {dailyQuestion.difficulty || 'Easy'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Database: <strong style={{ color: 'var(--text)' }}>{dailyQuestion.db}</strong>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => navigate(`/practice/${dailyQuestion.db}?q=${dailyQuestion.id}`)}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: isCompleted ? 'var(--surface-2)' : 'var(--primary)',
              color: isCompleted ? 'var(--text)' : '#fff',
              border: isCompleted ? '1px solid var(--border)' : 'none',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
              boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(var(--primary-rgb), 0.3)'
            }}
            onMouseEnter={e => {
              if (!isCompleted) e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={e => {
              if (!isCompleted) e.currentTarget.style.filter = 'none';
            }}
          >
            {isCompleted ? 'Review Answer' : 'Solve Challenge'} <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
