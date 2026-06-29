const fs = require('fs');
const path = require('path');

const dbNames = ['hospital', 'ecommerce', 'university', 'airlines', 'banking', 'hr', 'movies', 'library', 'sports', 'music'];

function parseSql(sql) {
  const tables = [];
  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  let match;
  
  while ((match = createTableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const columnsText = match[2];
    
    // Split columns by comma, but be careful with commas inside parens (like CHECK(x IN (1,2)))
    let cols = [];
    let cur = '';
    let parenLevel = 0;
    for (let i = 0; i < columnsText.length; i++) {
      const char = columnsText[i];
      if (char === '(') parenLevel++;
      else if (char === ')') parenLevel--;
      else if (char === ',' && parenLevel === 0) {
        cols.push(cur.trim());
        cur = '';
        continue;
      }
      cur += char;
    }
    if (cur.trim()) cols.push(cur.trim());
    
    const parsedCols = [];
    for (let colStr of cols) {
      if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)/i.test(colStr)) {
        const fkMatch = colStr.match(/FOREIGN\s+KEY\s*\(([^\)]+)\)\s+REFERENCES\s+([a-zA-Z0-9_]+)/i);
        if (fkMatch) {
          const colName = fkMatch[1].trim();
          const refTable = fkMatch[2].trim();
          const existingCol = parsedCols.find(c => c.name === colName);
          if (existingCol) {
            existingCol.isForeignKey = true;
            existingCol.references = refTable;
          }
        }
        continue;
      }
      
      const parts = colStr.split(/\s+/);
      const colName = parts[0];
      const type = parts[1] || 'TEXT';
      const col = { name: colName, type: type };
      if (/PRIMARY\s+KEY/i.test(colStr)) col.isPrimaryKey = true;
      if (/REFERENCES\s+([a-zA-Z0-9_]+)/i.test(colStr)) {
        col.isForeignKey = true;
        col.references = colStr.match(/REFERENCES\s+([a-zA-Z0-9_]+)/i)[1];
      }
      if (!/NOT\s+NULL/i.test(colStr) && !/PRIMARY\s+KEY/i.test(colStr)) {
        col.isNullable = true;
      }
      parsedCols.push(col);
    }
    
    tables.push({ name: tableName, columns: parsedCols });
  }
  return tables;
}

const allDbs = {};

dbNames.forEach(db => {
  const sql = fs.readFileSync(path.join('src/data/databases', `${db}.sql`), 'utf-8');
  const tables = parseSql(sql);
  allDbs[db] = tables;
});

fs.writeFileSync('parsed_schemas.json', JSON.stringify(allDbs, null, 2));
console.log('Saved parsed_schemas.json');
