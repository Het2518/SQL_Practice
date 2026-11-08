# Regression & Discrepancy Report — DataDesk Platform

**Verification Phase:** Phase 2 Independent Engineering Review
**Target Commit:** `d69c86ba059c0899b1818f1b6c26f4154868e3e9`
**Date:** November 2026
**Status:** Complete

---

## 1. Regression Testing Checklist

| Functional Area | Regression Risk Checked | Test Result | Status |
| :--- | :--- | :--- | :--- |
| **SQL Practice Workspace** | Did XP fix break question completion state or persistence? | Local state optimistic update + server sync verified. | **NO REGRESSION** |
| **Interview Arena** | Did removing the scratchpad break query execution or output diffing? | Monaco editor executes cleanly; test results render in console. | **NO REGRESSION** |
| **AI Hint Engine** | Did instant heuristic fallback interfere with standard LLM responses? | Dual-mode routing tested; key activates LLM, missing key activates AST heuristics. | **NO REGRESSION** |
| **AI Question Generation** | Did fallback schema generator alter custom database schemas? | Active SQLite database schema remains unchanged. | **NO REGRESSION** |
| **Auth & Sessions** | Did CSRF and cookie adjustments cause guest visitor loops? | Guest visitors load without infinite token refresh loops. | **NO REGRESSION** |

---

## 2. Discovered Edge Cases & Discrepancies

### BUG-VERIF-001 (Priority: P1)
- **Title:** Concurrency Race Condition in `progressController.js` First-Time Solve Check.
- **Root Cause:**
  `Submission.exists({ userId, questionId, status: 'Accepted' })` followed by `Submission.create(...)` and `doc.save()` is not an atomic operation.
- **Reproduction:**
  If an automated script or rapid multi-click sends 5 concurrent `POST /api/progress/activity` requests before the first submission document is committed to MongoDB, all 5 evaluate `priorAccepted === null`, leading to multiple XP increments.
- **Remediation Proposal:**
  Add a unique partial compound index on `Submission`:
  ```javascript
  submissionSchema.index(
    { userId: 1, questionId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'Accepted' } }
  );
  ```
  Or use atomic `$addToSet` of solved question IDs on `UserProgress` with `findOneAndUpdate`.

---

### BUG-VERIF-002 (Priority: P2)
- **Title:** Divergent Leveling Formulas Between Frontend and Backend.
- **Root Cause:**
  - Backend (`progressController.js:190`):
    `doc.level = Math.max(1, Math.floor(Math.sqrt((doc.totalXp || 0) / 50)) + 1);`
  - Frontend (`ProfileView.jsx:168`):
    `const level = Math.floor(stats.score / 100) + 1;`
- **Impact:**
  Users see differing level numbers depending on whether they view the profile UI or retrieve raw backend progress:
  - At 50 XP: Backend calculates Level 2; Frontend displays Level 1.
  - At 5000 XP: Backend calculates Level 11; Frontend displays Level 51.
- **Remediation Proposal:**
  Standardize on a single formula across both tiers, or bind `ProfileView.jsx` directly to `gameState.level` / `progress.level` supplied by `/api/progress`.

---

### BUG-VERIF-003 (Priority: P2)
- **Title:** Unexecuted SQL Query Default Score in `InterviewReport.jsx`.
- **Root Cause:**
  In `frontend/src/features/interview/InterviewReport.jsx:66`:
  ```javascript
  return { score: 10, isCorrect: true, feedback: 'Solution query submitted.' };
  ```
  If a candidate types SQL into the editor but finishes the assessment without clicking "Run Code", `candidateAnswer?.queryResult` is undefined, and the deterministic fallback awards 10 points and marks `isCorrect: true` without syntax validation.
- **Remediation Proposal:**
  Execute syntax validation against the active question schema before awarding default submission points.

---

### BUG-VERIF-004 (Priority: P2)
- **Title:** Proctoring 5-Second Fullscreen Timeout False Positive.
- **Root Cause:**
  `frontend/src/features/interview/hooks/useProctoring.js:18`:
  A 5-second initial timer calls `enforceViolation('Exited fullscreen mode immediately after starting.')` if `document.fullscreenElement` is falsy.
- **Impact:**
  On slower laptops or browsers requiring user confirmation for fullscreen, candidates risk immediate interview termination with 0 points before they even begin reading Question 1.
- **Remediation Proposal:**
  Replace immediate zero-score termination with an interactive modal overlay: "Return to Fullscreen Mode to Resume Assessment" with a 30-second countdown.

---

## 3. Actual Test Execution Evidence

### 3.1 Frontend Test Suite (Vitest)
```text
✓ src/utils/__tests__/sqlAnalysis.test.js (2 tests)
✓ src/features/profile/settingsConfig.test.js (2 tests)
✓ src/lib/groq.test.js (11 tests)
✓ src/utils/shortcutManager.test.js (6 tests)
✓ src/features/interview/utils/interviewUtils.test.js (6 tests)
✓ src/lib/api.test.js (3 tests)
✓ src/shared/ui/ConfirmModal.test.jsx (4 tests)

Test Files  7 passed (7)
     Tests  34 passed (34)
  Duration  5.68s
```

### 3.2 Backend Test Suite (Node.js Test Runner)
```text
✔ csrfProtection allows safe methods
✔ csrfProtection rejects missing token on mutating requests
✔ csrfProtection accepts matching token pair
✔ setCsrfCookie sets same-site cookie for local requests
✔ setCsrfCookie sets cross-site cookie attributes for remote origins
✔ sendSuccess writes a success payload
✔ sendError writes a failure payload
✔ validateEnv throws when required variables are missing
✔ validateEnv throws when JWT secret is too short
✔ validateEnv warns on missing recommended variables without throwing
✔ env export reflects current environment values
✔ Level boundaries verification
✔ Rank title tier verification
✔ XP Gain calculation per question difficulty
✔ First-time solve vs repeated solve idempotency simulation

tests 15 | pass 15 | fail 0 | duration_ms 140.7ms
```
