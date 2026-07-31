/**
 * Enhanced parser to extract ON conditions and handle aliases properly.
 * Adds try-catch to prevent regex infinite backtracking crashes on complex SQL.
 */
export const detectTablesAndJoins = (sql) => {
  try {
    if (!sql || typeof sql !== 'string') return { tables: [], joins: [] };

    // Simplify subqueries to avoid parsing their internal joins
    let cleanSql = sql.replace(/\([^)]+\)/g, '(SUBQUERY)');
    
    // Extract all FROM and JOIN tables with optional aliases
    const tablePattern = /\b(?:FROM|JOIN)\s+([a-zA-Z0-9_.]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?\b/gi;
    const tables = [];
    let match;
    while ((match = tablePattern.exec(cleanSql)) !== null) {
      const rawAlias = match[2] || '';
      const isKeyword = ['ON', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LEFT', 'RIGHT', 'INNER', 'FULL', 'CROSS', 'JOIN'].includes(rawAlias.toUpperCase());
      tables.push({
        name: match[1].split('.').pop(),
        alias: isKeyword ? null : rawAlias,
        index: match.index
      });
    }

    // Extract Joins and their ON conditions
    const joinPattern = /\b(INNER\s+JOIN|LEFT\s+(?:OUTER\s+)?JOIN|RIGHT\s+(?:OUTER\s+)?JOIN|FULL\s+(?:OUTER\s+)?JOIN|CROSS\s+JOIN|JOIN)\b\s+([a-zA-Z0-9_.]+)(?:\s+(?:AS\s+)?[a-zA-Z0-9_]+)?(?:\s+ON\s+([\s\S]*?))?(?=\b(?:INNER|LEFT|RIGHT|FULL|CROSS|JOIN|WHERE|GROUP|ORDER|LIMIT)\b|$)/gi;
    const joins = [];
    
    // Safety break for infinite loops
    let iterations = 0;
    while ((match = joinPattern.exec(cleanSql)) !== null && iterations < 50) {
      iterations++;
      joins.push({
        type: match[1].trim().toUpperCase().replace(/\s+OUTER\s+/, ' '),
        rightTable: match[2].split('.').pop(),
        condition: match[3] ? match[3].replace(/;+\s*$/, '').trim() : null,
        index: match.index
      });
    }
    
    return { tables, joins };
  } catch (error) {
    console.warn("SQL Regex Parser failed to parse joins gracefully", error);
    return { tables: [], joins: [] };
  }
};
