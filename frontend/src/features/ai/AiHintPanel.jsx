import React, { useState, useCallback, useEffect } from 'react';
import { groqChat, buildHintPrompt, MODEL_FAST, hasGroqKey } from '@/lib/groq';
import { runAutoHintAnalysis } from './AutoHintMiddleware';
import { Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';

/**
 * AiHintPanel — On-demand AI-powered personalized hint.
 * Called from QuestionCard after user clicks "Get AI Personalized Hint".
 * Analyzes the student's specific SQL mistake or provides a starting roadmap.
 * Seamlessly falls back to instant heuristic AST analysis if offline or keyless.
 */
export function AiHintPanel({ question, studentSQL, dbSchemaContext, autoRun = true }) {
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [source, setSource] = useState('ai'); // 'ai' | 'heuristics'
  const hasKey = hasGroqKey();

  useEffect(() => {
    setHint('');
    setError('');
    setGenerated(false);
  }, [question?.id]);

  const generateHint = useCallback(async () => {
    setLoading(true);
    setError('');
    setHint('');

    // 1. Try Groq AI if key is present
    if (hasKey) {
      try {
        const messages = buildHintPrompt({
          question,
          studentSQL: studentSQL || '',
          dbSchema: dbSchemaContext
        });
        const response = await groqChat(messages, MODEL_FAST, 250, true);
        if (response && response.trim()) {
          setHint(response);
          setSource('ai');
          setGenerated(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[AiHintPanel] Groq call failed, falling back to heuristic analyzer:', err.message);
      }
    }

    // 2. Fallback to local heuristic AST / question analysis (always succeeds)
    try {
      const trimmedSql = (studentSQL || '').trim();
      if (trimmedSql) {
        const auto = runAutoHintAnalysis(trimmedSql, question);
        if (auto?.hint) {
          setHint(auto.hint);
          setSource('heuristics');
          setGenerated(true);
          setLoading(false);
          return;
        }
      }

      // 3. Fallback to question starting hint
      const baseHint =
        question?.hint_conceptual ||
        (Array.isArray(question?.hints) ? question.hints[0] : null) ||
        'Start by inspecting the table schema in the left panel. Identify the primary table for the FROM clause, then filter relevant rows using WHERE.';

      setHint(baseHint);
      setSource('heuristics');
      setGenerated(true);
    } catch {
      setError('Could not analyze query. Try again or check the static hints.');
    } finally {
      setLoading(false);
    }
  }, [hasKey, question, studentSQL, dbSchemaContext]);

  useEffect(() => {
    if (autoRun && !generated && !loading && !hint) {
      generateHint();
    }
  }, [autoRun, generateHint, generated, loading, hint]);

  const handleRegenerate = () => {
    setHint('');
    setError('');
    setGenerated(false);
    generateHint();
  };

  return (
    <div className="ai-panel mt-2">
      <div className="ai-panel-header flex-wrap gap-3" onClick={!generated && !loading ? generateHint : undefined}>
        <div className="ai-panel-title flex-wrap">
          {source === 'ai' ? <Sparkles size={14} strokeWidth={2} /> : <Lightbulb size={14} strokeWidth={2} className="text-amber-400" />}
          <span>AI Personalized Hint</span>
          <span className="ai-badge">{source === 'ai' ? 'Groq AI' : 'Instant Coach'}</span>
        </div>
        {!generated && !loading && (
          <span className="text-xs text-muted font-medium">
            Click to analyze query →
          </span>
        )}
        {generated && !loading && (
          <button
            onClick={(e) => { e.stopPropagation(); handleRegenerate(); }}
            className="bg-transparent border-none cursor-pointer text-[11px] text-primary/80 font-semibold px-1.5 py-0.5 rounded transition-colors hover:bg-primary/10"
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
              <span>{studentSQL?.trim() ? 'Analyzing your query...' : 'Analyzing problem & preparing guidance...'}</span>
            </div>
          )}
          {hint && !loading && (
            <div className="ai-hint-text">
              {hint}
              {!hasKey && (
                <div className="mt-2 pt-2 border-t border-border/40 text-[11px] text-muted flex items-center justify-between">
                  <span>💡 Tip: Add your free Groq key in Settings for deeper LLM reasoning.</span>
                </div>
              )}
            </div>
          )}
          {error && !loading && (
            <div className="text-[13px] text-warning px-3.5 py-2.5 bg-warning-muted rounded-lg border-l-[3px] border-warning flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={14} className="shrink-0" /> {error}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); generateHint(); }}
                className="text-[11px] underline font-semibold cursor-pointer text-warning hover:text-text shrink-0 bg-transparent border-none"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
