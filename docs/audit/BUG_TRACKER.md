# Bug Tracker & Remediation Log — DataDesk Platform

**Last Updated:** November 2026
**Auditor:** Principal Software Architect & QA Lead
**Status:** Active Tracking

---

## Priority Classifications:
- **P0 (Critical):** Blocks core workflows, causes data corruption, security vulnerability, or unlimited resource exploit.
- **P1 (High):** Major feature broken, incorrect calculation, severe UX disruption.
- **P2 (Medium):** Sub-optimal user experience, missing fallback, minor calculation inaccuracy.
- **P3 (Low):** Visual glitch, code cleanliness, unused imports.

---

## Master Bug Inventory

| Bug ID | Priority | Module | Description | Root Cause | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | **P0** | Backend `progressController` | Infinite XP/ELO farming on repeated accepted queries. | `totalXp` incremented unconditionally on every accepted run without checking prior completion. | **FIXED** |
| **BUG-002** | **P0** | AI Subsystem `groq.js` | AI features crash with 404 when Groq deprecates static model names. | Hardcoded single model identifiers without runtime fallback or account model discovery. | **FIXED** |
| **BUG-003** | **P1** | AI Subsystem `useInterviewSession` / `CustomDatasetPage` | "Unexpected end of JSON input" syntax error displayed in UI. | Long LLM responses truncated at token ceiling; `JSON.parse` called without truncation salvage parser. | **FIXED** |
| **BUG-004** | **P1** | Backend `UserProgress` & `progressController` | User level and rank title never calculated or updated. | `doc.level` defaults to 1 and `doc.rankTitle` defaults to 'Novice'; no calculation logic existed on save. | **FIXED** |
| **BUG-005** | **P1** | Backend `leaderboardController` | Leaderboard shows total submission count rather than distinct questions solved. | MongoDB aggregation grouped by `$userId` without grouping by distinct `$questionId` first. | **FIXED** |
| **BUG-006** | **P2** | Frontend `QuestionHintSection` | "Get AI Personalized Hint" fails or shows dead state if user lacks Groq key. | Button required valid Groq key with no local heuristic/rule-based fallback. | **FIXED** |
| **BUG-007** | **P2** | Frontend `InterviewArena` | Confusing dual-editor layout (secondary textarea scratchpad under Monaco editor). | Redundant scratchpad textarea competed with the main editor, confusing candidates. | **FIXED** |
| **BUG-008** | **P2** | Frontend Build / CI | CI build failure due to unused imports and unhandled variables. | Unused React/Lucide imports in profile, practice, and visualizer components. | **FIXED** |
| **BUG-009** | **P3** | Frontend `SqlEditor` | Monaco editor clipped on container resize. | Missing `ResizeObserver` dispatching `editor.layout()`. | **FIXED** |
| **BUG-010** | **P3** | Frontend `api.js` | Console error logging on `/api/auth/me` 401 response for guest visitors. | Axios response interceptor logged unhandled rejection instead of silent guest status. | **FIXED** |

---

## Detailed Bug Analysis & Remediation Proof

### BUG-001: Infinite XP Farming
- **Reproduction:**
  1. Solve any question (e.g. Question 1 in Hospital database).
  2. Click "Run Code" 10 times.
  3. Observe Total XP increasing by 100 XP (10 x 10).
- **Remediation:**
  In `backend/src/controllers/progressController.js`:
  ```javascript
  const alreadyAccepted = await Submission.exists({
    userId: req.user._id,
    questionId: String(question.id),
    status: 'Accepted'
  });
  if (!alreadyAccepted) {
    const XP_MAP = { easy: 10, medium: 30, hard: 50 };
    const xpGain = XP_MAP[difficulty] ?? 10;
    doc.totalXp += xpGain;
    doc.eloRating += Math.round(xpGain / 2);
  }
  ```
- **Verification:** Verified via unit and integration tests. Subsequent accepted executions record submission history without inflating XP.

---

### BUG-002: Groq Model Deprecation 404
- **Reproduction:**
  1. Open mock interview or AI hint when Groq deprecates `llama-3.1-8b-instant`.
  2. Groq returns HTTP 404 `The model 'llama-3.1-8b-instant' does not exist`.
  3. Feature fails completely.
- **Remediation:**
  Implemented dynamic discovery via `GET https://api.groq.com/openai/v1/models` and automatic candidate queue failover across `CANDIDATE_MODELS = ['llama-3.3-70b-versatile', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'llama-3.1-8b-instant', 'gemma2-9b-it', 'mixtral-8x7b-32768']`.
- **Verification:** Verified in `groq.test.js`. When the primary model is simulated to return 404, the client seamlessly invokes the alternate model.

---

### BUG-003: Truncated JSON Recovery
- **Reproduction:**
  1. Request a complex 5-question multi-table custom sandbox prompt.
  2. Output reaches 2500 max tokens and terminates mid-object.
  3. `JSON.parse` threw `Unexpected end of JSON input`.
- **Remediation:**
  Engineered `safeParseJsonArray(raw)` in `groq.js` and progressive JSON sanitization in `useInterviewSession.js` that scans backwards to the last complete `}` and seals the JSON array. If all parsing fails, procedurally generates schema challenge questions.
