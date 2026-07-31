export const CONCEPTS = {
  joins: {
    title: "JOIN Operations",
    tldr: "JOINs combine rows from two or more tables based on a related column.",
    keyPoints: [
      "INNER JOIN returns only matching rows from both tables",
      "LEFT JOIN returns all rows from left table + matched rows from right (NULLs for no match)",
      "RIGHT JOIN is the mirror of LEFT JOIN",
      "FULL OUTER JOIN returns all rows from both tables",
      "SQL evaluates JOINs before WHERE — filter logic goes in ON or WHERE accordingly"
    ],
    commonMistakes: [
      "Forgetting the ON condition → produces a CROSS JOIN",
      "Using WHERE for OUTER JOIN filters instead of ON (eliminates NULLs unintentionally)",
      "Joining on non-indexed columns → full table scan"
    ],
    interviewQuestion: "What is the difference between WHERE and ON in a LEFT JOIN?"
  },
  groupby: {
    title: "Aggregation & GROUP BY",
    tldr: "GROUP BY partitions your result set into distinct groups to calculate aggregates.",
    keyPoints: [
      "Any column in the SELECT clause that is not wrapped in an aggregate function MUST be in the GROUP BY clause.",
      "Aggregate functions (SUM, AVG, COUNT, etc.) ignore NULL values.",
      "COUNT(*) counts all rows, while COUNT(column) counts only non-NULL rows in that column."
    ],
    commonMistakes: [
      "Selecting a non-aggregated column without grouping it.",
      "Trying to filter grouped results using WHERE instead of HAVING."
    ],
    interviewQuestion: "Why does COUNT(*) sometimes return a different number than COUNT(column_name)?"
  },
  having: {
    title: "HAVING vs WHERE",
    tldr: "WHERE filters rows BEFORE grouping. HAVING filters groups AFTER grouping.",
    keyPoints: [
      "WHERE cannot contain aggregate functions.",
      "HAVING is almost always used in conjunction with GROUP BY.",
      "Using HAVING without GROUP BY treats the entire table as a single group."
    ],
    commonMistakes: [
      "Putting an aggregate like SUM(sales) > 1000 in the WHERE clause.",
      "Filtering individual row conditions in HAVING instead of WHERE (which is less efficient)."
    ],
    interviewQuestion: "Can you use aliases defined in the SELECT clause inside a HAVING clause?"
  },
  window: {
    title: "Window Functions",
    tldr: "Window functions perform calculations across a set of rows related to the current row, without collapsing them into a single row like GROUP BY.",
    keyPoints: [
      "Always require an OVER() clause.",
      "PARTITION BY divides the window into groups (similar to GROUP BY).",
      "ORDER BY inside OVER() defines the sequence of rows within the partition."
    ],
    commonMistakes: [
      "Confusing ROW_NUMBER() (always sequential) with RANK() (allows ties and skips numbers).",
      "Trying to use window functions in the WHERE clause (they are evaluated too late in the execution order)."
    ],
    interviewQuestion: "What is the difference between RANK() and DENSE_RANK()?"
  },
  cte: {
    title: "Common Table Expressions (CTEs)",
    tldr: "CTEs create temporary, named result sets that exist only during the execution of a single query.",
    keyPoints: [
      "Defined using the WITH keyword.",
      "Improves readability compared to deeply nested subqueries.",
      "Can reference other CTEs defined earlier in the same WITH clause.",
      "Recursive CTEs can traverse hierarchical data (like org charts)."
    ],
    commonMistakes: [
      "Forgetting the comma between multiple CTE definitions.",
      "Thinking CTEs improve performance (they are often just syntactic sugar for subqueries)."
    ],
    interviewQuestion: "Can a CTE reference itself? If so, how?"
  }
};

export const CONCEPT_TRIGGERS = {
  'JOIN': 'joins',
  'GROUP BY': 'groupby',
  'HAVING': 'having',
  'OVER\\s*\\(': 'window',
  'WITH\\s+': 'cte'
};
