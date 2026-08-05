import React, { useState } from 'react';
import { Lightbulb, ChevronDown, Sparkles } from 'lucide-react';
import { runAutoHintAnalysis } from '@/features/ai/AutoHintMiddleware';

export function QuestionHintSection({
  question,
  currentSql,
  hasKey,
  onOpenAiTutor
}) {
  const [showHints, setShowHints] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [autoHint, setAutoHint] = useState(null);

  const handleToggleHint = () => {
    if (!showHints) {
      setShowHints(true);
      if (hintsUsed === 0) {
        setHintsUsed(1);
        if (currentSql?.trim()) {
          const { hint } = runAutoHintAnalysis(currentSql, question);
          if (hint) setAutoHint(hint);
        }
      }
    } else {
      setShowHints(false);
    }
  };

  const handleNextHint = () => {
    setHintsUsed((n) => Math.min(n + 1, 3));
  };

  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <button
        onClick={handleToggleHint}
        className={`w-full flex items-center justify-between px-4 py-3 border-none cursor-pointer font-semibold text-[13px] transition-all duration-150 ease-in-out ${showHints ? 'bg-amber-500/10 text-warning' : 'bg-transparent text-text-secondary hover:bg-surface'}`}
        onMouseEnter={(e) => {
          if (!showHints) e.currentTarget.classList.add('bg-surface');
        }}
        onMouseLeave={(e) => {
          if (!showHints) e.currentTarget.classList.remove('bg-surface');
        }}
      >
        <div className="flex items-center gap-2">
          <Lightbulb size={15} strokeWidth={2} />
          <span>Hints{hintsUsed > 0 ? ` (${hintsUsed}/3)` : ''}</span>
        </div>
        <ChevronDown
          size={15}
          className={`transition-transform duration-250 opacity-60 ${showHints ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>
      
      <div
        className={`overflow-hidden transition-[max-height] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${showHints ? 'max-h-[700px]' : 'max-h-0'}`}
      >
        <div className="px-4 pb-4 flex flex-col gap-4">
          {/* Auto-Hint: Client-side analysis result */}
          {hintsUsed >= 1 && autoHint && (
            <div className="border-t border-border pt-4">
              <h4 className="m-0 mb-1.5 text-[13px] text-warning font-bold flex items-center gap-1.5">
                🔍 Smart Analysis
              </h4>
              <p className="m-0 text-[13px] text-text-secondary leading-[1.5]">
                {autoHint}
              </p>
            </div>
          )}
          {hintsUsed >= 1 && (
            <div className="border-t border-border pt-4">
              <h4 className="m-0 mb-1.5 text-[13px] text-text font-semibold">
                Conceptual Hint
              </h4>
              <p className="m-0 text-[13px] text-text-secondary leading-relaxed">
                {question.hint_conceptual ||
                  'Think about which SQL clause groups records together before filtering aggregated results.'}
              </p>
            </div>
          )}
          {hintsUsed >= 2 && (
            <div className="border-t border-border pt-4">
              <h4 className="m-0 mb-1.5 text-[13px] text-text font-semibold">
                Structural Hint
              </h4>
              <p className="m-0 text-[13px] text-text-secondary font-mono">
                {question.hint_structural || 'SELECT column1, column2 FROM table_name;'}
              </p>
            </div>
          )}
          {hintsUsed >= 3 && (
            <div className="border-t border-border pt-4">
              <h4 className="m-0 mb-1.5 text-[13px] text-text font-semibold">
                Near-Solution Hint
              </h4>
              <p className="m-0 text-[13px] text-text-secondary font-mono">
                {question.hint_near_solution ||
                  'SELECT first_name, last_name, gender FROM patients;'}
              </p>
            </div>
          )}

          {/* AI Hint — on demand */}
          {hintsUsed >= 1 && (
            <div className="border-t border-border pt-3">
              <button
                onClick={onOpenAiTutor}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-primary/40 bg-gradient-to-br from-primary/5 to-blue-500/5 cursor-pointer text-[13px] font-semibold text-primary transition-all duration-200 hover:border-primary"
              >
                <Sparkles size={13} strokeWidth={2} /> Get AI Personalized Hint
                {hasKey ? null : (
                  <span className="text-[10px] text-muted ml-1">
                    (needs key)
                  </span>
                )}
              </button>
            </div>
          )}

          {hintsUsed < 3 && (
            <button
              onClick={handleNextHint}
              className={`btn btn-secondary text-[13px] px-4 py-2 self-start ${hintsUsed === 0 ? 'mt-4' : 'mt-2'}`}
            >
              Reveal Next Hint
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
