const fs = require('fs');
const parsed = require('../parsed_schemas.json');
let typesContent = fs.readFileSync('src/types.jsx', 'utf-8');

const dbNames = Object.keys(parsed);

// Parse the row counts from the current typesContent using simpler regex
const rowCounts = {};
dbNames.forEach(db => {
  rowCounts[db] = {};
  
  // Find start of db object
  const startIdx = typesContent.indexOf(`\n  ${db}: {`);
  if (startIdx === -1) {
    const startIdx2 = typesContent.indexOf(`${db}: {`);
    if(startIdx2 === -1) return;
  }
  
  // Find tables array start for this db
  const dbStr = typesContent.substring(typesContent.indexOf(`${db}: {`));
  const tablesStartIdx = dbStr.indexOf('tables: [');
  
  // We just parse the whole file for name: '...', rowCount: ... inside this db
  // Find the next db to limit our search
  let endIdx = dbStr.length;
  for (let i = 0; i < dbNames.length; i++) {
    if (dbNames[i] !== db) {
      const nextDbIdx = dbStr.indexOf(`\n  ${dbNames[i]}: {`);
      if (nextDbIdx !== -1 && nextDbIdx > 0 && nextDbIdx < endIdx) {
        endIdx = nextDbIdx;
      }
    }
  }
  
  const tablesBlock = dbStr.substring(tablesStartIdx, endIdx);
  
  const tableRegex = /name:\s*'([^']+)',\s*rowCount:\s*(\d+)/g;
  let tMatch;
  while ((tMatch = tableRegex.exec(tablesBlock)) !== null) {
    rowCounts[db][tMatch[1]] = parseInt(tMatch[2], 10);
  }
});

dbNames.forEach(db => {
  const tables = parsed[db];
  tables.forEach(t => {
    t.rowCount = rowCounts[db][t.name] || 0;
  });
  
  const newTables = tables.map(t => {
    return {
      name: t.name,
      rowCount: t.rowCount,
      columns: t.columns
    };
  });
  
  // Replace the tables block for this DB
  const startMarker = `${db}: {`;
  const dbStart = typesContent.indexOf(startMarker);
  if (dbStart === -1) return;
  
  const tablesMarker = 'tables: [';
  const tablesStart = typesContent.indexOf(tablesMarker, dbStart);
  
  // Find the closing bracket of the tables array
  // By counting brackets
  let bracketCount = 0;
  let inString = false;
  let stringChar = '';
  let tablesEnd = -1;
  
  for (let i = tablesStart + tablesMarker.length - 1; i < typesContent.length; i++) {
    const char = typesContent[i];
    if ((char === "'" || char === '"' || char === '`') && typesContent[i-1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }
    
    if (!inString) {
      if (char === '[') bracketCount++;
      if (char === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          tablesEnd = i;
          break;
        }
      }
    }
  }
  
  if (tablesEnd !== -1) {
    const newTablesStr = JSON.stringify(newTables, null, 2)
      .replace(/^\[/m, '[')
      .split('\n')
      .map((line, idx) => idx === 0 ? line : '    ' + line)
      .join('\n');
      
    typesContent = typesContent.substring(0, tablesStart + 8) + 
                   newTablesStr + 
                   typesContent.substring(tablesEnd + 1);
  }
});

fs.writeFileSync('src/types.jsx', typesContent);
console.log('Fixed types.jsx using robust bracket parsing');
