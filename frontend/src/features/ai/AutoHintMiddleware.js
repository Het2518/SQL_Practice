/**
 * AutoHintMiddleware — Smart client-side SQL analysis before calling LLM.
 * Analyzes SQL across 4 dimensions:
 *   A. Keywords present
 *   B. Missing keywords
 *   C. Constraints & logic validation
 *   D. Expression analysis
 *
 * Returns a specific, targeted hint without calling the LLM if possible.
 * Only escalates to LLM when client analysis is inconclusive.
 */

// ── A. Keywords presence check ──────────────────────────────────────────────
export function analyzeKeywords(sql) {
  const up = sql.toUpperCase();
  return {
    hasSelect: /\bSELECT\b/.test(up),
    hasFrom: /\bFROM\b/.test(up),
    hasWhere: /\bWHERE\b/.test(up),
    hasGroupBy: /\bGROUP\s+BY\b/.test(up),
    hasHaving: /\bHAVING\b/.test(up),
    hasOrderBy: /\bORDER\s+BY\b/.test(up),
    hasJoin: /\bJOIN\b/.test(up),
    hasDistinct: /\bDISTINCT\b/.test(up),
    hasLimit: /\bLIMIT\b/.test(up),
    hasWindowFn: /\bOVER\s*\(/.test(up),
    hasCte: /\bWITH\s+\w+\s+AS\s*\(/.test(up),
    hasUnion: /\bUNION\b/.test(up),
    hasExists: /\bEXISTS\s*\(/.test(up),
    hasAggregate: /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/.test(up),
    hasSubquery: /SELECT[^;]+(FROM|WHERE)[^;]+\(SELECT/.test(up),
    hasCase: /\bCASE\b/.test(up),
    hasRankFn: /\b(RANK|DENSE_RANK|ROW_NUMBER|NTILE)\s*\(/.test(up),
    hasLagLead: /\b(LAG|LEAD)\s*\(/.test(up),
  };
}

// ── B. Missing keyword detection by question context ─────────────────────────
export function detectMissingKeywords(sql, question) {
  const up = sql.toUpperCase();
  const qLower = (question?.prompt || '').toLowerCase();
  const hints = [];

  // Aggregation without GROUP BY
  if (/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/.test(up) && !/\bGROUP\s+BY\b/.test(up) && !/\bOVER\s*\(/.test(up)) {
    hints.push('You are using an aggregate function (COUNT/SUM/AVG) but missing GROUP BY. Either group your results or use it with a window function using OVER().');
  }

  // HAVING without GROUP BY
  if (/\bHAVING\b/.test(up) && !/\bGROUP\s+BY\b/.test(up)) {
    hints.push('HAVING clause requires a GROUP BY. Add GROUP BY before the HAVING clause.');
  }

  // Question mentions "top N" but no ORDER BY + LIMIT
  if ((qLower.includes('top ') || qLower.includes('highest') || qLower.includes('lowest')) && !/\bORDER\s+BY\b/.test(up)) {
    hints.push('The question asks for top/highest/lowest records. You likely need ORDER BY with DESC/ASC and LIMIT.');
  }

  // Question mentions "each" or "per" — likely needs GROUP BY
  if ((qLower.includes(' each ') || qLower.includes(' per ') || qLower.includes('by department') || qLower.includes('by category')) && !/\bGROUP\s+BY\b/.test(up)) {
    hints.push('The question uses "each" or "per" — this typically requires GROUP BY to group results by the specified column.');
  }

  // Question mentions "duplicate" but no DISTINCT
  if (qLower.includes('duplic') && !/\bDISTINCT\b/.test(up) && !/\bGROUP\s+BY\b/.test(up)) {
    hints.push('To remove duplicates, use SELECT DISTINCT or GROUP BY.');
  }

  // Question mentions "rank" / "nth highest" but no ranking function
  if ((qLower.includes('rank') || qLower.includes('nth') || qLower.includes('second highest') || qLower.includes('third highest')) && !/\b(RANK|DENSE_RANK|ROW_NUMBER)\s*\(/.test(up)) {
    hints.push('For ranking queries, consider using RANK(), DENSE_RANK(), or ROW_NUMBER() window functions with OVER(ORDER BY ...).');
  }

  return hints;
}

// ── C. Constraint & logic validation ─────────────────────────────────────────
export function validateLogic(sql, question) {
  const up = sql.toUpperCase();
  const issues = [];

  // JOIN without ON condition
  const joinWithoutOn = /\b(INNER|LEFT|RIGHT|FULL)\s+JOIN\s+\w+\s+(?:AS\s+\w+\s+)?(?!ON\b)/i.test(sql);
  if (joinWithoutOn) {
    issues.push('Your JOIN is missing an ON condition. Add ON table1.column = table2.column to specify how the tables relate.');
  }

  // SELECT * in aggregation context
  if (/SELECT\s+\*/.test(up) && /\bGROUP\s+BY\b/.test(up)) {
    issues.push('Using SELECT * with GROUP BY is typically incorrect. List only the grouped columns and aggregate expressions explicitly.');
  }

  // Wrong NULL handling (= NULL instead of IS NULL)
  if (/WHERE.+=\s*NULL\b/i.test(sql)) {
    issues.push('To check for NULL values, use IS NULL instead of = NULL. NULL comparisons with = always return false in SQL.');
  }

  // HAVING with non-aggregate expression
  if (/HAVING\s+\w+\s*[><=]/i.test(sql) && !/HAVING\s+(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(sql)) {
    issues.push('HAVING typically filters on aggregate values like HAVING COUNT(*) > 5. Use WHERE for non-aggregate conditions.');
  }

  // Subquery in SELECT returning multiple rows
  if (/SELECT\s+\(SELECT/i.test(sql) && !/LIMIT\s+1\b/i.test(sql)) {
    issues.push('A scalar subquery in SELECT must return only one row. Consider adding LIMIT 1, or use a JOIN instead.');
  }

  return issues;
}

// ── D. Expression analysis ───────────────────────────────────────────────────
export function analyzeExpressions(sql) {
  const up = sql.toUpperCase();
  const warnings = [];

  // Window function without ORDER BY in partition
  if (/\b(RANK|DENSE_RANK|ROW_NUMBER|LAG|LEAD)\s*\(/i.test(sql) && !/OVER\s*\([^)]*ORDER\s+BY/i.test(sql)) {
    warnings.push('Your window function (RANK/ROW_NUMBER/LAG/LEAD) needs ORDER BY inside the OVER() clause: RANK() OVER (ORDER BY column DESC).');
  }

  // LAG/LEAD without offset
  // (ok to leave, just informational)

  // CASE without END
  const caseCount = (up.match(/\bCASE\b/g) || []).length;
  const endCount = (up.match(/\bEND\b/g) || []).length;
  if (caseCount > endCount) {
    warnings.push('Your CASE expression is missing END. Every CASE must be closed with END.');
  }

  return warnings;
}

// ── Master function: runs all checks, returns best hint ─────────────────────
/**
 * @param {string} sql - student SQL
 * @param {object} question - { prompt, ... }
 * @returns {{ hint: string|null, shouldCallLLM: boolean }}
 */
export function runAutoHintAnalysis(sql, question) {
  if (!sql || sql.trim().length < 5) {
    return { hint: 'Start by writing a SELECT statement.', shouldCallLLM: false };
  }

  // Run all checks
  const missing = detectMissingKeywords(sql, question);
  if (missing.length > 0) return { hint: missing[0], shouldCallLLM: false };

  const logic = validateLogic(sql, question);
  if (logic.length > 0) return { hint: logic[0], shouldCallLLM: false };

  const expressions = analyzeExpressions(sql);
  if (expressions.length > 0) return { hint: expressions[0], shouldCallLLM: false };

  // Client analysis inconclusive → escalate to LLM
  return { hint: null, shouldCallLLM: true };
}
