/**
 * interviewUtils.js
 * Helpers for evaluating, comparing, and formatting SQL results in the Interview Arena.
 */

export function formatTime(seconds) {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Compares actual SQLite query results against expected output rows.
 * Handles column ordering, numeric tolerances, case sensitivity, and nulls.
 */
export function compareQueryResult(userResult, expectedOutput) {
  if (!userResult) return { status: 'idle' };

  if (userResult.error) {
    return {
      status: 'error',
      message: userResult.error,
      userCols: [],
      userRows: [],
      expectedCols: [],
      expectedRows: [],
      match: false,
    };
  }

  const userRows = Array.isArray(userResult.rows) ? userResult.rows : [];
  const userCols = Array.isArray(userResult.columns) ? userResult.columns : [];

  if (!expectedOutput || !Array.isArray(expectedOutput) || expectedOutput.length === 0) {
    return {
      status: 'accepted',
      message: `Query executed successfully (${userRows.length} rows returned).`,
      match: true,
      userCols,
      userRows,
      expectedCols: userCols,
      expectedRows: [],
    };
  }

  const firstExpected = expectedOutput[0] || {};
  const expectedCols = Object.keys(firstExpected);
  const expectedRows = expectedOutput;

  // 1. Column matching check (case-insensitive)
  const normUserCols = userCols.map((c) => String(c).toLowerCase().trim());
  const normExpectedCols = expectedCols.map((c) => String(c).toLowerCase().trim());

  const colCountMatch = normUserCols.length === normExpectedCols.length;
  const allExpectedColsPresent = normExpectedCols.every((ec) => normUserCols.includes(ec));

  // 2. Row count check
  const rowCountMatch = userRows.length === expectedRows.length;

  // 3. Row values comparison (top-to-bottom)
  let valuesMatch = colCountMatch && allExpectedColsPresent && rowCountMatch;

  if (valuesMatch) {
    for (let ri = 0; ri < userRows.length; ri++) {
      const uRow = userRows[ri];
      const eRow = expectedRows[ri];

      for (let ci = 0; ci < userCols.length; ci++) {
        const uColName = userCols[ci];
        const uVal = uRow[ci];

        // Find matching key in expected object (case-insensitive)
        const eKey = expectedCols.find(
          (k) => k.toLowerCase().trim() === uColName.toLowerCase().trim()
        );
        const eVal = eKey !== undefined ? eRow[eKey] : undefined;

        // Compare nulls / undefined
        const uIsNull = uVal === null || uVal === undefined;
        const eIsNull = eVal === null || eVal === undefined;

        if (uIsNull && eIsNull) continue;
        if (uIsNull !== eIsNull) {
          valuesMatch = false;
          break;
        }

        // Compare numbers
        const numU = Number(uVal);
        const numE = Number(eVal);
        if (!isNaN(numU) && !isNaN(numE) && typeof uVal !== 'boolean' && typeof eVal !== 'boolean') {
          if (Math.abs(numU - numE) > 0.005) {
            valuesMatch = false;
            break;
          }
        } else {
          // Compare strings
          const strU = String(uVal).trim().toLowerCase();
          const strE = String(eVal).trim().toLowerCase();
          if (strU !== strE) {
            valuesMatch = false;
            break;
          }
        }
      }

      if (!valuesMatch) break;
    }
  }

  if (valuesMatch) {
    return {
      status: 'accepted',
      message: 'Output Matches Expected Result!',
      match: true,
      userCols,
      userRows,
      expectedCols,
      expectedRows,
      rowCountMatch: true,
      colCountMatch: true,
    };
  }

  let failureReason = 'Output data does not match the expected result.';
  if (!colCountMatch || !allExpectedColsPresent) {
    failureReason = `Column mismatch. Expected [${expectedCols.join(', ')}], got [${userCols.join(', ')}].`;
  } else if (!rowCountMatch) {
    failureReason = `Row count mismatch. Expected ${expectedRows.length} rows, got ${userRows.length} rows.`;
  }

  return {
    status: 'wrong_answer',
    message: failureReason,
    match: false,
    userCols,
    userRows,
    expectedCols,
    expectedRows,
    rowCountMatch,
    colCountMatch,
  };
}
