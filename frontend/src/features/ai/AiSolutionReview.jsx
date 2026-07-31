import React, { useState, useCallback } from 'react';
import { groqChat, buildSolutionReviewPrompt, useGroqKey } from '@/lib/groq';

const APPROACH_LABELS = {
  optimized: { label: 'Optimized Query', icon: '⚡', color: 'var(--success)' },
  alternative: { label: 'Alternative Approach', icon: '🔀', color: 'var(--accent-1)' },
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
    <div className="ai-panel" style={{ marginTop: 8 }}>
      <div className="ai-panel-header" onClick={!review && !loading ? generateReview : undefined}>
        <div className="ai-panel-title">
          <span>🔍</span>
          <span>AI Solution Review</span>
          <span className="ai-badge">Groq</span>
        </div>
        {!review && !loading && (
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
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
            <div style={{
              fontSize: 13, color: 'var(--warning)', padding: '10px 14px',
              background: 'var(--warning-muted)', borderRadius: 8, borderLeft: '3px solid var(--warning)'
            }}>
              ⚠️ {error}
            </div>
          )}

          {review && !loading && (
            <>
              {/* Tab switcher */}
              <div className="review-tab-list">
                {[
                  { id: 'feedback', label: '📝 Feedback' },
                  { id: 'optimized', label: '⚡ Optimized' },
                  { id: 'alternative', label: '🔀 Alternative' },
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {review.correct && (
                    <div style={{
                      padding: '12px 14px', borderRadius: 8,
                      background: 'var(--success-muted)', borderLeft: '3px solid var(--success)',
                      fontSize: 13, color: 'var(--text)', lineHeight: 1.6
                    }}>
                      <strong style={{ color: 'var(--success)', display: 'block', marginBottom: 4 }}>✅ What's Correct</strong>
                      {review.correct}
                    </div>
                  )}
                  {review.incorrect && (
                    <div style={{
                      padding: '12px 14px', borderRadius: 8,
                      background: 'var(--error-muted)', borderLeft: '3px solid var(--error)',
                      fontSize: 13, color: 'var(--text)', lineHeight: 1.6
                    }}>
                      <strong style={{ color: 'var(--error)', display: 'block', marginBottom: 4 }}>❌ Issues Found</strong>
                      {review.incorrect}
                    </div>
                  )}
                  {review.complexity && (
                    <div style={{
                      padding: '10px 14px', borderRadius: 8,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6
                    }}>
                      <strong style={{ color: 'var(--text)' }}>⏱ Complexity: </strong>
                      {review.complexity}
                    </div>
                  )}
                  {review.tips && (
                    <div style={{
                      padding: '12px 14px', borderRadius: 8,
                      background: 'var(--primary-muted)', borderLeft: '3px solid var(--primary)',
                      fontSize: 13, color: 'var(--text)', lineHeight: 1.6
                    }}>
                      <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: 4 }}>💡 Tips</strong>
                      {review.tips}
                    </div>
                  )}
                </div>
              )}

              {/* Optimized Tab */}
              {activeTab === 'optimized' && review.optimized_sql && (
                <div className="review-approach-block">
                  <div className="review-approach-label">⚡ Optimized Query</div>
                  <pre className="review-code">{review.optimized_sql}</pre>
                </div>
              )}

              {/* Alternative Tab */}
              {activeTab === 'alternative' && review.alternative_approach && (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>
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
