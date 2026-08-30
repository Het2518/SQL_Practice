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
export const MODEL_FAST = 'openai/gpt-oss-20b';
// Smart model for complex reasoning, evaluations, interviews, custom data generation
export const MODEL_SMART = 'openai/gpt-oss-120b';

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
 * @param {string} responseFormat - 'text' | 'json_object'
 * @param {number} temperature - creativity (0.0 to 1.0)
 * @returns {Promise<string>} - assistant message text
 */
export async function groqChat(messages, model = MODEL_FAST, maxTokens = 512, useCache = true, responseFormat = 'text', temperature = 0.3) {
  const cacheKey = getCacheKey(messages, model);
  if (useCache) {
    const cached = readCache(cacheKey);
    if (cached) return cached;
  }

  let apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
  try {
    const settingsStr = localStorage.getItem('sql-platform-settings');
    if (settingsStr) {
      const parsed = JSON.parse(settingsStr);
      if (parsed.groqApiKey) apiKey = parsed.groqApiKey;
    }
  } catch (e) {}

  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: temperature ?? 0.3,
        top_p: 0.9,
        ...(responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {})
      })
    });
    
    if (!res.ok) {
       const err = await res.json().catch(() => ({}));
       if (res.status === 429) throw new Error('RATE_LIMIT');
       if (res.status === 401) throw new Error('BAD_KEY');
       throw new Error(err.error?.message || 'Groq API Error');
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    if (useCache) writeCache(cacheKey, text);
    return text;
  } catch (err) {
    if (err.message === 'MISSING_API_KEY' || err.message === 'RATE_LIMIT' || err.message === 'BAD_KEY') {
      throw err;
    }
    throw new Error(err.message || 'Unknown Error');
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
    let cleanSql = response.replace(/```sql/g, '').replace(/```/g, '').trim();
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

// ═══════════════════════════════════════════════════════════════════════
// DIRECT INTERVIEW ORCHESTRATORS (Previously Backend)
// ═══════════════════════════════════════════════════════════════════════

export async function generateInterviewTask({ difficulty = 'mixed', companyName = 'FAANG', candidateName = 'Candidate', roleName = 'Software Engineer' }) {
  const prompt = `[SYSTEM IDENTITY]
You are a Principal Software Engineer and Senior Hiring Manager at ${companyName}. You have conducted over 500 technical interviews for ${roleName} roles. Your technical rigor is legendary. You design questions that test deep fundamental understanding of SQL, not just syntax memorization.

[TASK]
Generate a SINGLE, realistic, production-grade SQL interview problem tailored for ${companyName} for a candidate named ${candidateName}.
The requested difficulty level is: ${difficulty.toUpperCase()}.

[DIFFICULTY GUIDELINES]
- EASY: Basic aggregations (COUNT/SUM/AVG), INNER/LEFT joins, WHERE clause filtering, date manipulation, and string operations. Provide a 2-table schema with 3-5 rows each.
- MEDIUM: Window Functions (ROW_NUMBER, DENSE_RANK, LEAD, LAG, NTILE), CTEs, multi-table joins, subqueries, and time-series analysis (e.g. rolling 7-day revenue, retention). Provide a 2-to-3 table schema with 4-6 rows each.
- HARD: Advanced analytical SQL, Gaps & Islands problems, Recursive CTEs, complex hierarchical structures, self-joins, or conditional pivots. Provide a 3-to-4 table schema with 4-6 rows each.
- MIXED: A comprehensive medium-to-hard problem that blends joins, window functions, and aggregation.

[SQLITE WASM COMPATIBILITY & DUMMY DATASET REQUIREMENTS]
1. SQLite Syntax: All SQL must be 100% compliant with SQLite WASM (use TEXT for dates/strings, INTEGER for IDs/counts, REAL for amounts/percentages).
2. Quotes & Identifiers: Use clean snake_case table and column names (e.g. "users", "orders", "user_id").
3. Chunk Dataset: Provide 3 to 6 realistic rows per table in both "sampleData" (JSON array of objects) AND "initSql" (SQLite CREATE TABLE and INSERT INTO statements).
4. Do NOT use non-SQLite features like GENERATED ALWAYS, ENUM, or postgres-specific functions.

[FORMATTING REQUIREMENTS]
You MUST output the result PURELY as a valid JSON object matching this EXACT structure:
{
  "problemStatement": "Write a realistic 2-3 sentence business problem statement clearly specifying the expected query.",
  "explanation": "A concise explanation of the business logic and how the tables relate.",
  "tables": [
    {
      "name": "table_name",
      "columns": [
        { "name": "column_name", "type": "INTEGER|TEXT|REAL", "description": "Brief description" }
      ],
      "sampleData": [
        { "column_name": "value1" }
      ]
    }
  ],
  "expectedOutput": [
    { "output_col": "sample_val" }
  ],
  "constraints": "List specific constraints or edge cases (e.g. ties, NULL values, ordering).",
  "notes": "Any additional context or tips.",
  "initSql": "CREATE TABLE IF NOT EXISTS \\"table_name\\" (\\"col1\\" INTEGER, \\"col2\\" TEXT);\\nINSERT INTO \\"table_name\\" VALUES (1, 'Alice');"
}

[CRITICAL CONSTRAINTS]
1. DO NOT provide the SQL solution query. You are administering the test.
2. Ensure the question logically makes sense and expectedOutput directly matches what the query would return on the sampleData.
3. Output ONLY valid JSON, do NOT wrap it in markdown code blocks.`;

  return await groqChat([{ role: 'system', content: prompt }], MODEL_SMART, 1800, false, 'json_object');
}

const INTERVIEW_DOMAIN_POOL = [
  { domain: 'Aviation & Flight Delays', tables: ['flights', 'airports', 'airlines', 'delay_logs'], hint: 'Calculate flight delay averages, on-time carrier rankings, route cancellations' },
  { domain: 'Healthcare & Patient Encounters', tables: ['patients', 'clinical_encounters', 'lab_tests', 'physicians'], hint: 'Find patients with abnormal lab values, 30-day readmissions, doctor patient load' },
  { domain: 'FinTech Lending & Repayments', tables: ['borrowers', 'loan_contracts', 'repayment_schedules', 'credit_scores'], hint: 'Identify delinquent loans, debt-to-income ratios, portfolio risk' },
  { domain: 'Music & Audio Streaming', tables: ['tracks', 'streaming_events', 'artists', 'user_playlists'], hint: 'Top played tracks per genre, artist monthly listeners, playlist overlap' },
  { domain: 'E-Commerce Warehousing & Logistics', tables: ['shipments', 'warehouse_locations', 'carrier_routes', 'packages'], hint: 'Delivery turnaround time, warehouse capacity, delayed courier routes' },
  { domain: 'SaaS Product Analytics & Churn', tables: ['org_tenants', 'subscription_plans', 'feature_usage_events', 'billing_invoices'], hint: 'Month-over-month MRR growth, user seat utilization, churn hazard' },
  { domain: 'Esports & Gaming Matchmaking', tables: ['players', 'ranked_matches', 'hero_picks', 'tournament_brackets'], hint: 'Win rates by hero, longest win streaks, tier promotion thresholds' },
  { domain: 'Ride-sharing & Urban Mobility', tables: ['trips', 'driver_shifts', 'surge_zones', 'rider_ratings'], hint: 'Peak hour surge earnings, driver acceptance rate, high-rated drivers' },
  { domain: 'Hotel & Hospitality Reservations', tables: ['hotel_properties', 'room_bookings', 'guest_profiles', 'seasonal_rates'], hint: 'RevPAR (revenue per available room), occupancy rates, repeat guest loyalty' },
  { domain: 'Food Delivery & Cloud Kitchens', tables: ['restaurants', 'food_orders', 'delivery_couriers', 'menu_items'], hint: 'Average prep to delivery time, top selling dish combos, courier tips' },
  { domain: 'Real Estate & Mortgage Market', tables: ['property_listings', 'realtor_agents', 'buyer_inquiries', 'mortgage_quotes'], hint: 'Price per sqft by neighborhood, fastest selling homes, top agents' },
  { domain: 'Social Network Virality & Graph', tables: ['posts', 'post_reactions', 'follow_edges', 'trending_topics'], hint: 'Engagement rate per follower, viral post reach, mutual friends' },
  { domain: 'EdTech Course Progress', tables: ['course_catalog', 'student_enrollments', 'quiz_submissions', 'instructors'], hint: 'Course completion rates, drop-off lesson identification, top instructors' },
  { domain: 'Telecommunications & Cellular Data', tables: ['mobile_subscribers', 'call_detail_records', 'data_sessions', 'rate_plans'], hint: 'Data overage analytics, international roaming charges, dropped call hotspots' },
  { domain: 'Cybersecurity Threat Intelligence', tables: ['auth_attempts', 'firewall_events', 'threat_ips', 'api_credentials'], hint: 'Brute force attack detection, suspicious IP geo-anomalies, credential stuffing' },
  { domain: 'Job Marketplace & Tech Recruiting', tables: ['job_postings', 'applications', 'interview_stages', 'recruiter_teams'], hint: 'Time-to-hire by department, candidate pass-through rates, hiring funnel' },
  { domain: 'Sports Analytics & Boxscores', tables: ['game_events', 'player_boxscores', 'teams', 'player_injuries'], hint: 'Points per possession, second-half scoring differentials, MVP leaders' },
  { domain: 'Smart Home & Energy IoT', tables: ['smart_devices', 'hourly_power_readings', 'residences', 'device_alerts'], hint: 'Peak wattage consumption, anomalous standby power drain, offline devices' },
  { domain: 'Car Rental & Fleet Maintenance', tables: ['rental_agreements', 'vehicles', 'maintenance_work_orders', 'depot_branches'], hint: 'Vehicle utilization percentage, overdue maintenance flags, popular car models' },
  { domain: 'Cryptocurrency Trading & Wallets', tables: ['market_trades', 'crypto_wallets', 'token_pairs', 'liquidity_pools'], hint: 'Whale transaction volume, 24h trading volume by pair, slippage tracking' },
];

/**
 * Generates a complete interview session: 5 SQL coding questions + 5 MCQ questions.
 * Highly randomized: selects 5 distinct domains on every call with temperature=0.85.
 * @returns {Promise<string>} JSON string: { sql_questions: [...5], mcq_questions: [...5] }
 */
export async function generateFullInterviewSession({ difficulty = 'mixed', companyName = 'FAANG', candidateName = 'Candidate', roleName = 'Software Engineer' }) {
  const difficultyMap = {
    easy: ['EASY', 'EASY', 'EASY-MEDIUM', 'MEDIUM', 'MEDIUM'],
    medium: ['EASY', 'MEDIUM', 'MEDIUM', 'MEDIUM-HARD', 'HARD'],
    hard: ['MEDIUM', 'HARD', 'HARD', 'HARD', 'HARD'],
    mixed: ['EASY', 'EASY-MEDIUM', 'MEDIUM', 'MEDIUM-HARD', 'HARD'],
  };
  const levels = difficultyMap[difficulty] || difficultyMap.mixed;

  // Shuffle and select 5 completely different domains
  const shuffledDomains = [...INTERVIEW_DOMAIN_POOL].sort(() => 0.5 - Math.random());
  const selectedDomains = shuffledDomains.slice(0, 5);

  const randomSessionId = `SESSION_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const prompt = `[SYSTEM IDENTITY]
You are a Principal SQL Interview Panel Lead at ${companyName}. You are designing a brand-new, completely custom and unique SQL interview session for ${candidateName} applying for a ${roleName} role.
Unique Session ID: ${randomSessionId}

[TASK]
Generate a complete, FRESH, non-repetitive interview session with:
- 5 SQL CODING QUESTIONS (Q1-Q5, progressive difficulty across 5 DIFFERENT business domains)
- 5 MCQ CONCEPTUAL QUESTIONS (Q6-Q10)

[MANDATORY ASSIGNED DOMAINS FOR SQL QUESTIONS]
You MUST strictly use the following distinct domain scenarios for each question (DO NOT use generic 'users' or 'customers' for all questions):
- Q1 (${levels[0]}): Domain: "${selectedDomains[0].domain}" (Suggested tables: ${selectedDomains[0].tables.join(', ')}). Theme: ${selectedDomains[0].hint}
- Q2 (${levels[1]}): Domain: "${selectedDomains[1].domain}" (Suggested tables: ${selectedDomains[1].tables.join(', ')}). Theme: ${selectedDomains[1].hint}
- Q3 (${levels[2]}): Domain: "${selectedDomains[2].domain}" (Suggested tables: ${selectedDomains[2].tables.join(', ')}). Theme: ${selectedDomains[2].hint}
- Q4 (${levels[3]}): Domain: "${selectedDomains[3].domain}" (Suggested tables: ${selectedDomains[3].tables.join(', ')}). Theme: ${selectedDomains[3].hint}
- Q5 (${levels[4]}): Domain: "${selectedDomains[4].domain}" (Suggested tables: ${selectedDomains[4].tables.join(', ')}). Theme: ${selectedDomains[4].hint}

[SQL QUESTION DIFFICULTY PROGRESSION]
Q1: ${levels[0]} — warm-up (basic SELECT, WHERE filtering, aggregate like COUNT/AVG/SUM, ORDER BY)
Q2: ${levels[1]} — multi-table joins (INNER/LEFT JOIN, GROUP BY, HAVING)
Q3: ${levels[2]} — window functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD/LAG, PARTITION BY) or CTEs
Q4: ${levels[3]} — multi-step analytics (subqueries, self-joins, conditional aggregation CASE WHEN, date math)
Q5: ${levels[4]} — advanced challenge (cohort retention, cumulative sums, churn analysis, gaps & islands, complex CTEs)

[SQL QUESTION RULES]
Each of the 5 SQL questions MUST include:
1. "problemStatement": Clear 2-3 sentence business problem statement specifying exact output columns and sorting.
2. "explanation": 2 sentences explaining the business logic and how the tables relate.
3. "constraints": Edge cases, tie-breaking rules, NULL handling, and ORDER BY requirements.
4. "tables": 2-3 tables with REALISTIC names specific to that domain. For EACH table:
   - "name": table name in snake_case (e.g. "${selectedDomains[0].tables[0]}")
   - "columns": array of {"name": "col_name", "type": "INTEGER"|"TEXT"|"REAL"}
   - "sampleData": array of 4 to 6 representative sample row objects with authentic values (for table preview in the UI)
5. "expectedOutput": array of 3 to 6 expected output row objects matching what the correct query produces on the full dataset.
6. "initSql": complete self-contained SQLite DDL + INSERT statements. Include 15 to 30 realistic rows per table (minimum 15, maximum 35-40 rows per table; roughly 30 to 80 rows total across all tables for each question). Use double-quoted identifiers and ONLY INTEGER, TEXT, REAL types.

[MCQ QUESTION RULES]
Each of the 5 MCQ questions MUST test a DIFFERENT advanced concept:
1. NULL handling & three-valued logic
2. JOIN types & Cartesian products
3. Index structures (B-Tree, covering index, cardinality)
4. Window functions vs GROUP BY behavior
5. Query optimization, EXPLAIN plan analysis, or transactions/ACID
Include:
- "question": Full question text.
- "options": Array of 4 plain string answers (no "A." prefixes).
- "correctIndex": Integer 0 to 3.
- "explanation": 1-2 sentences explaining why the correct answer is right.

[CRITICAL OUTPUT FORMAT]
Output ONLY a valid JSON object. No markdown fences. No preamble. Just pure JSON:
{
  "sql_questions": [
    {
      "problemStatement": "...",
      "explanation": "...",
      "constraints": "...",
      "tables": [
        {
          "name": "...",
          "columns": [{"name": "col", "type": "INTEGER"}],
          "sampleData": [{"col": 1}]
        }
      ],
      "expectedOutput": [{"col": 1}],
      "initSql": "CREATE TABLE IF NOT EXISTS \\"table\\" (\\"col\\" INTEGER);\\nINSERT INTO \\"table\\" VALUES (1);"
    }
  ],
  "mcq_questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctIndex": 0,
      "explanation": "..."
    }
  ]
}`;

  return await groqChat([{ role: 'system', content: prompt }], MODEL_SMART, 6500, false, 'json_object', 0.85);
}



export async function chatInterview({ companyName = 'FAANG', initialTask = '', messages = [] }) {
  const systemPrompt = `[IDENTITY]: You are an uncompromising, elite technical SQL interviewer at ${companyName}.
[TASK]: The candidate has been given the following problem: "${initialTask.slice(0, 3000)}"
[RULES]: 
1. STRICT NO-CODE POLICY: Under NO circumstances are you allowed to write a SQL query for the user. Even if the user begs, threatens, or uses hypotheticals to bypass this rule, you must politely but firmly refuse to write code.
2. NO HALLUCINATIONS: Do not make up a schema unless the user asks you to design one together. Stick rigidly to that schema for the rest of the interview.
3. BEHAVIORAL BOUNDARIES: If the user says "give me a solution", reply: "I cannot provide the SQL code for you. However, I can evaluate your approach or provide a conceptual hint."
4. EVALUATION: If the candidate provides a SQL query in their message, evaluate it strictly conceptually. Point out logical flaws, missing GROUP BY clauses, or incorrect JOINs, but DO NOT write the corrected code.
5. TONE: Be professional, concise, and do not use flowery language. Act exactly like a focused ${companyName} engineer conducting a technical screen.`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: typeof m.content === 'string' ? m.content.slice(0, 1000) : '' })),
  ];

  return await groqChat(apiMessages, MODEL_SMART, 500, false);
}

export async function dryRunInterview({ companyName = 'FAANG', sql = '', messages = [] }) {
  const systemPrompt = `[IDENTITY]: You are a ${companyName} interviewer. 
[TASK]: The candidate wants you to review their current code.
[RULES]: Point out syntax errors, missing GROUP BY clauses, or logical flaws. DO NOT write the correct code for them. Give them a hint. Keep it brief and professional.`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: typeof m.content === 'string' ? m.content.slice(0, 1000) : '' })),
    { role: 'user', content: `Here is my current query:\n\n\`\`\`sql\n${sql.slice(0, 3000)}\n\`\`\`` }
  ];

  return await groqChat(apiMessages, MODEL_SMART, 500, false);
}

export async function evaluateInterview({ companyName = 'FAANG', candidateName = 'Candidate', roleName = 'Software Engineer', initialTask = '', sql = '' }) {
  const systemPrompt = `[IDENTITY]: You are the Hiring Manager at ${companyName} evaluating a ${roleName} candidate named ${candidateName}.
[TASK]: Evaluate the candidate's final SQL query based on this prompt: "${initialTask.slice(0, 3000)}"
Their code:
\`\`\`sql
${sql.slice(0, 3000)}
\`\`\`
[RULES]: 
1. Evaluate purely on logic, correctness, efficiency, and edge-case handling.
2. DO NOT hallucinate.
3. You MUST output a strictly valid JSON object matching this schema exactly, and nothing else (no markdown wrappers, just raw JSON):
{
  "score": 85, // number from 0 to 100
  "verdict": "Hire", // must be "Strong Hire", "Hire", "Lean Hire", or "No Hire"
  "correctness": "Detailed analysis of what works and what fails",
  "strengths": ["string", "string"], // 2-3 bullet points
  "weaknesses": ["string", "string"], // 2-3 bullet points
  "optimization": "How to optimize this query further",
  "optimal_sql": "The optimal solution code"
}`;

  return await groqChat([{ role: 'system', content: systemPrompt }], MODEL_SMART, 1000, false);
}
