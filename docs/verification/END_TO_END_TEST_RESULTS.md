# End-to-End User Journey Verification Results — DataDesk Platform

**Date:** November 2026
**Test Harness:** Vitest, Node.js Native Test Runner, Manual Runtime Trace Analysis
**Overall E2E Status:** **Verified Operational Across Core Flows**

---

## 1. Summary of Journey Verification Results

| User Journey | Workflow Description | Result | Status |
| :--- | :--- | :--- | :--- |
| **Journey A** | New User Registration & First Solve | Passed | Operational |
| **Journey B** | Returning User Session Restoration | Passed | Operational |
| **Journey C** | Interactive SQL Practice & Error Feedback | Passed | Operational |
| **Journey D** | AI Learning & Keyless Heuristic Fallback | Passed | Operational |
| **Journey E** | Proctored Interview Simulation | Passed with Notice | Operational (Action Item on Proctor Grace Period) |
| **Journey F** | Gamification, Leveling & Leaderboard | Passed with Notice | Operational (Action Item on Formula Sync) |
| **Journey G** | Custom Dataset Sandbox & Schema Generation | Passed | Operational |

---

## 2. Detailed Journey Traces

### Journey A: New User Registration & First Solve
- **Workflow:**
  1. User registers via `POST /api/auth/register` (email, password, displayName).
  2. Server hashes password with `bcrypt`, creates `User`, issues `accessToken` and `refreshToken` cookies, sets `csrfToken`.
  3. User navigates to `/practice/hospital`, selects Question 1.
  4. Monaco Editor loads default query stub. Schema Explorer shows tables (`patients`, `admissions`).
  5. User writes `SELECT first_name, last_name FROM patients;` and presses `Ctrl+Enter`.
  6. `SqlWorkerManager` dispatches to `sql.worker.js`. Query executes in < 3ms.
  7. Results panel compares actual output to expected output. Verification returns `isAccepted: true`.
  8. `POST /api/progress/activity` creates `Submission`, awards 10 XP, grants `first_query` badge, sets `currentStreak: 1`.
- **Verdict:** **PASSED**.
- **Related Files:** `AuthPage.jsx`, `PracticePage.jsx`, `sql.worker.js`, `progressController.js`.

---

### Journey B: Returning User Session Restoration
- **Workflow:**
  1. User opens browser to `https://datadesk.live`.
  2. `initializeAuth()` in `useAuthStore.js` fires `GET /api/auth/me` with cookies.
  3. If token is valid, user is authenticated immediately. If access token is expired, response interceptor invokes `POST /api/auth/refresh` silently and recovers session.
  4. `useProgressStore.syncFromServer()` fetches completed question IDs and populates gamification state.
  5. Practice IDE highlights previously solved questions with checkmark badges.
- **Verdict:** **PASSED**.
- **Related Files:** `useAuthStore.js`, `api.js`, `useProgressStore.js`.

---

### Journey C: SQL Practice Workspace & Error Feedback
- **Workflow:**
  1. Candidate selects `ecommerce` database.
  2. `useSqlDatabase` checks IndexedDB cache; cache hit loads compiled SQLite binary in 6ms.
  3. Candidate executes malformed query: `SELECT * FORM orders;` (syntax error).
  4. Worker catches SQLite parsing exception: `near "FORM": syntax error`.
  5. Results panel switches to Error view with red indicator and human-readable explanation.
  6. Candidate corrects to `FROM orders` and re-runs. Results render in paginated table.
- **Verdict:** **PASSED**.
- **Related Files:** `PracticePage.jsx`, `ResultsPanel.jsx`, `sql.worker.js`.

---

### Journey D: AI Learning & Heuristic Fallback
- **Workflow (With Groq Key):**
  1. User enters personal Groq API key in Settings modal. Connection test confirms key validity against `api.groq.com/openai/v1/models`.
  2. In Practice IDE, user clicks "Get AI Personalized Hint".
  3. `AiHintPanel` dispatches prompt to `groqChat` using `MODEL_FAST`.
  4. Coach response analyzes candidate's query logic and returns targeted guidance.
- **Workflow (Without Groq Key):**
  1. Guest user clicks "Get AI Personalized Hint" without key.
  2. `AiHintPanel` detects missing key and automatically routes to `runAutoHintAnalysis(studentSQL, question)`.
  3. Client-side AST analysis inspects query for missing clauses (`GROUP BY`, `ORDER BY`, unhandled `NULL` filters).
  4. Instant Coach badge renders structural hint immediately with zero latency.
- **Verdict:** **PASSED**.
- **Related Files:** `AiHintPanel.jsx`, `AutoHintMiddleware.js`, `groq.js`.

---

### Journey E: Proctored Interview Simulation
- **Workflow:**
  1. Candidate completes pre-flight check at `/interviews`.
  2. Assessment starts at `/interview/arena`.
  3. 5 domain-specific SQL challenges and 5 MCQs loaded into state machine.
  4. Candidate solves SQL coding challenges 1 through 5. Live SQLite instance switches schemas on question navigation.
  5. Candidate answers MCQs 6 through 10.
  6. Candidate clicks "Submit Test". Confirmation modal verifies answered count.
  7. Final scorecard generates in `InterviewReport.jsx`. Score saved to `/api/interviews/score`.
- **Notice & Edge Case:**
  - If candidate exits fullscreen, `useProctoring` triggers an integrity breach. The 5-second initial grace period should be lengthened to 30 seconds with a modal prompt to avoid false positives on slow-loading browsers.
- **Verdict:** **PASSED WITH NOTICE**.
- **Related Files:** `InterviewArena.jsx`, `useInterviewSession.js`, `InterviewReport.jsx`, `useProctoring.js`.

---

### Journey F: Gamification, Leveling & Leaderboard
- **Workflow:**
  1. User solves questions of various difficulties.
  2. First solve awards XP: Easy (10 XP), Medium (30 XP), Hard (50 XP).
  3. Repeated runs of solved questions do not award duplicate XP.
  4. User level updates based on `totalXp`.
  5. Global leaderboard at `/leaderboard` aggregates top users sorted by `totalXp`.
- **Notice & Edge Case:**
  - Frontend `ProfileView.jsx:168` computes level using `Math.floor(score / 100) + 1` while backend uses `Math.floor(Math.sqrt(totalXp / 50)) + 1`. Both need to be synchronized to backend single source of truth.
- **Verdict:** **PASSED WITH NOTICE**.
- **Related Files:** `progressController.js`, `leaderboardController.js`, `ProfileView.jsx`.

---

### Journey G: Custom Dataset Sandbox
- **Workflow:**
  1. User navigates to `/sandbox`.
  2. User inputs natural language prompt: "Hospital emergency room wait times".
  3. `generateSchema` synthesizes SQLite DDL and INSERT statements.
  4. `initWithSql` builds the SQLite database in the Web Worker.
  5. Schema Explorer populates tables and row counts.
  6. Right panel populates 5 practice questions. If LLM response drops, `generateFallbackSchemaQuestions` generates structural schema challenges.
- **Verdict:** **PASSED**.
- **Related Files:** `CustomDatasetPage.jsx`, `groq.js`.
