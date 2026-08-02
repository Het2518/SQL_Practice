import React, { useState, useCallback } from 'react';
import { groqChat, buildSolutionReviewPrompt, useGroqKey } from '@/lib/groq';
import { Search, Zap, GitCompare, CheckCircle, XCircle, Clock, Lightbulb, AlertTriangle } from 'lucide-react';

const APPROACH_LABELS = {
  optimized: { label: 'Optimized Query', icon: <Zap size={12} />, color: 'var(--success)' },
  alternative: { label: 'Alternative Approach', icon: <GitCompare size={12} />, color: 'var(--accent-1)' },
};

/**
 * AiSolutionReview — Full code review after a question is attempted.
 * Shows: what's correct, what's wrong, optimized SQL, alternative approach, complexity, tips.
 * On-demand only (user must click). Uses 400 max tokens.
 */
export function AiSolutionReview({ question, studentSQL, solutionSQL }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('feedback');

  const hasKey = useGroqKey();

  const generateReview = useCallback(async () => {
    if (!hasKey) {
      setError('Add your Groq API key in Settings → AI Configuration to unlock AI Solution Reviews.');
      return;
    }
    if (!studentSQL?.trim()) {
      setError('Submit a query first to get it reviewed.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const messages = buildSolutionReviewPrompt({ question, studentSQL, solutionSQL });
      const raw = await groqChat(messages, undefined, 500, true);
      // Parse JSON response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Bad response format');
      const parsed = JSON.parse(jsonMatch[0]);
      setReview(parsed);
    } catch (err) {
      if (err.message === 'NO_KEY') {
        setError('Groq API key not found. Add it in Settings → AI Configuration.');
      } else if (err.message === 'RATE_LIMIT') {
        setError('Rate limit reached. Try again in a few seconds.');
      } else if (err.message === 'BAD_KEY') {
        setError('Invalid API key. Please check your Groq key in Settings.');
      } else {
        setError('AI review failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [question, studentSQL, solutionSQL]);

  return (
    <div className="ai-panel mt-2">
      <div className="ai-panel-header" onClick={!review && !loading ? generateReview : undefined}>
        <div className="ai-panel-title">
          <Search size={14} strokeWidth={2} />
          <span>AI Solution Review</span>
          <span className="ai-badge">Groq</span>
        </div>
        {!review && !loading && (
          <span className="text-xs text-muted font-medium">
            Get full code review →
          </span>
        )}
      </div>

      {(loading || review || error) && (
        <div className="ai-panel-body">
          {loading && (
            <div className="ai-loading">
              <div className="ai-loading-dots">
                <div className="ai-loading-dot" />
                <div className="ai-loading-dot" />
                <div className="ai-loading-dot" />
              </div>
              <span>Reviewing your solution...</span>
            </div>
          )}

          {error && !loading && (
            <div className="text-[13px] text-warning px-3.5 py-2.5 bg-warning-muted rounded-lg border-l-[3px] border-warning flex items-center gap-1.5">
              <AlertTriangle size={14} className="shrink-0" /> {error}
            </div>
          )}

          {review && !loading && (
            <>
              {/* Tab switcher */}
              <div className="review-tab-list">
                {[
                  { id: 'feedback', label: 'Feedback' },
                  { id: 'optimized', label: 'Optimized' },
                  { id: 'alternative', label: 'Alternative' },
                ].map(t => (
                  <button
                    key={t.id}
                    className={`review-tab ${activeTab === t.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Feedback Tab */}
              {activeTab === 'feedback' && (
                <div className="flex flex-col gap-3">
                  {review.correct && (
                    <div className="px-3.5 py-3 rounded-lg bg-success-muted border-l-[3px] border-success text-[13px] text-text leading-relaxed">
                      <strong className="text-success flex items-center gap-1 mb-1">
                        <CheckCircle size={12} /> What's Correct
                      </strong>
                      {review.correct}
                    </div>
                  )}
                  {review.incorrect && (
                    <div className="px-3.5 py-3 rounded-lg bg-error-muted border-l-[3px] border-error text-[13px] text-text leading-relaxed">
                      <strong className="text-error flex items-center gap-1 mb-1">
                        <XCircle size={12} /> Issues Found
                      </strong>
                      {review.incorrect}
                    </div>
                  )}
                  {review.complexity && (
                    <div className="px-3.5 py-2.5 rounded-lg bg-surface-2 border border-border text-[13px] text-text-secondary leading-relaxed">
                      <strong className="text-text flex items-center gap-1 mb-1">
                        <Clock size={12} /> Complexity: 
                      </strong>
                      {review.complexity}
                    </div>
                  )}
                  {review.tips && (
                    <div className="px-3.5 py-3 rounded-lg bg-primary-muted border-l-[3px] border-primary text-[13px] text-text leading-relaxed">
                      <strong className="text-primary flex items-center gap-1 mb-1">
                        <Lightbulb size={12} /> Tips
                      </strong>
                      {review.tips}
                    </div>
                  )}
                </div>
              )}

              {/* Optimized Tab */}
              {activeTab === 'optimized' && review.optimized_sql && (
                <div className="review-approach-block">
                  <div className="review-approach-label flex items-center gap-1.5"><Zap size={12} /> Optimized Query</div>
                  <pre className="review-code">{review.optimized_sql}</pre>
                </div>
              )}

              {/* Alternative Tab */}
              {activeTab === 'alternative' && review.alternative_approach && (
                <div>
                  <p className="text-[13px] text-text-secondary mb-3 leading-relaxed">
                    {review.alternative_approach}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
