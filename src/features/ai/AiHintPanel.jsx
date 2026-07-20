import React, { useState, useCallback } from 'react';
import { groqChat, buildHintPrompt, useGroqKey } from '@/lib/groq';

/**
 * AiHintPanel — On-demand AI-powered personalized hint.
 * Called from QuestionCard after user clicks "🤖 AI Hint".
 * Analyzes the student's specific SQL mistake and gives targeted guidance.
 */
export function AiHintPanel({ question, studentSQL, dbSchemaContext }) {
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const hasKey = useGroqKey();

  const generateHint = useCallback(async () => {
    if (!hasKey) {
      setError('Add your Groq API key in Settings → AI Configuration to unlock AI hints.');
      return;
    }
    if (!studentSQL?.trim()) {
      setError('Write some SQL first, then ask for a hint!');
      return;
    }
    setLoading(true);
    setError('');
    setHint('');
    try {
      const messages = buildHintPrompt({ question, studentSQL, dbSchema: dbSchemaContext });
      const response = await groqChat(messages, undefined, 200, true);
      setHint(response);
      setGenerated(true);
    } catch (err) {
      if (err.message === 'NO_KEY') {
        setError('Groq API key not found. Add it in Settings → AI Configuration.');
      } else if (err.message === 'RATE_LIMIT') {
        setError('Rate limit reached. Wait 10 seconds and try again.');
      } else if (err.message === 'BAD_KEY') {
        setError('Invalid API key. Please check your Groq key in Settings.');
      } else {
        setError('AI hint failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [question, studentSQL, dbSchemaContext]);

  const handleRegenerate = () => {
    // Clear cache for regeneration by changing a seed (handled by calling again without cache)
    setHint('');
    setGenerated(false);
    generateHint();
  };

  return (
    <div className="ai-panel" style={{ marginTop: 8 }}>
      <div className="ai-panel-header" onClick={!generated && !loading ? generateHint : undefined}>
        <div className="ai-panel-title">
          <span>✨</span>
          <span>AI Personalized Hint</span>
          <span className="ai-badge">llama-3.1-8b</span>
        </div>
        {!generated && !loading && (
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
            Click to analyze your query →
          </span>
        )}
        {generated && !loading && (
          <button
            onClick={(e) => { e.stopPropagation(); handleRegenerate(); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'rgba(139,92,246,0.8)', fontWeight: 600,
              padding: '2px 6px', borderRadius: 4,
            }}
          >
            ↻ Regenerate
          </button>
        )}
      </div>

      {(loading || hint || error) && (
        <div className="ai-panel-body">
          {loading && (
            <div className="ai-loading">
              <div className="ai-loading-dots">
                <div className="ai-loading-dot" />
                <div className="ai-loading-dot" />
                <div className="ai-loading-dot" />
              </div>
              <span>Analyzing your query...</span>
            </div>
          )}
          {hint && !loading && (
            <div className="ai-hint-text">
              {hint}
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
        </div>
      )}
    </div>
  );
}
