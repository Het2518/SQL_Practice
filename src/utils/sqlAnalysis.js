/**
 * sqlAnalysis.js
 * Utility functions for parsing and analyzing SQL queries.
 */

// Parses a SQL query to detect which clauses it contains.
export const parseQueryClauses = (sql) => {
  const upperSql = sql.toUpperCase();
  return {
    hasFROM: /\bFROM\b/.test(upperSql),
    hasJOIN: /\bJOIN\b/.test(upperSql),
    hasWHERE: /\bWHERE\b/.test(upperSql),
    hasGROUPBY: /\bGROUP\s+BY\b/.test(upperSql),
    hasHAVING: /\bHAVING\b/.test(upperSql),
    hasDISTINCT: /\bDISTINCT\b/.test(upperSql),
    hasORDERBY: /\bORDER\s+BY\b/.test(upperSql),
    hasLIMIT: /\bLIMIT\b/.test(upperSql),
    hasCTE: /\bWITH\b/.test(upperSql),
    hasSubquery: /\(SELECT\b/i.test(sql),
  };
};

// Extremely basic extraction of the primary table from a FROM clause.
export const extractFromTable = (sql) => {
  const match = sql.match(/\bFROM\s+([a-zA-Z0-9_]+)/i);
  return match ? match[1] : null;
};

// Strips GROUP BY, HAVING, ORDER BY, LIMIT to leave just the WHERE clause (heuristic).
export const buildWhereOnlySql = (sql) => {
  let modified = sql;
  const stripRegexes = [
    /\bGROUP\s+BY\b[\s\S]*/i,
    /\bHAVING\b[\s\S]*/i,
    /\bORDER\s+BY\b[\s\S]*/i,
    /\bLIMIT\b[\s\S]*/i
  ];
  
  for (const regex of stripRegexes) {
    modified = modified.replace(regex, '');
  }
  return modified;
};

// Compute visual diff between two result sets
export const computeDiff = (expectedRows, actualRows) => {
  const diff = {
    missingRows: [],    // rows in expected but not in actual
    extraRows: [],      // rows in actual but not in expected
    mismatchedRows: [], // rows present in both but with different values
    matchedRows: [],    // perfectly correct rows
  };

  const normalizeRow = (row) => row.map(v => (v === null || v === undefined ? '__NULL__' : String(v).trim()));
  const expectedSerialized = expectedRows.map(row => JSON.stringify(normalizeRow(row)));
  const actualSerialized = actualRows.map(row => JSON.stringify(normalizeRow(row)));

  const actualMatchedIndices = new Set();

  expectedRows.forEach((row, i) => {
    const serialized = expectedSerialized[i];
    const actualIndex = actualSerialized.findIndex((act, j) => act === serialized && !actualMatchedIndices.has(j));
    
    if (actualIndex !== -1) {
      diff.matchedRows.push(row);
      actualMatchedIndices.add(actualIndex);
    } else {
      // Find closest match for mismatch diffing
      // Heuristic: row with highest number of identical cells
      let bestMatchIndex = -1;
      let maxMatches = -1;
      
      actualRows.forEach((actRow, j) => {
        if (actualMatchedIndices.has(j)) return;
        let matches = 0;
        const normRow = normalizeRow(row);
        const normAct = normalizeRow(actRow);
        for (let k = 0; k < Math.min(normRow.length, normAct.length); k++) {
          if (normRow[k] === normAct[k]) matches++;
        }
        if (matches > maxMatches && matches >= Math.floor(normRow.length / 2)) {
          maxMatches = matches;
          bestMatchIndex = j;
        }
      });

      if (bestMatchIndex !== -1) {
        diff.mismatchedRows.push({ expected: row, actual: actualRows[bestMatchIndex] });
        actualMatchedIndices.add(bestMatchIndex);
      } else {
        diff.missingRows.push(row);
      }
    }
  });

  actualRows.forEach((row, i) => {
    if (!actualMatchedIndices.has(i)) {
      diff.extraRows.push(row);
    }
  });

  return diff;
};

// ---- Schema Introspection (Phase 2) ----

// Extract FK relationships from sqlite
export const buildRelationshipMap = (db) => {
  if (!db) return [];
  try {
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0]?.values ?? [];
    const relationships = [];

    tables.forEach(([tableName]) => {
      const fkInfo = db.exec(`PRAGMA foreign_key_list(${tableName})`);
      if (fkInfo.length > 0 && fkInfo[0].values) {
        fkInfo[0].values.forEach(fk => {
          // PRAGMA foreign_key_list format: [id, seq, table, from, to, on_update, on_delete, match]
          relationships.push({
            fromTable: tableName,
            fromColumn: fk[3],   
            toTable: fk[2],      
            toColumn: fk[4],     
          });
        });
      }
    });

    return relationships;
  } catch (err) {
    console.error("Failed to build relationship map", err);
    return [];
  }
};

// BFS to find shortest join path between two tables
export const findJoinPath = (fromTable, toTable, relationships) => {
  // Build adjacency list (undirected for joins)
  const graph = {};
  relationships.forEach(r => {
    if (!graph[r.fromTable]) graph[r.fromTable] = [];
    if (!graph[r.toTable]) graph[r.toTable] = [];
    
    // Check if edge already exists to prevent duplicates
    if (!graph[r.fromTable].some(e => e.table === r.toTable)) {
      graph[r.fromTable].push({ table: r.toTable, fromCol: r.fromColumn, toCol: r.toColumn });
    }
    if (!graph[r.toTable].some(e => e.table === r.fromTable)) {
      graph[r.toTable].push({ table: r.fromTable, fromCol: r.toColumn, toCol: r.fromColumn });
    }
  });

  if (!graph[fromTable] || !graph[toTable]) return null;

  const queue = [[fromTable, [{ table: fromTable }]]];
  const visited = new Set([fromTable]);

  while (queue.length > 0) {
    const [current, path] = queue.shift();
    if (current === toTable) return path;

    for (const neighbor of (graph[current] || [])) {
      if (!visited.has(neighbor.table)) {
        visited.add(neighbor.table);
        queue.push([neighbor.table, [...path, neighbor]]);
      }
    }
  }
  return null; // No path found
};

// Generates the SQL string for a given join path
export const generateJoinSQL = (path) => {
  if (!path || path.length < 2) return '';
  let sql = `FROM ${path[0].table}\n`;
  for (let i = 1; i < path.length; i++) {
    const step = path[i];
    sql += `JOIN ${step.table} ON ${path[i-1].table}.${step.fromCol} = ${step.table}.${step.toCol}\n`;
  }
  return sql;
};

// Extract index metadata
export const getIndexInfo = (db, tableName) => {
  if (!db) return [];
  try {
    const indexes = db.exec(`PRAGMA index_list(${tableName})`);
    if (indexes.length === 0 || !indexes[0].values) return [];
    
    return indexes[0].values.map(idx => {
      // PRAGMA index_list format: [seq, name, unique, origin, partial]
      const indexName = idx[1];
      const isUnique = idx[2] === 1;
      
      const colInfo = db.exec(`PRAGMA index_info(${indexName})`);
      const columns = colInfo.length > 0 && colInfo[0].values 
        ? colInfo[0].values.map(col => col[2]) 
        : [];
      
      return { indexName, isUnique, columns, tableName };
    });
  } catch (err) {
    console.error("Failed to get index info for", tableName, err);
    return [];
  }
};

// ---- DBMS Theory Connectors (Phase 3) ----

const hasPrimaryKey = (columns) => {
  return columns.some(col => col.isPrimaryKey || col.name === 'id' || col.name.endsWith('_id'));
};

const hasPartialDependencies = (columns, indexes) => {
  return false; // Heuristic: assumed false unless explicitly violated in our educational DBs
};

const hasTransitiveDependencies = (columns, fks) => {
  const denormalizedKeywords = ['address', 'city', 'state', 'zip', 'country', 'manager_name'];
  return columns.some(col => 
    !col.isPrimaryKey && 
    !fks.some(fk => fk.from === col.name) &&
    denormalizedKeywords.some(keyword => col.name.toLowerCase().includes(keyword))
  );
};

export const analyzeNormalForm = (db, tableName) => {
  if (!db) return { nf: 'Unknown' };
  
  try {
    const colInfo = db.exec(`PRAGMA table_info(${tableName})`);
    const columns = colInfo.length > 0 && colInfo[0].values 
      ? colInfo[0].values.map(col => ({ name: col[1], type: col[2], isPrimaryKey: col[5] === 1 }))
      : [];
      
    const fkInfo = db.exec(`PRAGMA foreign_key_list(${tableName})`);
    const fks = fkInfo.length > 0 && fkInfo[0].values 
      ? fkInfo[0].values.map(fk => ({ from: fk[3], to: fk[4] })) 
      : [];
      
    const indexes = getIndexInfo(db, tableName);
    
    // 1NF: All columns atomic, has PK
    const is1NF = hasPrimaryKey(columns);
    
    // 2NF: 1NF + No partial dependencies
    const is2NF = is1NF && !hasPartialDependencies(columns, indexes);
    
    // 3NF: 2NF + No transitive dependencies
    const is3NF = is2NF && !hasTransitiveDependencies(columns, fks);
    
    return { 
      nf: is3NF ? '3NF' : is2NF ? '2NF' : is1NF ? '1NF' : 'Unnormalized', 
      is1NF, 
      is2NF, 
      is3NF 
    };
  } catch (err) {
    return { nf: 'Unknown' };
  }
};

// ---- Subquery to CTE Converter (Phase 4) ----

export const hasSubquery = (sql) => /\(\s*SELECT\b/i.test(sql);

const generateCTEName = (subquery) => {
  const tableMatch = subquery.match(/FROM\s+(\w+)/i);
  const table = tableMatch ? tableMatch[1] : 'subquery_data';
  const hasWhere = /WHERE/i.test(subquery);
  return hasWhere ? `filtered_${table}` : `all_${table}`;
};

export const convertSubqueryToCTE = (sql) => {
  // Simple heuristic based transformation for educational purposes
  const subqueryMatch = sql.match(/\((\s*SELECT[\s\S]+?)\)/i);
  if (!subqueryMatch) return null;
  
  const subquery = subqueryMatch[1].trim();
  const cteName = generateCTEName(subquery);
  
  const cteBlock = `WITH ${cteName} AS (\n  ${subquery}\n)`;
  const mainQuery = sql.replace(subqueryMatch[0], `(SELECT * FROM ${cteName})`);
  
  return `${cteBlock}\n${mainQuery}`;
};
