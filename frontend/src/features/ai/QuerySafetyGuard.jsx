import React, { useState, useCallback, useRef } from 'react';
import { groqChat, buildSafetyPrompt } from '@/lib/groq';

/**
 * useQuerySafetyGuard — Hook that pre-checks SQL before execution.
 * Runs a very small, cheap prompt (< 200 tokens) to detect:
 *   - Cartesian products (missing JOIN conditions)
 *   - Recursive CTEs without base case
 *   - Extremely expensive aggregations
 *   - Cross joins on large tables
 *
 * Returns: { checkSafety, SafetyModal }
 *
 * Usage:
 *   const { checkSafety, SafetyModal } = useQuerySafetyGuard();
 *   const ok = await checkSafety(sql, question);
 *   if (ok) runQuery();
 *   <SafetyModal />  (renders nothing when not shown)
 */
export function useQuerySafetyGuard() {
  const [modal, setModal] = useState(null); // null | { warning, score, resolve }
  const hasKey = true;

  // Client-side pre-check to avoid API call for obviously safe queries
  function clientPreCheck(sql) {
    const up = sql.toUpperCase().trim();
    const issues = [];
    // Cartesian product check: multiple FROM items with comma but no WHERE JOIN
    if (/FROM\s+\w+\s*,\s*\w+/i.test(sql) && !/WHERE\s+\w+\.\w+\s*=\s*\w+\.\w+/i.test(sql)) {
      issues.push('Possible Cartesian product: cross join without a WHERE condition');
    }
    // Missing FROM check
    if (up.includes('SELECT') && !up.includes('FROM')) return null; // might be valid
    // Recursive CTE without UNION ALL
    if (up.includes('RECURSIVE') && !up.includes('UNION ALL')) {
      issues.push('Recursive CTE missing UNION ALL base case');
    }
    return issues.length > 0 ? issues[0] : null;
  }

  const checkSafety = useCallback(async (sql, question) => {
    if (!sql?.trim() || sql.length < 20) return true; // trivially safe

    // Client-side check first (free, instant)
    const clientIssue = clientPreCheck(sql);
    if (clientIssue) {
      // Show warning immediately based on client analysis
      return new Promise((resolve) => {
        setModal({ warning: clientIssue, score: 0.25, resolve, source: 'analysis' });
      });
    }

    // Only call LLM for complex queries that passed client check
    if (!hasKey || sql.length < 80) return true;

    try {
      const messages = buildSafetyPrompt({ sql, question });
      const raw = await groqChat(messages, undefined, 80, true); // only 80 tokens needed
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return true; // parse failure = assume safe
      const result = JSON.parse(jsonMatch[0]);

      if (result.safe === false && result.score < 0.45) {
        return new Promise((resolve) => {
          setModal({ warning: result.warning || 'Potentially expensive query detected.', score: result.score, resolve, source: 'ai' });
        });
      }
    } catch {
      // Any error = assume safe (don't block the student)
    }
    return true;
  }, []);

  const handleProceed = useCallback(() => {
    if (modal?.resolve) modal.resolve(true);
    setModal(null);
  }, [modal]);

  const handleCancel = useCallback(() => {
    if (modal?.resolve) modal.resolve(false);
    setModal(null);
  }, [modal]);

  function SafetyModal() {
    if (!modal) return null;
    const safeScore = modal.score;
    const fillColor = safeScore < 0.3 ? 'var(--error)' : safeScore < 0.6 ? 'var(--warning)' : 'var(--success)';
    const fillPercent = Math.round(safeScore * 100);

    return (
      <div className="safety-overlay" onClick={handleCancel}>
        <div className="safety-modal" onClick={e => e.stopPropagation()}>
          <div className="safety-icon">⚠️</div>

          <h3 className="text-base font-bold mb-2 text-text">
            Potential Query Issue Detected
          </h3>
          <p className="text-[13px] text-text-secondary leading-[1.6] mb-4">
            {modal.warning}
          </p>

          {/* Safety score bar */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5 text-xs text-muted">
              <span>{modal.source === 'ai' ? '🤖 AI Safety Score' : '🔍 Client Analysis'}</span>
              <span className="font-bold" style={{ color: fillColor }}>{fillPercent}% safe</span>
            </div>
            <div className="safety-score-bar">
              <div
                className="safety-score-fill"
                style={{ width: `${fillPercent}%`, background: fillColor }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="btn btn-ghost flex-1 justify-center font-semibold"
              onClick={handleCancel}
            >
              ✏️ Edit Query
            </button>
            <button
              className="btn btn-primary flex-1 justify-center font-semibold bg-error border-error hover:bg-error/90 hover:border-error/90"
              onClick={handleProceed}
            >
              ▶ Run Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return { checkSafety, SafetyModal };
}
