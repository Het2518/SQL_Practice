# Strategic Feature Roadmap — DataDesk Platform

**Target Milestones:** Q4 2026 – Q1 2027  
**Product Goal:** Establish DataDesk as the definitive browser-first SQL interview preparation platform for Tier-1 technology companies.  

---

## 1. High-Value Feature Priorities

```mermaid
quadrantChart
    title Feature Value vs Implementation Complexity
    x-axis Low Engineering Effort --> High Engineering Effort
    y-axis Low User Value --> High User Value
    quadrant-1 Strategic Bets
    quadrant-2 Quick Wins (P0 / P1)
    quadrant-3 Nice to Have
    quadrant-4 Over-Engineered
    "Query History with 1-Click Rerun": [0.25, 0.92]
    "Unified Test Suite Runner (LeetCode Style)": [0.35, 0.95]
    "Dynamic Heuristic Hint Engine": [0.28, 0.88]
    "Interactive Execution Plan Tree Visualizer": [0.55, 0.85]
    "Company Prep Mastery Paths": [0.45, 0.80]
    "Live Peer-to-Peer Mock Interviews": [0.85, 0.75]
    "Custom SQL Dialect Translators": [0.75, 0.60]
```

---

## 2. Feature Specifications

### 2.1 P0: Query History Drawer with 1-Click Rerun (Practice Workspace)
- **Problem Statement:** Candidates practicing complex queries often tweak their SQL and lose earlier working iterations. Having to retype or copy-paste from scratch degrades the study flow.
- **Solution:**
  - Track every executed query per question in local session history.
  - Display a sleek collapsible "History" drawer directly in the workspace.
  - Show timestamp, execution status (Accepted / Syntax Error), execution time (ms), and row count.
  - 1-click **"Restore to Editor"** button loads any historical SQL back into Monaco.

### 2.2 P0: Unified Interview Test Runner (Interview Arena Refactor)
- **Problem Statement:** Candidates felt the dual-panel scratchpad in the Interview Arena was unintuitive compared to standard coding platforms.
- **Solution:**
  - Remove the secondary `<textarea>` scratchpad completely.
  - Integrate a unified Test Runner below the Monaco editor:
    - **Tab 1: Test Result:** Displays status pill (Accepted / Wrong Answer / Runtime Error), execution duration in ms, and interactive table diff.
    - **Tab 2: Input Tables:** View live input tables with column types and sample rows.
    - **Tab 3: Schema Overview:** Quick column and relationship reference.

### 2.3 P1: Instant Heuristic AI Hint Engine (Offline / Keyless)
- **Problem Statement:** Candidates without a Groq API key or in restricted networks could not use the "Get AI Personalized Hint" button.
- **Solution:**
  - If no API key is present or the Groq API call fails, seamlessly fall back to local AST and regex heuristic analysis via `AutoHintMiddleware.js`.
  - Analyzes the query structure:
    - Detects missing `GROUP BY` when using aggregates (`COUNT`, `SUM`, `AVG`, `MAX`, `MIN`).
    - Detects missing table joins or improper join condition syntax.
    - Checks for missing `ORDER BY` when the problem asks for top-N or sorted results.
    - Highlights unhandled `NULL` values in `WHERE` clauses.

### 2.4 P2: Learning Roadmap & Company Skill Trackers
- Track progress against specific company rubrics (e.g. "Google: Window Functions & Data Pipelines", "Meta: Growth Metrics & Cohort Retention", "Uber: Geospatial & Trip Analytics").
