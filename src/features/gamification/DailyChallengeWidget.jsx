import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowRight, Star, Clock } from 'lucide-react';
import { allQuestions } from '@/data';
import { Button } from '@/shared/ui/Button';

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
      justifyContent: 'space-between',
      padding: '20px 32px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: isCompleted ? 'var(--success-muted)' : 'var(--primary-muted)', 
          border: isCompleted ? '1px solid var(--success-light)' : '1px solid var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isCompleted ? 'var(--success)' : 'var(--primary)',
        }}>
          {isCompleted ? <Star size={24} /> : <Target size={24} />}
        </div>

        {/* Content */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isCompleted ? "Completed" : "Daily Challenge"}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
            {dailyQuestion.title || "Mystery SQL Problem"}
          </h3>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge badge-${dailyQuestion.difficulty?.toLowerCase() || 'easy'}`} style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
            {dailyQuestion.difficulty || 'Easy'}
          </span>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {dailyQuestion.db}
          </span>
        </div>

        <Button
          variant={isCompleted ? 'secondary' : 'primary'}
          onClick={() => navigate(`/practice/${dailyQuestion.db}?q=${dailyQuestion.id}`)}
          style={{ paddingLeft: 24, paddingRight: 24 }}
        >
          {isCompleted ? 'Review' : 'Solve'} <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
}
