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
    <div className="mx-auto mb-8 max-w-[900px] bg-surface-2 border border-border rounded-xl flex items-center justify-between py-3.5 px-5 transition-all duration-150 ease-in hover:border-border-hover hover:bg-surface">
      <div className="flex items-center gap-3.5">
        {/* Icon */}
        <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${isCompleted ? 'bg-success-muted text-success' : 'bg-primary-muted text-primary'}`}>
          {isCompleted ? <Star size={18} /> : <Target size={18} />}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">
              {isCompleted ? 'Completed' : 'Daily Challenge'}
            </span>
          </div>
          <h3 className="m-0 text-sm font-semibold text-text">
            {dailyQuestion.title || 'Mystery SQL Problem'}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-md border ${
            dailyQuestion.difficulty === 'hard' ? 'bg-error-muted text-error border-error/20' : 
            dailyQuestion.difficulty === 'medium' ? 'bg-warning-muted text-warning border-warning/20' : 
            'bg-success-muted text-success border-success/20'
          }`}>
            {dailyQuestion.difficulty || 'Easy'}
          </span>
          <span className="text-[13px] text-text-secondary font-medium">
            {dailyQuestion.db}
          </span>
        </div>

        <Button
          variant={isCompleted ? 'secondary' : 'primary'}
          onClick={() => navigate(`/practice/${dailyQuestion.db}?q=${dailyQuestion.id}`)}
          className="px-3.5 py-1.5 text-xs h-auto"
        >
          {isCompleted ? 'Review' : 'Solve'} <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
