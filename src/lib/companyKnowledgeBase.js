/**
 * Company Knowledge Base — RAG Context Data
 * Static JS object (no vector DB needed at this scale).
 * Each entry provides curated context for LLM prompt injection.
 * Companies: Amazon, Google, Microsoft, Uber, Walmart, Goldman Sachs,
 *            Adobe, Atlassian, Flipkart, Oracle, Meta, Apple, Netflix, Stripe
 */

export const COMPANY_KB = {
  amazon: {
    name: 'Amazon',
    emoji: '📦',
    color: '#FF9900',
    style: 'Amazon interviews focus on large-scale data analysis, supply chain optimization, customer behavior analysis, and seller performance metrics. Questions involve massive datasets with billions of rows. They test window functions, complex aggregations, and query optimization heavily.',
    topics: ['Window Functions', 'Aggregations', 'CTEs', 'Self Joins', 'Date/Time Functions', 'Subqueries', 'Ranking Functions'],
    difficulty: { easy: 15, medium: 45, hard: 40 },
    patterns: [
      'Identify top-N products/sellers/warehouses by performance metric',
      'Week-over-week / month-over-month growth calculations',
      'Customer retention and churn analysis',
      'Supply chain bottleneck identification',
      'Prime membership funnel analysis',
      'Shipment delay root cause queries',
    ],
    experiences: [
      'I was asked to find sellers with declining sales for 3 consecutive months using window functions.',
      'The interviewer gave me an orders table with 500M rows and asked to optimize a GROUP BY query.',
      'They asked me to calculate rolling 7-day average delivery times per warehouse region.',
    ],
    recommendedTopics: ['RANK() / DENSE_RANK()', 'LAG() / LEAD()', 'DATE_TRUNC / STRFTIME', 'Self-joins for time series', 'CTEs for multi-step analysis'],
    interviewRounds: 4,
    avgDifficulty: 'Hard',
  },

  google: {
    name: 'Google',
    emoji: '🔍',
    color: '#4285F4',
    style: 'Google emphasizes analytical thinking, data quality, and search/ads performance metrics. They test knowledge of complex JOINs, data deduplication, funnel analysis, and A/B test result computation. Questions often involve ad impressions, click-through rates, and user engagement.',
    topics: ['Complex JOINs', 'Deduplication', 'Funnel Analysis', 'Window Functions', 'Set Operations', 'NULL Handling', 'CTEs'],
    difficulty: { easy: 10, medium: 40, hard: 50 },
    patterns: [
      'Ad click-through rate and conversion funnel analysis',
      'Search query performance and ranking analysis',
      'User engagement metrics (DAU/MAU ratios)',
      'Deduplication of event logs',
      'A/B test statistical significance queries',
      'YouTube watch time cohort analysis',
    ],
    experiences: [
      'They asked to find the percentage of users who searched and then clicked within 30 seconds.',
      'I had to deduplicate a user events table where the same event could appear multiple times.',
      'The question involved computing retention rates for a new Google feature rollout.',
    ],
    recommendedTopics: ['DISTINCT ON / ROW_NUMBER deduplication', 'Self-joins for session analysis', 'CASE WHEN for metric computation', 'Percentile window functions', 'UNION vs UNION ALL tradeoffs'],
    interviewRounds: 5,
    avgDifficulty: 'Hard',
  },

  microsoft: {
    name: 'Microsoft',
    emoji: '🪟',
    color: '#00BCF2',
    style: 'Microsoft SQL interviews focus on enterprise data scenarios — Azure usage, Teams collaboration data, Office 365 telemetry, and sales pipeline analysis. They expect strong knowledge of T-SQL constructs, query optimization, and complex business logic translation.',
    topics: ['CTEs', 'Window Functions', 'Pivoting', 'Date Functions', 'Aggregations', 'Subqueries', 'NULL Handling'],
    difficulty: { easy: 20, medium: 50, hard: 30 },
    patterns: [
      'Sales pipeline conversion and forecasting',
      'Azure service usage billing computation',
      'Teams meeting attendance and engagement metrics',
      'Product adoption funnel by user segment',
      'Support ticket resolution SLA analysis',
      'License utilization across enterprise accounts',
    ],
    experiences: [
      'Asked to compute the median response time for support tickets by category using window functions.',
      'Had to write a query to find all customers using Azure who had not renewed in the last 90 days.',
      'They asked to pivot monthly sales data per product line into a report format.',
    ],
    recommendedTopics: ['PIVOT / CASE WHEN pivoting', 'Recursive CTEs', 'DATEDIFF / DATEADD', 'Running totals with SUM() OVER', 'Query plan optimization'],
    interviewRounds: 4,
    avgDifficulty: 'Medium',
  },

  uber: {
    name: 'Uber',
    emoji: '🚗',
    color: '#000000',
    style: 'Uber interviews are heavily focused on real-time geo-spatial data, driver-rider matching, trip pricing, and surge analysis. Expect complex multi-table joins across trips, drivers, riders, and location data. They test edge cases like incomplete trips and NULL coordinates.',
    topics: ['Multi-table JOINs', 'Aggregations', 'Date/Time Functions', 'Window Functions', 'NULL Handling', 'Subqueries', 'Geo Analysis'],
    difficulty: { easy: 10, medium: 55, hard: 35 },
    patterns: [
      'Driver earnings and utilization rate calculation',
      'Surge pricing zone identification by hour',
      'Trip completion funnel (requested → completed)',
      'Rider cohort retention analysis',
      'ETA accuracy measurement over time',
      'City-level demand vs supply gap analysis',
    ],
    experiences: [
      'Asked to find drivers who completed more than 10 trips in a day but had an acceptance rate below 80%.',
      'Had to calculate average surge multiplier per city per hour of day.',
      'They gave me an incomplete trips table and asked to identify patterns in cancellation reasons.',
    ],
    recommendedTopics: ['Multi-condition JOINs', 'Time bucketing with STRFTIME', 'CASE WHEN for status classification', 'Correlated subqueries', 'LEFT JOIN for incomplete data'],
    interviewRounds: 3,
    avgDifficulty: 'Medium',
  },

  walmart: {
    name: 'Walmart',
    emoji: '🛒',
    color: '#0071CE',
    style: 'Walmart focuses on retail analytics — inventory management, store performance, supply chain, and customer purchasing patterns. Questions involve large transaction datasets, seasonal trend analysis, and multi-store comparisons.',
    topics: ['Aggregations', 'Window Functions', 'Date Functions', 'GROUP BY', 'Self Joins', 'Subqueries', 'HAVING'],
    difficulty: { easy: 25, medium: 50, hard: 25 },
    patterns: [
      'Product inventory restocking threshold identification',
      'Store-level sales performance vs regional average',
      'Seasonal demand trend analysis quarter-over-quarter',
      'Customer basket analysis (frequently bought together)',
      'Shrinkage and waste metrics by category',
      'Supplier delivery performance score',
    ],
    experiences: [
      'Asked to find the top 5 products by sales per store, excluding products with fewer than 50 units sold.',
      'Had to calculate week-over-week inventory change and flag negative deltas.',
      'Question involved finding which store departments consistently underperformed vs the chain average.',
    ],
    recommendedTopics: ['RANK() per partition', 'HAVING with complex conditions', 'LAG() for period comparisons', 'Cross-store JOIN patterns', 'Running inventory calculations'],
    interviewRounds: 3,
    avgDifficulty: 'Medium',
  },

  'goldman sachs': {
    name: 'Goldman Sachs',
    emoji: '💰',
    color: '#6D8B74',
    style: 'Goldman Sachs SQL interviews are highly quantitative. They involve financial instrument data — trade executions, portfolio valuations, risk metrics, and P&L attribution. Expect strict precision requirements, complex date arithmetic, and multi-asset class analysis.',
    topics: ['Window Functions', 'Date Arithmetic', 'Aggregations', 'CTEs', 'Self Joins', 'Pivoting', 'Financial Math in SQL'],
    difficulty: { easy: 5, medium: 35, hard: 60 },
    patterns: [
      'Daily portfolio P&L computation across asset classes',
      'Trade execution quality analysis (slippage, fill rates)',
      'Risk-weighted exposure calculation per desk',
      'Moving average price computation for securities',
      'Client asset allocation drift measurement',
      'End-of-day NAV reconciliation queries',
    ],
    experiences: [
      'Asked to compute a 30-day moving average closing price for each equity using window functions.',
      'Had to identify trades where execution price deviated more than 2% from VWAP.',
      'Complex question about attributing daily P&L change to specific risk factors.',
    ],
    recommendedTopics: ['AVG() OVER sliding windows', 'LAG() for price change calculation', 'NTILE() for distribution buckets', 'Complex CASE WHEN for classification', 'CTE chains for multi-step financial calc'],
    interviewRounds: 5,
    avgDifficulty: 'Hard',
  },

  adobe: {
    name: 'Adobe',
    emoji: '🎨',
    color: '#FF0000',
    style: 'Adobe SQL interviews focus on SaaS subscription analytics — Creative Cloud, Document Cloud user behavior, subscription churn, feature adoption, and marketing funnel performance. They test cohort analysis, LTV calculations, and A/B test query writing.',
    topics: ['Cohort Analysis', 'Window Functions', 'CTEs', 'Date Functions', 'Aggregations', 'Subqueries', 'Funnel Analysis'],
    difficulty: { easy: 20, medium: 45, hard: 35 },
    patterns: [
      'Subscription cohort retention curves (weekly/monthly)',
      'Feature adoption rate by user segment and plan tier',
      'Churn prediction signals — declining engagement metrics',
      'Trial to paid conversion funnel per acquisition channel',
      'Support ticket to cancellation correlation analysis',
      'MRR and ARR computation with upgrades/downgrades',
    ],
    experiences: [
      'Asked to build a cohort retention table showing % of users still active by month number.',
      'Had to calculate MRR change decomposition: new, expansion, contraction, churned.',
      'Question about identifying users likely to churn based on 30-day engagement drop.',
    ],
    recommendedTopics: ['Cohort date bucketing with DATE_TRUNC', 'FIRST_VALUE() OVER for cohort start', 'Retention matrix pattern', 'LAG() for engagement trend detection', 'Multi-CTE chained analysis'],
    interviewRounds: 4,
    avgDifficulty: 'Medium',
  },

  atlassian: {
    name: 'Atlassian',
    emoji: '🔷',
    color: '#0052CC',
    style: 'Atlassian interviews focus on software development team productivity data — Jira issue tracking, Confluence page analytics, Bitbucket commit patterns, and team velocity metrics. They test time-to-resolution, sprint analysis, and developer productivity queries.',
    topics: ['Aggregations', 'Window Functions', 'Date Functions', 'CTEs', 'GROUP BY', 'HAVING', 'Subqueries'],
    difficulty: { easy: 30, medium: 50, hard: 20 },
    patterns: [
      'Sprint velocity and story point burndown analysis',
      'Issue resolution time by team, project, and priority',
      'Bug reopening rate and defect escape rate computation',
      'Code review turnaround time by reviewer',
      'Confluence page engagement and staleness detection',
      'Cross-team dependency bottleneck identification',
    ],
    experiences: [
      'Asked to find teams where average issue resolution time exceeded SLA thresholds.',
      'Had to compute the percentage of bugs reopened within 7 days of closure per developer.',
      'Question about finding Jira projects with no activity in the last 60 days.',
    ],
    recommendedTopics: ['DATEDIFF for SLA measurement', 'PERCENTILE_CONT window function', 'Correlated subqueries for activity checks', 'GROUP BY ROLLUP for hierarchical aggregation', 'Self-join for before-after state comparison'],
    interviewRounds: 3,
    avgDifficulty: 'Medium',
  },

  meta: {
    name: 'Meta',
    emoji: '👤',
    color: '#1877F2',
    style: 'Meta (Facebook) SQL interviews are famously difficult. They focus on social graph data, news feed algorithms, ad auction mechanics, and user growth metrics. Expect complex multi-level JOIN chains, graph traversal via recursive CTEs, and large-scale engagement analysis.',
    topics: ['Recursive CTEs', 'Window Functions', 'Complex JOINs', 'Graph Traversal', 'Aggregations', 'Deduplication', 'HAVING'],
    difficulty: { easy: 5, medium: 30, hard: 65 },
    patterns: [
      'Friend-of-friend mutual connection discovery',
      'News feed ranking signal computation',
      'Ad auction winner determination and revenue attribution',
      'User retention and resurrection cohort analysis',
      'Content virality spread rate across friend networks',
      'Daily/Weekly/Monthly active user ratio (DAU/WAU/MAU)',
    ],
    experiences: [
      'The hardest question: find all users within 2 degrees of connection who share the same employer.',
      'Asked to compute DAU/MAU ratio and flag users whose ratio dropped below 0.3.',
      'Had to find posts that reached 100+ shares within 1 hour of being published.',
    ],
    recommendedTopics: ['Recursive CTEs for graph traversal', 'Self-join for friend networks', 'Window function stacking', 'EXISTS vs IN performance', 'Complex multi-CTE pipelines'],
    interviewRounds: 5,
    avgDifficulty: 'Hard',
  },

  netflix: {
    name: 'Netflix',
    emoji: '🎬',
    color: '#E50914',
    style: 'Netflix interviews center on content performance analytics, user viewing behavior, recommendation system signals, and A/B test results for UI experiments. They test streaming event data analysis, content popularity metrics, and subscriber retention.',
    topics: ['Window Functions', 'CTEs', 'Date Functions', 'Aggregations', 'Percentile Functions', 'Cohort Analysis', 'Subqueries'],
    difficulty: { easy: 15, medium: 45, hard: 40 },
    patterns: [
      'Content completion rate and drop-off point analysis',
      'Recommendation system A/B test lift computation',
      'Subscriber churn prediction signals from viewing data',
      'Title popularity by region, device, and time slot',
      'Binge-watching session detection and classification',
      'Content catalog ROI per genre and release year',
    ],
    experiences: [
      'Asked to find users who watched more than 5 hours in a single day for 3 consecutive days.',
      'Had to compute the "stickiness ratio" - percentage of monthly users who are also daily active.',
      'Question about finding which Netflix Originals had above-average completion rates in their first week.',
    ],
    recommendedTopics: ['Session windowing with time gaps', 'NTILE() for engagement tier classification', 'LAG() for streak detection', 'Complex cohort retention', 'MEDIAN / PERCENTILE_CONT for viewing time'],
    interviewRounds: 4,
    avgDifficulty: 'Medium',
  },

  flipkart: {
    name: 'Flipkart',
    emoji: '🛍️',
    color: '#2874F0',
    style: 'Flipkart (India\'s largest e-commerce) interviews focus on seller performance, logistics, Big Billion Days sale analytics, and regional demand patterns. Expect large-scale order data analysis, delivery SLA tracking, and category-level performance queries.',
    topics: ['Aggregations', 'Window Functions', 'Date Functions', 'JOINs', 'Subqueries', 'GROUP BY', 'HAVING'],
    difficulty: { easy: 25, medium: 50, hard: 25 },
    patterns: [
      'Seller rating computation based on delivery and returns',
      'Big Billion Days vs regular day sales lift calculation',
      'Category-wise GMV and order volume trend analysis',
      'Logistics hub throughput and delay identification',
      'Customer first order to repeat order conversion rate',
      'Return rate by product category and seller tier',
    ],
    experiences: [
      'Asked to rank sellers by return rate within each product category.',
      'Had to find cities where delivery SLA breach rate exceeded 15% in October.',
      'Question about calculating rolling 30-day GMV per category.',
    ],
    recommendedTopics: ['RANK() OVER PARTITION BY category', 'Running totals with SUM() OVER', 'Date range filtering patterns', 'Multi-level GROUP BY hierarchies', 'Conditional aggregation with CASE WHEN'],
    interviewRounds: 3,
    avgDifficulty: 'Medium',
  },

  oracle: {
    name: 'Oracle',
    emoji: '🔴',
    color: '#F80000',
    style: 'Oracle interviews test deep SQL knowledge including Oracle-specific syntax, PL/SQL constructs, analytical functions, and enterprise database optimization. Expect questions on query tuning, index strategies, partitioning, and complex hierarchical data.',
    topics: ['Analytical Functions', 'Hierarchical Queries (CONNECT BY)', 'CTEs', 'Pivoting', 'Date Functions', 'Advanced Joins', 'Query Optimization'],
    difficulty: { easy: 10, medium: 40, hard: 50 },
    patterns: [
      'Hierarchical org chart traversal with CONNECT BY',
      'Employee management chain analysis',
      'Query plan optimization explanations',
      'Materialized view use case identification',
      'Partition pruning strategy for large tables',
      'Flashback query and temporal data analysis',
    ],
    experiences: [
      'Asked to find all direct and indirect reports of a given manager using CONNECT BY.',
      'Had to write a query and explain why it needed a composite index.',
      'Question on the difference between RANK(), DENSE_RANK(), and ROW_NUMBER() with examples.',
    ],
    recommendedTopics: ['Hierarchical queries', 'Advanced analytical functions', 'EXPLAIN PLAN analysis', 'Star schema query patterns', 'PIVOT/UNPIVOT operators'],
    interviewRounds: 4,
    avgDifficulty: 'Hard',
  },

  stripe: {
    name: 'Stripe',
    emoji: '💳',
    color: '#635BFF',
    style: 'Stripe SQL interviews focus on payment processing data — transaction success rates, fraud detection signals, revenue reconciliation, and merchant analytics. They expect precision in financial data handling, idempotency logic, and complex multi-event sequence analysis.',
    topics: ['Window Functions', 'CTEs', 'Date/Time Functions', 'Aggregations', 'NULL Handling', 'Deduplication', 'Self Joins'],
    difficulty: { easy: 10, medium: 40, hard: 50 },
    patterns: [
      'Payment authorization to capture funnel analysis',
      'Fraud signal detection via transaction pattern anomalies',
      'Merchant MRR computation with refunds and disputes',
      'Retry logic success rate across payment methods',
      'Currency conversion rate impact on reported revenue',
      'Chargeback rate by merchant category code',
    ],
    experiences: [
      'Asked to compute the authorization rate for each card network (Visa, MC, Amex) per month.',
      'Had to identify merchants with a chargeback rate above threshold using rolling 30-day windows.',
      'Question about reconciling captured payment amounts with payout amounts after fees.',
    ],
    recommendedTopics: ['Idempotency deduplication patterns', 'Rolling window aggregations', 'Multi-step CTE financial pipelines', 'NULL-safe financial calculations', 'EXCEPT / MINUS for reconciliation'],
    interviewRounds: 4,
    avgDifficulty: 'Hard',
  },
};

/** Returns normalized company slug from name */
export function getCompanySlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

/** Finds KB entry by company name (case-insensitive, partial match) */
export function getCompanyKB(nameOrSlug) {
  const key = nameOrSlug.toLowerCase().replace(/-/g, ' ').trim();
  // Direct key match
  if (COMPANY_KB[key]) return COMPANY_KB[key];
  // Partial match on name field
  return Object.values(COMPANY_KB).find(c => 
    c.name.toLowerCase().includes(key) || key.includes(c.name.toLowerCase())
  ) || null;
}

/** Returns formatted RAG context string for LLM injection */
export function getCompanyContext(nameOrSlug) {
  const kb = getCompanyKB(nameOrSlug);
  if (!kb) return `Company: ${nameOrSlug}. Focuses on enterprise SQL interview questions.`;
  return `Interview Style: ${kb.style}
Top SQL Topics: ${kb.topics.join(', ')}
Common Question Patterns: ${kb.patterns.slice(0, 4).join('; ')}
Example past question: "${kb.experiences[0]}"`;
}

/** Returns difficulty distribution percentage object */
export function getDifficultyDistribution(nameOrSlug) {
  const kb = getCompanyKB(nameOrSlug);
  return kb?.difficulty || { easy: 33, medium: 34, hard: 33 };
}

/** Returns all companies as array with slug */
export function getAllCompanies() {
  return Object.entries(COMPANY_KB).map(([key, val]) => ({
    ...val,
    slug: key,
  }));
}
