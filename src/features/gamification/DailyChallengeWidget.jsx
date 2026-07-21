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
      margin: '0 auto 40px',
      maxWidth: 900,
      background: isCompleted 
        ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.15) 100%)'
        : 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.15) 100%)',
      border: isCompleted ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: isCompleted 
        ? '0 12px 40px rgba(16, 185, 129, 0.15)' 
        : '0 12px 40px rgba(99, 102, 241, 0.15)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      backdropFilter: 'blur(20px)',
      transform: 'translateY(0)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = isCompleted 
        ? '0 20px 50px rgba(16, 185, 129, 0.25)' 
        : '0 20px 50px rgba(99, 102, 241, 0.25)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = isCompleted 
        ? '0 12px 40px rgba(16, 185, 129, 0.15)' 
        : '0 12px 40px rgba(99, 102, 241, 0.15)';
    }}>
      {/* Decorative gradient block */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 6, 
        background: isCompleted 
          ? 'linear-gradient(to bottom, #10b981, #059669)' 
          : 'linear-gradient(to bottom, #3b82f6, #6366f1)' 
      }} />

      <div style={{ padding: '28px 36px', flex: 1, display: 'flex', alignItems: 'center', gap: 28 }}>
        
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 20, flexShrink: 0,
          background: isCompleted 
            ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.1) 100%)' 
            : 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.2) 100%)',
          border: isCompleted ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCompleted ? '#10b981' : '#6366f1',
          boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.1)'
        }}>
          {isCompleted ? <Star size={32} fill="currentColor" /> : <Target size={32} strokeWidth={2.5} />}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ 
              fontSize: 12, fontWeight: 800, 
              color: isCompleted ? '#10b981' : '#6366f1', 
              textTransform: 'uppercase', letterSpacing: 1.5,
              background: isCompleted ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
              padding: '4px 10px', borderRadius: 12
            }}>
              {isCompleted ? "Challenge Completed" : "Daily Challenge"}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
              <Clock size={14} /> Ends at midnight
            </span>
          </div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {dailyQuestion.title || "Mystery SQL Problem"}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`badge badge-${dailyQuestion.difficulty?.toLowerCase() || 'easy'}`} style={{ padding: '4px 10px', fontSize: 12 }}>
              {dailyQuestion.difficulty || 'Easy'}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Database: <strong style={{ color: 'var(--text)' }}>{dailyQuestion.db}</strong>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => navigate(`/practice/${dailyQuestion.db}?q=${dailyQuestion.id}`)}
            style={{
              padding: '14px 28px',
              borderRadius: 14,
              background: isCompleted 
                ? 'var(--surface-2)' 
                : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              color: isCompleted ? 'var(--text)' : '#fff',
              border: isCompleted ? '1px solid var(--border)' : 'none',
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isCompleted 
                ? 'none' 
                : '0 8px 20px rgba(99, 102, 241, 0.3)',
              textShadow: isCompleted ? 'none' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={e => {
              if (!isCompleted) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.4)';
              } else {
                e.currentTarget.style.background = 'var(--surface-3)';
              }
            }}
            onMouseLeave={e => {
              if (!isCompleted) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(99, 102, 241, 0.3)';
              } else {
                e.currentTarget.style.background = 'var(--surface-2)';
              }
            }}
          >
            {isCompleted ? 'Review Answer' : 'Solve Challenge'} <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  );
}
