# Engineer Hub: Intelligence Platform — Feature Specification Document

> **Document Purpose:** In-depth specification for all planned feature upgrades to the Engineer Hub SQL Practice Platform. This document is intended for the development agent to implement features systematically, one by one.

> **Tech Stack Reference:** React + Vite, Monaco Editor, sql.js (WebAssembly SQLite), Supabase (Auth + DB), Mermaid.js, react-zoom-pan-pinch, Vanilla CSS (Custom Design System)

---

## Table of Contents

1. [Query Execution Time + Row Count Display](#1-query-execution-time--row-count-display)
2. [Query Result Diff — Expected vs Actual](#2-query-result-diff--expected-vs-actual)
3. [NULL Handling Visualizer](#3-null-handling-visualizer)
4. [JOIN Visualizer](#4-join-visualizer)
5. [Query Execution Order Explainer](#5-query-execution-order-explainer)
6. [Schema Relationship Navigator](#6-schema-relationship-navigator)
7. [Aggregate Function Breakdown](#7-aggregate-function-breakdown)
8. [Index Awareness Panel](#8-index-awareness-panel)
9. [DBMS Theory Connector](#9-dbms-theory-connector)
10. [Edge Case Tester](#10-edge-case-tester)
11. [Subquery → CTE Converter](#11-subquery--cte-converter)
12. [Column Lineage Tracker](#12-column-lineage-tracker)

---

## 1. Query Execution Time + Row Count Display

### What It Is
After every query execution, display a metadata bar showing exactly how long the query took to run (in milliseconds) and how many rows were returned. This is essential feedback that every real database client (DBeaver, pgAdmin, MySQL Workbench) provides by default.

### Why It Matters for Students
- Teaches students to care about query performance, not just correctness
- Lets students compare execution time before vs after optimization (e.g., adding a WHERE clause, removing a nested subquery)
- Mirrors real-world DB tooling — interviewers expect candidates to know this concept

### Where to Place It
Render a slim metadata bar **between the Monaco editor and the results table**, visible immediately after query execution.

### Implementation Details

**Execution timing using `performance.now()`:**
```javascript
// In your query execution handler
const executeQuery = (sql) => {
  const startTime = performance.now();
  
  try {
    const results = db.exec(sql); // sql.js execution
    const endTime = performance.now();
    const executionTime = (endTime - startTime).toFixed(2); // ms, 2 decimal places
    const rowCount = results[0]?.values?.length ?? 0;
    
    setQueryMeta({ executionTime, rowCount, status: 'success' });
    setResults(results);
  } catch (err) {
    const endTime = performance.now();
    setQueryMeta({ executionTime: (endTime - startTime).toFixed(2), rowCount: 0, status: 'error' });
  }
};
```

**Metadata bar UI (JSX):**
```jsx
{queryMeta && (
  <div className="query-meta-bar">
    <span className="meta-item">
      <ClockIcon /> {queryMeta.executionTime} ms
    </span>
    <span className="meta-item">
      <RowsIcon /> {queryMeta.rowCount} rows returned
    </span>
    <span className={`meta-status ${queryMeta.status}`}>
      {queryMeta.status === 'success' ? '✓ Query OK' : '✗ Error'}
    </span>
  </div>
)}
```

**Additional Enhancement — Execution Time History:**
- Store last 10 execution times for the same question
- Show a mini sparkline trend: *"Your last 3 attempts: 45ms → 32ms → 18ms ↓ Improving!"*
- This gamifies optimization without needing a backend

### Acceptance Criteria
- [ ] Execution time shows in ms with 2 decimal places after every query run
- [ ] Row count shows immediately below editor
- [ ] Both values reset to `—` when the editor is cleared
- [ ] Displayed for both successful queries AND failed ones (with `0 rows` for errors)
- [ ] On sandbox mode, also show affected rows count for INSERT/UPDATE/DELETE

---

## 2. Query Result Diff — Expected vs Actual

### What It Is
When a student submits a query for a practice problem and gets it wrong, instead of just showing "Incorrect", show a **side-by-side visual diff** of the expected output vs their actual output — with row-level and cell-level highlighting of exactly what differs.

### Why It Matters for Students
This is the **#1 frustration point** on every SQL practice platform. Students stare at two tables trying to spot the difference manually. A visual diff removes this entirely and makes learning from mistakes instant.

### Where to Place It
Replaces or extends the current results panel when a submission is checked. Shown only in **Practice Mode** (not Sandbox Mode).

### Implementation Details

**Diff Algorithm:**
```javascript
// Compare expected vs actual result sets
const computeDiff = (expected, actual) => {
  // expected and actual are arrays of row objects
  const diff = {
    missingRows: [],    // rows in expected but not in actual
    extraRows: [],      // rows in actual but not in expected
    mismatchedRows: [], // rows present in both but with different values
    matchedRows: [],    // perfectly correct rows
    columnMismatches: {} // per-column mismatch tracking
  };

  // Use row serialization for comparison
  const expectedSerialized = expected.map(row => JSON.stringify(row));
  const actualSerialized = actual.map(row => JSON.stringify(row));

  expected.forEach((row, i) => {
    if (actualSerialized.includes(expectedSerialized[i])) {
      diff.matchedRows.push(row);
    } else {
      // Find closest match in actual (for cell-level diff)
      const closestMatch = findClosestRow(row, actual);
      if (closestMatch) {
        diff.mismatchedRows.push({ expected: row, actual: closestMatch });
      } else {
        diff.missingRows.push(row);
      }
    }
  });

  actual.forEach((row, i) => {
    if (!expectedSerialized.includes(actualSerialized[i])) {
      diff.extraRows.push(row);
    }
  });

  return diff;
};
```

**Diff Table UI:**
```jsx
<div className="diff-container">
  <div className="diff-panel expected">
    <h4>✓ Expected Output</h4>
    <DiffTable rows={expectedRows} diff={diff} side="expected" />
  </div>
  <div className="diff-panel actual">
    <h4>Your Output</h4>
    <DiffTable rows={actualRows} diff={diff} side="actual" />
  </div>
</div>

// Color coding:
// Green background  → correct row
// Red background    → wrong / missing row
// Yellow cell       → correct row but this specific cell has wrong value
// Strikethrough     → extra row student returned that wasn't expected
```

**Summary Banner above the diff:**
```
❌ 3 rows missing  |  ✗ 2 extra rows  |  ⚠ 1 row with wrong values  |  ✓ 7 rows correct
```

**Column Order Mismatch Detection:**
- If the student's column names/order differs from expected, flag it separately
- *"Your columns are correct but in the wrong order. Expected: name, salary, dept — Got: dept, name, salary"*

### Acceptance Criteria
- [ ] Side-by-side table shown after incorrect submission
- [ ] Missing rows highlighted red on expected side
- [ ] Extra rows highlighted red on actual side
- [ ] Cell-level yellow highlight for value mismatches within a row
- [ ] Summary row count banner above diff
- [ ] Column mismatch detection separate from row mismatch
- [ ] "View Full Output" button to collapse diff and see full actual result

---

## 3. NULL Handling Visualizer

### What It Is
Make NULL values visually distinct in result tables, and provide an educational panel that explains how NULLs affected the query results — especially across JOINs.

### Why It Matters for Students
NULL is the single most misunderstood concept in SQL. Students constantly confuse `NULL = NULL` (always false), `NULL != NULL`, NULL in aggregations, and NULLs produced by OUTER JOINs. Making NULLs visible fixes this faster than any lecture.

### Where to Place It
- Inside every result table (NULL cell styling)
- A collapsible **NULL Summary Panel** below the result table
- Appears automatically when query results contain NULLs

### Implementation Details

**NULL Cell Rendering:**
```jsx
const renderCell = (value) => {
  if (value === null || value === undefined) {
    return (
      <td className="null-cell">
        <span className="null-badge">NULL</span>
      </td>
    );
  }
  return <td>{value}</td>;
};

// CSS
.null-cell {
  background-color: rgba(255, 165, 0, 0.08);
}
.null-badge {
  font-size: 11px;
  font-weight: 600;
  color: #e67e22;
  background: rgba(230, 126, 34, 0.12);
  padding: 2px 6px;
  border-radius: 4px;
  font-style: italic;
  letter-spacing: 0.5px;
}
```

**NULL Summary Panel:**
```jsx
// Auto-detect NULLs in result and generate summary
const buildNullSummary = (results) => {
  const nullCounts = {};
  results.columns.forEach(col => { nullCounts[col] = 0; });
  
  results.values.forEach(row => {
    results.columns.forEach((col, i) => {
      if (row[i] === null) nullCounts[col]++;
    });
  });

  return nullCounts;
};

// Render
<div className="null-summary-panel">
  <h5>NULL Analysis</h5>
  {Object.entries(nullCounts).map(([col, count]) => count > 0 && (
    <div key={col} className="null-col-stat">
      <span className="col-name">{col}</span>
      <span className="null-count">{count} NULLs ({pct}%)</span>
      <div className="null-bar" style={{ width: `${pct}%` }} />
    </div>
  ))}
</div>
```

**NULL Source Detection (for JOINs):**
- Parse the query AST to detect if it's a LEFT/RIGHT/FULL OUTER JOIN
- If so, add an explanatory banner:
  > *"These NULLs were produced by your LEFT JOIN. Rows in `employees` that had no matching `department_id` in `departments` received NULL for all department columns."*

**NULL Propagation Hint:**
- Detect if student used `= NULL` instead of `IS NULL` in WHERE clause
- Show inline warning: *"⚠ You used `WHERE manager_id = NULL`. In SQL, NULL comparisons with = always return false. Use `IS NULL` instead."*

### Acceptance Criteria
- [ ] NULL cells rendered with distinct orange badge styling
- [ ] NULL count per column shown in summary panel below results
- [ ] Summary panel only appears when NULLs exist in result
- [ ] LEFT/RIGHT JOIN NULL source explanation banner
- [ ] `= NULL` vs `IS NULL` misuse detection warning
- [ ] NULL cells are never rendered as empty string — always show the badge

---

## 4. JOIN Visualizer

### What It Is
After a student executes any query containing a JOIN, render an interactive visual diagram showing which rows matched, which were excluded, and how many rows existed at each stage of the join. Uses Venn diagram metaphor for conceptual clarity.

### Why It Matters for Students
JOIN is the most tested concept in DBMS placement interviews. Students write JOINs by trial and error without understanding the set operations happening underneath. This visualizer makes the concept stick permanently.

### Where to Place It
A **"JOIN Analysis" tab** in the results panel, appearing alongside the results table tab. Only visible when the executed query contains a JOIN keyword.

### Implementation Details

**JOIN Detection from Query:**
```javascript
const detectJoins = (sql) => {
  const joinPattern = /\b(INNER\s+JOIN|LEFT\s+(OUTER\s+)?JOIN|RIGHT\s+(OUTER\s+)?JOIN|FULL\s+(OUTER\s+)?JOIN|CROSS\s+JOIN|JOIN)\b/gi;
  const matches = sql.matchAll(joinPattern);
  return Array.from(matches).map(m => ({
    type: m[1].trim().toUpperCase(),
    position: m.index
  }));
};
```

**Row Count Tracking at Each Join Stage:**
```javascript
// Execute the query in stages to get intermediate row counts
const getJoinStats = (db, sql, tables) => {
  const stats = {};
  
  // Get individual table counts
  tables.forEach(table => {
    const result = db.exec(`SELECT COUNT(*) FROM ${table}`);
    stats[table] = { totalRows: result[0].values[0][0] };
  });
  
  // Get joined result count
  const joinedResult = db.exec(sql);
  stats.joined = { matchedRows: joinedResult[0]?.values?.length ?? 0 };
  
  return stats;
};
```

**Venn Diagram SVG Component:**
```jsx
const JoinVennDiagram = ({ leftTable, rightTable, joinType, stats }) => {
  // Render SVG Venn diagram based on joinType
  // INNER JOIN → only intersection filled
  // LEFT JOIN  → full left circle + intersection filled
  // RIGHT JOIN → full right circle + intersection filled
  // FULL JOIN  → both circles fully filled
  
  return (
    <div className="join-visualizer">
      <svg viewBox="0 0 400 200">
        <circle cx="140" cy="100" r="80" className={`venn-left ${isLeftFilled ? 'filled' : ''}`} />
        <circle cx="260" cy="100" r="80" className={`venn-right ${isRightFilled ? 'filled' : ''}`} />
        {/* Intersection */}
        <path d={intersectionPath} className={`venn-intersection ${isIntersectionFilled ? 'filled' : ''}`} />
        
        {/* Labels */}
        <text x="90" y="100">{leftTable}</text>
        <text x="310" y="100">{rightTable}</text>
        <text x="200" y="210" className="join-type-label">{joinType}</text>
      </svg>
      
      {/* Row count annotations */}
      <div className="join-stats">
        <div>{leftTable}: {stats.leftTotal} rows</div>
        <div>{rightTable}: {stats.rightTotal} rows</div>
        <div>After {joinType}: {stats.matchedRows} rows</div>
        <div>Rows lost (unmatched): {stats.leftTotal - stats.matchedRows}</div>
      </div>
    </div>
  );
};
```

**JOIN Type Toggle (Educational):**
- Buttons to toggle between INNER / LEFT / RIGHT / FULL JOIN
- Re-runs the query variant and updates the diagram + row counts live
- Student can see visually how changing JOIN type changes results

**Multi-JOIN Support:**
- If query has 3+ tables joined, show a **chain diagram** instead of Venn
- `employees → (JOIN) → departments → (JOIN) → locations`
- Row count shown at each arrow: `500 → 487 → 482`

### Acceptance Criteria
- [ ] JOIN Analysis tab appears automatically for queries with JOIN keyword
- [ ] Venn diagram renders correctly for INNER, LEFT, RIGHT, FULL JOIN types
- [ ] Row counts shown for each table and final joined result
- [ ] "Rows lost" count shown for OUTER JOINs
- [ ] JOIN type toggle buttons work and re-render diagram
- [ ] Multi-JOIN chain diagram for 3+ table joins
- [ ] No JOIN tab shown for queries without a JOIN

---

## 5. Query Execution Order Explainer

### What It Is
After executing any query, show a **step-by-step breakdown panel** that explains the logical order in which SQL actually processed the query — from FROM clause to final SELECT — with the row count at each stage.

### Why It Matters for Students
This is the **biggest conceptual gap** in SQL education. Students write queries top-to-bottom (SELECT → FROM → WHERE) but SQL executes them in a completely different order. This gap causes wrong subqueries, incorrect GROUP BY usage, and HAVING vs WHERE confusion. A live breakdown fixes this permanently.

### Where to Place It
A **"Execution Plan" tab** in the results panel (alongside the results table and the existing EXPLAIN tab). Auto-populated after every successful query.

### Implementation Details

**SQL Execution Order (Logical):**
```
1. FROM / JOINs     → Load and join tables
2. WHERE            → Filter individual rows
3. GROUP BY         → Group filtered rows
4. HAVING           → Filter groups
5. SELECT           → Project columns + expressions
6. DISTINCT         → Remove duplicates
7. ORDER BY         → Sort final result
8. LIMIT / OFFSET   → Paginate
```

**Query Parser to Detect Clauses:**
```javascript
const parseQueryClauses = (sql) => {
  const upperSql = sql.toUpperCase();
  return {
    hasFROM:     /\bFROM\b/.test(upperSql),
    hasJOIN:     /\bJOIN\b/.test(upperSql),
    hasWHERE:    /\bWHERE\b/.test(upperSql),
    hasGROUPBY:  /\bGROUP\s+BY\b/.test(upperSql),
    hasHAVING:   /\bHAVING\b/.test(upperSql),
    hasDISTINCT: /\bDISTINCT\b/.test(upperSql),
    hasORDERBY:  /\bORDER\s+BY\b/.test(upperSql),
    hasLIMIT:    /\bLIMIT\b/.test(upperSql),
    hasCTE:      /\bWITH\b/.test(upperSql),
    hasSubquery: /\(SELECT\b/i.test(sql),
  };
};
```

**Row Count at Each Stage (using sql.js):**
```javascript
const getStageRowCounts = (db, sql, clauses, tables) => {
  const counts = {};

  // Stage 1: FROM (full table size)
  if (clauses.hasFROM) {
    const fromTable = extractFromTable(sql);
    const res = db.exec(`SELECT COUNT(*) FROM ${fromTable}`);
    counts.from = res[0]?.values[0][0];
  }

  // Stage 2: FROM + WHERE only
  if (clauses.hasWHERE) {
    const whereOnlySql = buildWhereOnlySql(sql); // strips GROUP BY, HAVING, ORDER BY
    const res = db.exec(whereOnlySql);
    counts.where = res[0]?.values?.length;
  }

  // Stage 3: Full query result
  counts.final = db.exec(sql)[0]?.values?.length ?? 0;

  return counts;
};
```

**Execution Steps UI:**
```jsx
const ExecutionOrderPanel = ({ sql, rowCounts }) => {
  const steps = buildSteps(sql, rowCounts);
  
  return (
    <div className="execution-order-panel">
      <h4>How SQL Executed Your Query</h4>
      <div className="steps-timeline">
        {steps.map((step, i) => (
          <div key={i} className={`step-item ${step.active ? 'active' : 'skipped'}`}>
            <div className="step-number">{i + 1}</div>
            <div className="step-content">
              <div className="step-clause">{step.clause}</div>
              <div className="step-description">{step.description}</div>
              {step.rowCount !== undefined && (
                <div className="step-rowcount">→ {step.rowCount} rows</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example rendered output:
// ✅ 1. WITH (CTE)       → Materialized temp result set "monthly_sales"
// ✅ 2. FROM employees   → 500 rows loaded
// ✅ 3. JOIN departments → 500 → 487 rows after INNER JOIN
// ✅ 4. WHERE salary > 50000 → 487 → 210 rows remain
// ✅ 5. GROUP BY dept_id → 210 rows → 8 groups formed
// ✅ 6. HAVING count > 5 → 8 → 5 groups remain
// ✅ 7. SELECT columns   → Projecting: dept_id, avg_salary, headcount
// ⏭ 8. DISTINCT         → (not used)
// ✅ 9. ORDER BY avg_salary DESC → Sorted
// ✅ 10. LIMIT 3         → Showing top 3 rows
```

**Common Mistake Warnings (inline):**
- If student uses a SELECT alias in WHERE clause: *"⚠ You used alias `net_pay` in WHERE. SQL evaluates WHERE before SELECT, so aliases don't exist yet. Move this to HAVING or use the full expression."*
- If HAVING is used without GROUP BY: *"⚠ HAVING without GROUP BY treats the entire result as one group."*

### Acceptance Criteria
- [ ] Execution Order panel tab visible after every successful query
- [ ] Only active clauses highlighted; skipped ones shown dimmed
- [ ] Row count shown at FROM, after JOIN, after WHERE, after GROUP BY, after HAVING, final
- [ ] CTE steps shown if WITH clause present
- [ ] Subquery detection + nested step shown
- [ ] Alias-in-WHERE warning shown when detected
- [ ] HAVING without GROUP BY warning shown when detected

---

## 6. Schema Relationship Navigator

### What It Is
An interactive panel in the schema sidebar that lets students click any column and immediately see all FK relationships it participates in, which tables it links to, and what JOIN path to take to connect two tables.

### Why It Matters for Students
When working with 6+ table schemas (like the hospital or e-commerce dataset), students waste huge time reading the ER diagram to figure out which table to JOIN through. This makes it instant.

### Where to Place It
Inside the existing **Schema Panel** (left sidebar). Enhances the table/column list already present.

### Implementation Details

**FK Relationship Map (built from schema):**
```javascript
// Extract FK relationships from sqlite_master
const buildRelationshipMap = (db) => {
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0]?.values ?? [];
  const relationships = [];

  tables.forEach(([tableName]) => {
    const fkInfo = db.exec(`PRAGMA foreign_key_list(${tableName})`);
    if (fkInfo[0]) {
      fkInfo[0].values.forEach(fk => {
        relationships.push({
          fromTable: tableName,
          fromColumn: fk[3],   // 'from' column
          toTable: fk[2],      // referenced table
          toColumn: fk[4],     // referenced column
        });
      });
    }
  });

  return relationships;
};
```

**Column Click → Highlight Relationships:**
```jsx
const SchemaColumn = ({ table, column, relationships, onColumnClick }) => {
  const isFK = relationships.some(r => r.fromTable === table && r.fromColumn === column);
  const isPK = column === 'id' || column.endsWith('_id') && !isFK; // heuristic

  return (
    <div 
      className={`schema-column ${isFK ? 'fk-column' : ''} ${isPK ? 'pk-column' : ''}`}
      onClick={() => onColumnClick(table, column)}
    >
      {isPK && <span className="pk-badge">PK</span>}
      {isFK && <span className="fk-badge">FK</span>}
      <span className="col-name">{column}</span>
    </div>
  );
};
```

**Join Path Finder:**
```javascript
// BFS to find shortest join path between two tables
const findJoinPath = (fromTable, toTable, relationships) => {
  const graph = buildAdjacencyGraph(relationships);
  const queue = [[fromTable, [fromTable]]];
  const visited = new Set([fromTable]);

  while (queue.length) {
    const [current, path] = queue.shift();
    if (current === toTable) return path;
    
    (graph[current] || []).forEach(neighbor => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, [...path, neighbor]]);
      }
    });
  }
  return null;
};

// Usage: findJoinPath('orders', 'products', relationships)
// Returns: ['orders', 'order_items', 'products']
// Displayed as: "JOIN orders → order_items → products"
```

**Join Path Suggestion UI:**
```jsx
// Shown when student selects two tables in schema panel
<div className="join-path-suggestion">
  <h5>How to connect these tables:</h5>
  <code>
    FROM orders
    JOIN order_items ON orders.id = order_items.order_id
    JOIN products ON order_items.product_id = products.id
  </code>
  <button onClick={() => insertIntoEditor(generatedJoinSQL)}>
    Insert into Editor
  </button>
</div>
```

**Missing Join Detection:**
- Parse the student's query for table names used
- Check if FK path between those tables is present in their JOIN clauses
- If not: *"⚠ You're using `orders` and `products` but missing the `order_items` join table between them. This will produce a CROSS JOIN."*

### Acceptance Criteria
- [ ] PK and FK badges shown on columns in schema sidebar
- [ ] Click a FK column → highlight the linked table and column in schema panel
- [ ] Select two tables → show the recommended JOIN path between them
- [ ] "Insert into Editor" button inserts the full JOIN skeleton
- [ ] Missing join table warning when student's query has implicit cross join
- [ ] Works across all 10+ datasets (auto-detected from PRAGMA foreign_key_list)

---

## 7. Aggregate Function Breakdown

### What It Is
When a student runs a GROUP BY query, make the result table **expandable** — click any group row to expand it and see the original rows that formed that group, showing exactly what values the aggregate function (SUM, AVG, COUNT, MAX, MIN) calculated from.

### Why It Matters for Students
GROUP BY is conceptually taught as a "black box." Students don't understand *why* AVG(salary) for the Engineering department equals 85,000. Seeing the 6 constituent rows that were averaged instantly demystifies it.

### Where to Place It
Enhances the existing **results table** in Practice and Sandbox modes. Expandable rows appear only when query contains GROUP BY.

### Implementation Details

**Detection:**
```javascript
const hasGroupBy = /\bGROUP\s+BY\b/i.test(sql);
```

**Fetching Constituent Rows:**
```javascript
const getGroupConstituents = (db, sql, groupByColumn, groupValue) => {
  // Extract base query without GROUP BY + aggregates
  // Replace SELECT aggregate_cols with SELECT *
  // Add WHERE groupByColumn = groupValue
  const baseQuery = buildConstituentQuery(sql, groupByColumn, groupValue);
  return db.exec(baseQuery)[0]?.values ?? [];
};
```

**Expandable Row UI:**
```jsx
const GroupedResultRow = ({ row, sql, db, columns }) => {
  const [expanded, setExpanded] = useState(false);
  const [constituents, setConstituents] = useState([]);

  const handleExpand = async () => {
    if (!expanded) {
      const rows = getGroupConstituents(db, sql, groupByCol, row[groupByColIndex]);
      setConstituents(rows);
    }
    setExpanded(!expanded);
  };

  return (
    <>
      <tr className="group-row" onClick={handleExpand}>
        <td className="expand-toggle">{expanded ? '▼' : '▶'}</td>
        {row.map((cell, i) => <td key={i}>{cell}</td>)}
      </tr>
      {expanded && constituents.map((constRow, i) => (
        <tr key={i} className="constituent-row">
          <td /> {/* indent */}
          {constRow.map((cell, j) => (
            <td key={j} className={isAggregatedColumn(columns[j]) ? 'highlighted-agg' : ''}>
              {cell}
            </td>
          ))}
        </tr>
      ))}
      {expanded && (
        <tr className="aggregate-summary-row">
          <td colSpan={columns.length + 1}>
            {buildAggregateSummary(aggregateFunctions, constituents)}
            {/* e.g., "SUM(salary): 45000 + 52000 + 78000 = 175000" */}
          </td>
        </tr>
      )}
    </>
  );
};
```

**Aggregate Summary String:**
```
COUNT(*): 3 rows in this group
AVG(salary): (45000 + 52000 + 78000) / 3 = 58,333.33
MAX(hire_date): Latest row: 2022-04-15
```

### Acceptance Criteria
- [ ] Expand arrow shown on each row when GROUP BY detected in query
- [ ] Click row → shows constituent rows with subtle indent styling
- [ ] Aggregate formula shown at bottom of expanded group
- [ ] Collapse click hides constituent rows again
- [ ] Works for COUNT, SUM, AVG, MIN, MAX functions
- [ ] No expand arrow for non-GROUP BY queries
- [ ] Performance: constituent query executes in < 50ms (sql.js is fast enough)

---

## 8. Index Awareness Panel

### What It Is
A dedicated panel that shows which columns in the active schema have indexes, and after query execution, highlights which of those indexes were actually *used* by SQLite's query planner — and warns when a WHERE/JOIN clause is hitting an un-indexed column causing a full table scan.

### Why It Matters for Students
Index optimization is asked in **every DBMS interview**. Students learn theory but never see it applied to a real query. This panel makes it tangible and visual.

### Where to Place It
A collapsible **"Index Advisor" panel** below the results table, or as a tab alongside the Execution Plan tab.

### Implementation Details

**Reading Index Info from sqlite:**
```javascript
const getIndexInfo = (db, tableName) => {
  // Get all indexes on table
  const indexes = db.exec(`PRAGMA index_list(${tableName})`)[0]?.values ?? [];
  
  return indexes.map(idx => {
    const indexName = idx[1];
    const isUnique = idx[2] === 1;
    const columns = db.exec(`PRAGMA index_info(${indexName})`)[0]?.values
      .map(col => col[2]); // column name
    
    return { indexName, isUnique, columns, tableName };
  });
};
```

**Using EXPLAIN QUERY PLAN to Detect Scans:**
```javascript
const analyzeQueryPlan = (db, sql) => {
  const plan = db.exec(`EXPLAIN QUERY PLAN ${sql}`)[0]?.values ?? [];
  
  return plan.map(step => ({
    detail: step[3], // e.g., "SCAN TABLE employees" or "SEARCH TABLE employees USING INDEX idx_dept"
    isFullScan: step[3].includes('SCAN TABLE'),
    isIndexScan: step[3].includes('USING INDEX') || step[3].includes('USING COVERING INDEX'),
    table: extractTable(step[3]),
    index: extractIndex(step[3]),
  }));
};
```

**Index Panel UI:**
```jsx
<div className="index-advisor-panel">
  <h5>Index Advisor</h5>
  
  {/* Schema Indexes */}
  <div className="schema-indexes">
    <h6>Available Indexes in {activeDatabase}</h6>
    {allIndexes.map(idx => (
      <div key={idx.indexName} className={`index-item ${usedIndexes.includes(idx.indexName) ? 'used' : 'unused'}`}>
        <span className="index-icon">{idx.isUnique ? '🔑' : '📇'}</span>
        <span className="index-name">{idx.indexName}</span>
        <span className="index-cols">on ({idx.columns.join(', ')})</span>
        {usedIndexes.includes(idx.indexName) && <span className="used-badge">✓ Used</span>}
      </div>
    ))}
  </div>
  
  {/* Warnings */}
  {fullScanTables.length > 0 && (
    <div className="full-scan-warning">
      ⚠ Full Table Scan detected on: {fullScanTables.join(', ')}
      <p>Your WHERE/JOIN condition is not using any index. 
         Consider indexing the column used in your filter.</p>
    </div>
  )}
</div>
```

**WHERE Clause Column Check:**
```javascript
// Parse WHERE clause columns and check against index list
const checkWhereColumns = (sql, indexes) => {
  const whereColumns = extractWhereColumns(sql); // regex-based extraction
  const indexedColumns = indexes.flatMap(idx => idx.columns);
  
  return whereColumns.filter(col => !indexedColumns.includes(col));
  // Returns columns in WHERE that have no index → show warning for each
};
```

### Acceptance Criteria
- [ ] All indexes in active schema listed in panel with table + column info
- [ ] PK indexes distinguished from regular indexes
- [ ] After query: used indexes marked with green checkmark
- [ ] Full table scan warning shown with affected table name
- [ ] Un-indexed WHERE column warning with suggestion
- [ ] Panel auto-expands when a performance warning is triggered
- [ ] Works by reading PRAGMA index_list from sql.js — no hardcoding

---

## 9. DBMS Theory Connector

### What It Is
A contextual theory panel that automatically surfaces the relevant DBMS concept card based on what SQL construct the student just used — and separately, a normalization analyzer that identifies which Normal Form (1NF–BCNF) the active schema satisfies.

### Why It Matters for Students
SQL practice and DBMS theory are studied in isolation. But university exams and interviews test both together. Connecting the two at the moment of practice creates stronger retention.

### Where to Place It
- **Concept Card:** Small collapsible panel on the right sidebar, auto-triggered per query
- **Normalization Analyzer:** Inside the Schema Info panel, one-time analysis per database

### Implementation Details

**Concept Card Trigger Map:**
```javascript
const CONCEPT_TRIGGERS = {
  'JOIN':         { title: 'JOIN Operations', slug: 'joins' },
  'GROUP BY':     { title: 'Aggregation & GROUP BY', slug: 'groupby' },
  'HAVING':       { title: 'HAVING vs WHERE', slug: 'having' },
  'WINDOW':       { title: 'Window Functions', slug: 'window-functions' },
  'OVER':         { title: 'Window Functions', slug: 'window-functions' },
  'CTE|WITH':     { title: 'Common Table Expressions', slug: 'cte' },
  'SUBQUERY':     { title: 'Subqueries & Correlated Queries', slug: 'subqueries' },
  'INDEX':        { title: 'Indexes & Query Optimization', slug: 'indexes' },
  'TRANSACTION':  { title: 'ACID Properties', slug: 'acid' },
  'DISTINCT':     { title: 'Set Operations & Deduplication', slug: 'distinct' },
  'UNION':        { title: 'UNION vs UNION ALL', slug: 'union' },
  'EXISTS':       { title: 'EXISTS vs IN Performance', slug: 'exists-vs-in' },
};

const detectConceptFromQuery = (sql) => {
  const upper = sql.toUpperCase();
  for (const [keyword, concept] of Object.entries(CONCEPT_TRIGGERS)) {
    if (new RegExp(`\\b(${keyword})\\b`).test(upper)) return concept;
  }
  return null;
};
```

**Concept Card Content (stored as JSON):**
```javascript
// /src/data/concepts/joins.json
{
  "title": "JOIN Operations",
  "tldr": "JOINs combine rows from two or more tables based on a related column.",
  "keyPoints": [
    "INNER JOIN returns only matching rows from both tables",
    "LEFT JOIN returns all rows from left table + matched rows from right (NULLs for no match)",
    "RIGHT JOIN is the mirror of LEFT JOIN",
    "FULL OUTER JOIN returns all rows from both tables",
    "SQL evaluates JOINs before WHERE — filter logic goes in ON or WHERE accordingly"
  ],
  "commonMistakes": [
    "Forgetting the ON condition → produces a CROSS JOIN",
    "Using WHERE for OUTER JOIN filters instead of ON (eliminates NULLs unintentionally)",
    "Joining on non-indexed columns → full table scan"
  ],
  "interviewQuestion": "What is the difference between WHERE and ON in a LEFT JOIN?"
}
```

**Normalization Analyzer:**
```javascript
// Heuristic-based NF analysis using schema metadata
const analyzeNormalForm = (db, tableName) => {
  const columns = db.exec(`PRAGMA table_info(${tableName})`)[0]?.values;
  const fks = db.exec(`PRAGMA foreign_key_list(${tableName})`)[0]?.values ?? [];
  const indexes = db.exec(`PRAGMA index_list(${tableName})`)[0]?.values ?? [];
  
  // 1NF: All columns atomic, has PK
  const has1NF = hasPrimaryKey(columns);
  
  // 2NF: No partial dependencies (relevant for composite PKs)
  const has2NF = has1NF && !hasPartialDependencies(columns, indexes);
  
  // 3NF: No transitive dependencies
  const has3NF = has2NF && !hasTransitiveDependencies(columns, fks);
  
  return { nf: has3NF ? '3NF' : has2NF ? '2NF' : has1NF ? '1NF' : 'Unnormalized', has1NF, has2NF, has3NF };
};
```

### Acceptance Criteria
- [ ] Concept card auto-appears in sidebar when relevant keyword detected
- [ ] Card shows TL;DR, key points, common mistakes, and one interview question
- [ ] Card dismissable with X; doesn't reappear for same concept in same session
- [ ] Normalization level badge shown per table in schema panel
- [ ] Clicking normalization badge shows explanation of why that NF was assigned
- [ ] Theory cards stored as local JSON — no API call needed

---

## 10. Edge Case Tester

### What It Is
A one-click feature that automatically generates and injects edge case data variations into a temporary copy of the database, then runs the student's query against each variation — revealing which edge cases their query handles correctly and which ones break it.

### Why It Matters for Students
Students test their queries only against the provided dataset. In real interviews and production systems, queries must handle edge cases: empty tables, all-NULL columns, duplicate rows, single-row tables, and extreme values. This feature teaches defensive query writing.

### Where to Place It
A **"Test Edge Cases" button** in the query toolbar, available in Sandbox mode and optionally in Practice mode.

### Implementation Details

**Edge Case Variants:**
```javascript
const EDGE_CASE_VARIANTS = [
  {
    id: 'empty_table',
    label: 'Empty Table',
    description: 'All rows deleted from the primary table',
    transform: (db, tableName) => db.exec(`DELETE FROM ${tableName}`)
  },
  {
    id: 'single_row',
    label: 'Single Row',
    description: 'Only one row remains in the primary table',
    transform: (db, tableName) => {
      const firstId = db.exec(`SELECT rowid FROM ${tableName} LIMIT 1`)[0]?.values[0][0];
      db.exec(`DELETE FROM ${tableName} WHERE rowid != ${firstId}`);
    }
  },
  {
    id: 'all_nulls',
    label: 'NULL-heavy Data',
    description: 'Non-PK/FK columns set to NULL',
    transform: (db, tableName) => {
      const nullableCols = getNullableColumns(db, tableName);
      nullableCols.forEach(col => db.exec(`UPDATE ${tableName} SET ${col} = NULL`));
    }
  },
  {
    id: 'duplicates',
    label: 'Duplicate Rows',
    description: '50% of rows duplicated',
    transform: (db, tableName) => {
      db.exec(`INSERT INTO ${tableName} SELECT * FROM ${tableName} LIMIT (SELECT COUNT(*)/2 FROM ${tableName})`);
    }
  },
  {
    id: 'extreme_values',
    label: 'Extreme Values',
    description: 'Numeric columns set to 0, -1, and max integer',
    transform: (db, tableName) => {
      const numericCols = getNumericColumns(db, tableName);
      db.exec(`UPDATE ${tableName} SET ${numericCols[0]} = 0 WHERE rowid = 1`);
      db.exec(`UPDATE ${tableName} SET ${numericCols[0]} = 9999999 WHERE rowid = 2`);
    }
  }
];
```

**Safe Execution (Isolated Copy):**
```javascript
// CRITICAL: Never mutate the actual db — use an in-memory copy
const runEdgeCaseTests = async (originalDb, sql) => {
  const results = [];
  
  for (const variant of EDGE_CASE_VARIANTS) {
    // Export and reimport DB to get fresh copy (sql.js API)
    const dbCopy = new SQL.Database(originalDb.export());
    
    try {
      variant.transform(dbCopy, primaryTable);
      const result = dbCopy.exec(sql);
      results.push({
        ...variant,
        status: 'passed',
        rowCount: result[0]?.values?.length ?? 0,
        preview: result[0]?.values?.slice(0, 3) // first 3 rows
      });
    } catch (err) {
      results.push({
        ...variant,
        status: 'failed',
        error: err.message
      });
    }
    
    dbCopy.close(); // Free WASM memory
  }
  
  return results;
};
```

**Results UI:**
```jsx
<div className="edge-case-results">
  {edgeCaseResults.map(result => (
    <div key={result.id} className={`edge-case-item ${result.status}`}>
      <span className="status-icon">{result.status === 'passed' ? '✓' : '✗'}</span>
      <span className="variant-label">{result.label}</span>
      <span className="variant-desc">{result.description}</span>
      {result.status === 'passed' 
        ? <span className="row-count">{result.rowCount} rows returned</span>
        : <span className="error-msg">{result.error}</span>
      }
    </div>
  ))}
</div>
```

### Acceptance Criteria
- [ ] "Test Edge Cases" button in toolbar, disabled unless query has been run once
- [ ] 5 edge case variants tested: empty, single row, NULLs, duplicates, extreme values
- [ ] Each variant runs in an isolated DB copy — original data never mutated
- [ ] Pass/fail shown per variant with row count or error message
- [ ] Memory cleanup after each variant (dbCopy.close())
- [ ] Total runtime < 2 seconds for all 5 variants on standard dataset sizes

---

## 11. Subquery → CTE Converter

### What It Is
A button that detects subqueries in the student's SQL and automatically rewrites them as equivalent CTEs (Common Table Expressions using the WITH clause) — showing both versions side by side so the student can compare readability.

### Why It Matters for Students
"Rewrite this subquery as a CTE" is a near-universal SQL interview question. The mental model shift from inline subquery to named CTE is hard to grasp by reading alone — seeing your *own* query transformed makes it click instantly.

### Where to Place It
A **"Convert to CTE" button** in the Monaco editor toolbar. Activates when a subquery is detected in the editor content.

### Implementation Details

**Subquery Detection:**
```javascript
const hasSubquery = (sql) => /\(\s*SELECT\b/i.test(sql);
const countSubqueries = (sql) => (sql.match(/\(\s*SELECT\b/gi) || []).length;
```

**Simple Subquery → CTE Transformation:**
```javascript
// Input:
// SELECT name FROM employees 
// WHERE dept_id IN (SELECT id FROM departments WHERE location = 'NYC')

// Output:
// WITH nyc_departments AS (
//   SELECT id FROM departments WHERE location = 'NYC'
// )
// SELECT name FROM employees
// WHERE dept_id IN (SELECT id FROM nyc_departments)

const convertSubqueryToCTE = (sql) => {
  // Use regex to extract subquery
  const subqueryMatch = sql.match(/\((\s*SELECT[\s\S]+?)\)/i);
  if (!subqueryMatch) return null;
  
  const subquery = subqueryMatch[1].trim();
  const cteName = generateCTEName(subquery); // e.g., "filtered_departments"
  
  const cteBlock = `WITH ${cteName} AS (\n  ${subquery}\n)`;
  const mainQuery = sql.replace(subqueryMatch[0], `(SELECT * FROM ${cteName})`);
  
  return `${cteBlock}\n${mainQuery}`;
};

// CTE name generation (heuristic):
const generateCTEName = (subquery) => {
  const tableMatch = subquery.match(/FROM\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : 'subquery';
  const hasWhere = /WHERE/i.test(subquery);
  return hasWhere ? `filtered_${table}` : `all_${table}`;
};
```

**Side-by-Side Comparison UI:**
```jsx
<div className="cte-converter-panel">
  <h5>Subquery → CTE Conversion</h5>
  <div className="comparison-grid">
    <div className="original-panel">
      <h6>Original (Subquery)</h6>
      <MonacoReadOnly value={originalSql} language="sql" />
    </div>
    <div className="arrow-divider">→</div>
    <div className="converted-panel">
      <h6>Converted (CTE)</h6>
      <MonacoReadOnly value={convertedSql} language="sql" />
      <button onClick={() => loadIntoEditor(convertedSql)}>
        Use This Version
      </button>
    </div>
  </div>
  <p className="cte-explanation">
    Both queries return identical results. CTEs are preferred for:
    readability, reusability within the query, and easier debugging.
  </p>
</div>
```

**Multi-Subquery Handling:**
- If multiple subqueries: convert each one to a separate named CTE
- Name them sequentially: `cte_1`, `cte_2` or by table: `filtered_orders`, `recent_customers`

### Acceptance Criteria
- [ ] "Convert to CTE" button appears in toolbar when `(SELECT` is detected in editor
- [ ] Conversion produces syntactically valid SQL (verify by executing in sql.js)
- [ ] Both original and CTE versions execute and produce identical result sets
- [ ] "Use This Version" button loads the CTE version into the Monaco editor
- [ ] Works for single nested subquery at minimum
- [ ] Handles multiple subqueries by producing multiple CTEs in WITH block
- [ ] Explanation text shown below explaining when CTEs are preferable

---

## 12. Column Lineage Tracker

### What It Is
When a student hovers over any column in the query result table, a tooltip traces that column back through the query to its source — which original table and column it came from, and what transformations (aliases, expressions, functions) were applied.

### Why It Matters for Students
In complex queries with multiple JOINs, aliased columns, and computed expressions, students lose track of where output columns originate. Column lineage makes this transparent and teaches derived column mental models.

### Where to Place It
**Hover tooltip on result table column headers.** Also a dedicated "Lineage View" accessible via right-click on any column header.

### Implementation Details

**Lineage Detection (Static Analysis):**
```javascript
// Parse SELECT clause to build column lineage map
const buildColumnLineage = (sql) => {
  const selectClause = extractSelectClause(sql);
  const fromTables = extractFromAndJoinTables(sql);
  
  // Parse each SELECT item
  const lineageMap = {};
  
  selectClause.items.forEach(item => {
    if (item.type === 'column') {
      // e.g., SELECT e.salary → from employees.salary
      lineageMap[item.alias || item.column] = {
        sourceTable: item.table || inferTable(item.column, fromTables),
        sourceColumn: item.column,
        transformation: null,
        displayName: item.alias || item.column
      };
    } else if (item.type === 'expression') {
      // e.g., SELECT price * quantity AS total → computed
      lineageMap[item.alias] = {
        sourceTable: 'computed',
        sourceColumn: null,
        transformation: item.expression,  // "price * quantity"
        sources: extractColumnsFromExpression(item.expression),
        displayName: item.alias
      };
    } else if (item.type === 'aggregate') {
      // e.g., SELECT AVG(salary) AS avg_sal
      lineageMap[item.alias] = {
        sourceTable: inferTable(item.column, fromTables),
        sourceColumn: item.column,
        transformation: `${item.func}(${item.column})`,
        displayName: item.alias
      };
    }
  });
  
  return lineageMap;
};
```

**Hover Tooltip UI:**
```jsx
const ResultColumnHeader = ({ columnName, lineage }) => {
  const info = lineage[columnName];
  
  return (
    <th className="result-col-header">
      <div className="col-header-inner">
        {columnName}
        <span className="lineage-icon">↗</span>
      </div>
      
      {/* Tooltip on hover */}
      <div className="lineage-tooltip">
        {info?.sourceTable === 'computed' ? (
          <>
            <div className="lineage-row">
              <span className="label">Type:</span>
              <span>Computed Expression</span>
            </div>
            <div className="lineage-row">
              <span className="label">Formula:</span>
              <code>{info.transformation}</code>
            </div>
            <div className="lineage-row">
              <span className="label">Source columns:</span>
              <span>{info.sources.join(', ')}</span>
            </div>
          </>
        ) : (
          <>
            <div className="lineage-row">
              <span className="label">From:</span>
              <span>{info?.sourceTable}.{info?.sourceColumn}</span>
            </div>
            {info?.transformation && (
              <div className="lineage-row">
                <span className="label">Function:</span>
                <code>{info.transformation}</code>
              </div>
            )}
            {columnName !== info?.sourceColumn && (
              <div className="lineage-row">
                <span className="label">Aliased from:</span>
                <span>{info?.sourceColumn}</span>
              </div>
            )}
          </>
        )}
      </div>
    </th>
  );
};
```

**Full Lineage View (Right-click):**
```jsx
// Context menu → "Show Column Lineage"
// Opens a modal with a full lineage diagram for ALL output columns
<div className="lineage-modal">
  <h4>Column Lineage for This Query</h4>
  <div className="lineage-diagram">
    {/* Source tables on left, output columns on right, arrows connecting them */}
    <div className="source-tables">
      {sourceTables.map(table => (
        <div key={table} className="source-table-box">{table}</div>
      ))}
    </div>
    <svg className="lineage-arrows">
      {/* Draw SVG arrows from source columns to output columns */}
    </svg>
    <div className="output-columns">
      {outputColumns.map(col => (
        <div key={col} className="output-col-box">{col}</div>
      ))}
    </div>
  </div>
</div>
```

### Acceptance Criteria
- [ ] Hover tooltip on every result column header showing source table + column
- [ ] Computed expressions show formula and constituent source columns
- [ ] Aliased columns show both alias and original column name
- [ ] Aggregate functions show function name + source column
- [ ] Right-click → "Show Lineage" opens full diagram modal
- [ ] Full diagram uses SVG arrows connecting source tables to output columns
- [ ] Gracefully degrades for very complex expressions (shows "Complex expression")

---

## Implementation Priority Order

| # | Feature | Complexity | Student Impact | Build First? |
|---|---------|------------|----------------|--------------|
| 1 | Query Execution Time + Row Count | Low | High | ✅ Yes — quick win |
| 2 | Query Execution Order Explainer | Medium | Very High | ✅ Yes — core differentiator |
| 3 | Query Result Diff | Medium | Very High | ✅ Yes — removes #1 frustration |
| 4 | NULL Handling Visualizer | Low-Medium | High | ✅ Yes |
| 5 | JOIN Visualizer | Medium-High | Very High | 🔜 Soon |
| 6 | Index Awareness Panel | Medium | High | 🔜 Soon |
| 7 | Schema Relationship Navigator | Medium | High | 🔜 Soon |
| 8 | Aggregate Function Breakdown | Medium | High | ⏳ Later |
| 9 | Edge Case Tester | High | High | ⏳ Later |
| 10 | Subquery → CTE Converter | High | Medium-High | ⏳ Later |
| 11 | DBMS Theory Connector | Medium | Medium | ⏳ Later |
| 12 | Column Lineage Tracker | High | Medium | ⏳ Last |

---

## Shared Utilities to Build Once (Used Across Features)

```javascript
// 1. SQL Clause Parser (used by: #5, #7, #11, #12)
const parseSQLClauses = (sql) => { /* ... */ };

// 2. Table Name Extractor (used by: #4, #6, #8, #10)
const extractTableNames = (sql) => { /* ... */ };

// 3. Safe DB Copy (used by: #10)
const cloneDatabase = (db) => new SQL.Database(db.export());

// 4. Column Type Inspector (used by: #3, #8, #10)
const getColumnTypes = (db, table) => db.exec(`PRAGMA table_info(${table})`);

// 5. FK Relationship Graph (used by: #6, #4)
const buildFKGraph = (db) => { /* ... */ };
```

Build these shared utilities first as a `/src/utils/sqlAnalysis.js` module before implementing individual features.

---

*Document version: 1.0 | Platform: Engineer Hub Intelligence Platform | Stack: React + sql.js + Supabase*
