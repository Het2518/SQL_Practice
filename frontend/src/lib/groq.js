/**
 * Groq AI Gateway — SQL Practice Platform
 * Model: llama-3.1-8b-instant (cheapest + max rate limits on Groq free tier)
 *   Free tier: 30 RPM | 131,072 TPM | 14,400 RPD
 * Key security: sessionStorage per-tab key → .env fallback (never hardcoded in source)
 * Using sessionStorage (not localStorage) reduces XSS attack surface:
 *   keys are cleared automatically when the tab closes.
 * React hook: see @/hooks/useGroqKey.js
 */

import { api } from '@/lib/api';

// Primary: fastest + cheapest + highest rate limits
export const MODEL_FAST = 'llama-3.1-8b-instant';
// Fallback for complex tasks (mock interview final report)
export const MODEL_SMART = 'llama-3.3-70b-versatile';

// ── Response cache (sessionStorage) to avoid duplicate API calls ──────────────
function getCacheKey(messages, model) {
  const sig = JSON.stringify({ messages, model });
  let hash = 0;
  for (let i = 0; i < sig.length; i++) {
    hash = ((hash << 5) - hash) + sig.charCodeAt(i);
    hash |= 0;
  }
  return `groq-cache-${hash}`;
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > 10 * 60 * 1000) { sessionStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}

function writeCache(key, data) {
  try { sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

/**
 * Core chat completion call.
 * @param {Array} messages  - [{role, content}]
 * @param {string} model    - MODEL_FAST | MODEL_SMART
 * @param {number} maxTokens
 * @param {boolean} useCache - skip API call if identical prompt was answered recently
 * @returns {Promise<string>} - assistant message text
 */
export async function groqChat(messages, model = MODEL_FAST, maxTokens = 512, useCache = true) {
  const cacheKey = getCacheKey(messages, model);
  if (useCache) {
    const cached = readCache(cacheKey);
    if (cached) return cached;
  }

  try {
    const { data } = await api.ai.chat({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.3,
      top_p: 0.9,
    });
    
    const text = data.data?.choices?.[0]?.message?.content?.trim() || '';
    if (useCache) writeCache(cacheKey, text);
    return text;
  } catch (err) {
    if (err.response?.status === 429) throw new Error('RATE_LIMIT');
    if (err.response?.status === 401) throw new Error('BAD_KEY');
    throw new Error(err.response?.data?.message || err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// PROMPT BUILDERS  — kept minimal to reduce token cost
// ═══════════════════════════════════════════════════════════════════════

/**
 * Builds a personalized hint prompt analysing the student's specific mistake.
 * Designed to be SHORT (< 350 input tokens).
 */
export function buildHintPrompt({ question, studentSQL, isCorrect, dbSchema }) {
  const schemaSnippet = dbSchema ? `\nRelevant tables: ${dbSchema.slice(0, 300)}` : '';
  return [
    {
      role: 'system',
      content: `You are a concise SQL interview coach. Analyze the student's SQL query vs the problem requirement and give ONE specific, actionable hint about their mistake. Do NOT reveal the solution. Max 3 sentences. Be direct.`
    },
    {
      role: 'user',
      content: `Problem: ${question.prompt?.slice(0, 300)}${schemaSnippet}
Student SQL: ${studentSQL?.slice(0, 500) || '(empty)'}
Hint for their specific mistake:`
    }
  ];
}

/**
 * Builds an AI solution review prompt showing multiple approaches.
 * Uses slightly more tokens but only called on-demand after correct answer.
 */
export function buildSolutionReviewPrompt({ question, studentSQL, solutionSQL }) {
  return [
    {
      role: 'system',
      content: `You are a senior SQL engineer doing a code review. Be concise and practical. Format your response as JSON with keys: correct (string), incorrect (string|null), optimized_sql (string), alternative_approach (string), complexity (string), tips (string).`
    },
    {
      role: 'user',
      content: `Problem: ${question.prompt?.slice(0, 250)}
Student query: ${studentSQL?.slice(0, 400)}
Reference solution: ${solutionSQL?.slice(0, 400)}
Review JSON:`
    }
  ];
}

/**
 * Builds a safety check prompt. Returns JSON { safe: bool, score: number, warning: string }
 * Kept very short to be cheap and fast (< 200 input tokens).
 */
export function buildSafetyPrompt({ sql, question }) {
  return [
    {
      role: 'system',
      content: `You are a SQL safety checker. Analyze if a SQL query could cause performance issues. Reply ONLY with JSON: {"safe":true/false,"score":0.0-1.0,"warning":"reason if unsafe"}`
    },
    {
      role: 'user',
      content: `Query: ${sql?.slice(0, 400)}
Context: ${question?.prompt?.slice(0, 150) || 'SQL practice'}
JSON:`
    }
  ];
}

/**
 * Builds a RAG-enhanced company-specific question generation prompt.
 */
export function buildRAGQuestionPrompt({ company, companyContext, schemaName, schemaContext, difficulty, topic }) {
  return [
    {
      role: 'system',
      content: `You are a technical interviewer at ${company}. Generate a realistic SQL interview question that uses ONLY the provided database schema. 
IMPORTANT: Do NOT require specific string literals in WHERE clauses (e.g., country = 'USA', status = 'Shipped') because the mock database may not contain those exact strings, which will result in 0 rows returned. Instead, focus on structural logic like joins, aggregations, window functions, rankings, and math. 
The question must be solvable, specific, and mirror real ${company} interview style. Return JSON: {"title":"...","prompt":"...","difficulty":"${difficulty}","hint":"...","topic":"..."}`
    },
    {
      role: 'user',
      content: `Company style: ${companyContext?.slice(0, 400)}
Database: ${schemaName}
Schema tables: ${schemaContext?.slice(0, 1000)}
Topic focus: ${topic || 'any'}
Generate question JSON:`
    }
  ];
}

/**
 * Builds AI mock interviewer turn prompt.
 * Returns JSON: { message: string, followUp: string|null, roundComplete: bool, score: number }
 */
export function buildInterviewerPrompt({ round, question, studentSQL, studentExplanation, history }) {
  const historyStr = history?.slice(-3).map(h => `Q: ${h.q} A: ${h.a}`).join('\n') || '';
  return [
    {
      role: 'system',
      content: `You are a strict but fair SQL technical interviewer conducting round ${round}. Evaluate the student's answer, ask 1 follow-up question if needed, and score. Reply JSON: {"message":"feedback","followUp":"next question or null","roundComplete":true/false,"score":0-100}`
    },
    {
      role: 'user',
      content: `Round ${round} question: ${question?.slice(0, 300)}
Student SQL: ${studentSQL?.slice(0, 400)}
Student explanation: ${studentExplanation?.slice(0, 200) || 'none'}
Previous exchanges: ${historyStr}
Interviewer JSON:`
    }
  ];
}

/**
 * Builds learning analytics roadmap prompt.
 */
export function buildAnalyticsPrompt({ weakTopics, accuracy, totalSolved }) {
  return [
    {
      role: 'system',
      content: `You are a SQL learning coach. Based on performance data, give a personalized 3-step learning roadmap. Be specific. Max 150 words.`
    },
    {
      role: 'user',
      content: `Weak topics: ${weakTopics.join(', ')}
Accuracy: ${accuracy}%
Solved: ${totalSolved} questions
Roadmap:`
    }
  ];
}

/**
 * Builds a prompt to generate reference SQL for an AI-generated challenge.
 * Returns a clean, well-commented SQL solution.
 */
export function buildAiSolutionPrompt({ questionPrompt, schemaContext, db }) {
  return [
    {
      role: 'system',
      content: `You are a senior SQL engineer. Write a correct, efficient SQL solution for the given problem using ONLY the provided schema. 
Return ONLY valid SQL code. You may use markdown fences (\`\`\`sql). Max 30 lines.`,
    },
    {
      role: 'user',
      content: `Database: ${db}
Schema: ${schemaContext?.slice(0, 3000) || 'standard tables'}
Problem: ${questionPrompt?.slice(0, 600)}
SQL Solution:`,
    },
  ];
}

/**
 * Builds a prompt to validate user's SQL against an open-ended AI question.
 * Returns JSON: { correct: bool, score: 0-100, feedback: string, suggestion: string }
 */
export async function generateSchema(userPrompt) {
  const systemPrompt = `You are an expert database architect. The user wants to practice SQL with a specific dataset concept.
Generate valid SQLite statements to create the schema and insert 5-10 rows of realistic sample data.

RULES:
1. Output ONLY valid SQLite statements (CREATE TABLE, INSERT INTO).
2. Do NOT use markdown code blocks (\`\`\`sql). Just plain text.
3. Do NOT provide any explanations.
4. Ensure relationships (foreign keys) make sense.
5. Add IF NOT EXISTS to CREATE TABLE.`;

  try {
    const response = await groqChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], MODEL_SMART, 1024, false);

    // Clean up potential markdown if the model disobeys
    let cleanSql = response.replace(/\`\`\`sql/g, '').replace(/\`\`\`/g, '').trim();
    return cleanSql;
  } catch (err) {
    throw new Error('Failed to generate schema: ' + err.message);
  }
}

export function buildAiValidationPrompt({ questionPrompt, userSQL, sampleRows, schemaContext }) {
  const rowsStr = sampleRows?.length
    ? `\nQuery returned ${sampleRows.length} rows. First 3: ${JSON.stringify(sampleRows.slice(0, 3))}`
    : '\nQuery returned no rows or failed.';
  return [
    {
      role: 'system',
      content: `You are a SQL interview grader. Evaluate whether the student's SQL correctly solves the problem.
Reply ONLY with JSON: {"correct":true/false,"score":0-100,"feedback":"2-3 sentence evaluation","suggestion":"one concrete improvement or null"}`,
    },
    {
      role: 'user',
      content: `Problem: ${questionPrompt?.slice(0, 400)}
Schema: ${schemaContext?.slice(0, 3000) || 'standard DB tables'}
Student SQL: ${userSQL?.slice(0, 600)}${rowsStr}
Grade JSON:`,
    },
  ];
}


export function buildOptimizerPrompt({ question, studentSQL, solutionSQL, schemaContext }) {
  return [
    {
      role: 'system',
      content: `You are a database performance expert. Compare two SQL queries and explain optimizations. Return JSON: {"studentIssues":"...","optimizedSQL":"...","explanation":"...","indexSuggestion":"...","windowAlternative":"..."}`
    },
    {
      role: 'user',
      content: `Problem: ${question?.prompt?.slice(0, 200)}
Schema: ${schemaContext?.slice(0, 300)}
Student: ${studentSQL?.slice(0, 400)}
Reference: ${solutionSQL?.slice(0, 400)}
Optimizer JSON:`
    }
  ];
}

/**
 * Generates 5 MAANG-style SQL interview questions tailored to a user's uploaded dataset.
 * @param {Array}  schema      - [{name, columns:[{name,type,pk}], rowCount}]
 * @param {Object} sampleData  - { tableName: [[row], [row], [row]] }  (first 3 rows per table)
 * @param {number} batch       - batch index (0 = first 5, 1 = next 5…) — used to vary questions
 * Returns JSON array: [{title, difficulty, topic, prompt}]
 */
export function buildSandboxQuestionsPrompt({ schema, sampleData = {}, batch = 0 }) {
  // Build compact schema description
  const schemaStr = schema.map(t => {
    const cols = t.columns.map(c => `${c.name} ${c.type}${c.pk ? ' PK' : ''}`).join(', ');
    const sample = sampleData[t.name];
    const sampleStr = sample && sample.length
      ? `\n    Sample rows: ${JSON.stringify(sample.slice(0, 3))}`
      : '';
    return `Table "${t.name}" (${t.rowCount || '?'} rows): ${cols}${sampleStr}`;
  }).join('\n');

  // Rotate topics so each batch is different
  const topicSets = [
    ['Aggregation + GROUP BY', 'Multi-table JOIN', 'Window Functions (RANK/ROW_NUMBER)', 'CTE with recursion or chaining', 'Subquery with EXISTS or IN'],
    ['Running totals with SUM OVER', 'DENSE_RANK for top-N per group', 'Self-join for comparison', 'Date/time bucketing', 'HAVING with complex conditions'],
    ['Pivot / conditional aggregation', 'Lead/Lag for period-over-period', 'Correlated subquery', 'Set operations (UNION/INTERSECT)', 'NULL handling + COALESCE'],
  ];
  const topics = topicSets[batch % topicSets.length];

  return [
    {
      role: 'system',
      content: `You are a senior SQL interviewer at a FAANG/MAANG company (Google, Meta, Amazon, Apple, Netflix).
Generate exactly 5 SQL interview questions that could realistically be asked in a data engineering or analytics interview round.

STRICT RULES:
1. Use ONLY the tables and columns defined in the schema below — no invented columns.
2. Do NOT use specific string literals in WHERE clauses (e.g. country = 'USA') — the sample data may differ. Focus on structural logic.
3. Each question must exercise a different SQL concept from the provided topic list.
4. Make questions specific, realistic, and answerable using SQL and the given schema.
5. Vary difficulty: include 2 Easy, 2 Medium, 1 Hard.
6. Return ONLY a valid JSON array — no markdown, no explanation outside JSON.

Output format:
[
  {"title":"...", "difficulty":"Easy|Medium|Hard", "topic":"...", "prompt":"Full interview question text..."},
  ...
]`
    },
    {
      role: 'user',
      content: `Database Schema:
${schemaStr}

Topic areas to cover (one per question):
${topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Generate 5 interview questions JSON array:`
    }
  ];
}
