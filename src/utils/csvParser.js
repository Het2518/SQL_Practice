// A lightweight CSV parser that handles quoted commas
export function parseCSV(csvString) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];
    const nextChar = csvString[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentCell += '"';
      i++; // Skip escaped quote
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // Skip \n in \r\n
      if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

export function generateSqlFromCSV(tableName, csvString) {
  const rows = parseCSV(csvString);
  if (rows.length < 2) throw new Error("CSV must have at least a header row and one data row.");

  const headers = rows[0].map(h => h.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase());
  
  // Infer types based on the first data row
  const firstRow = rows[1];
  const types = firstRow.map(val => {
    if (!isNaN(Number(val)) && val.trim() !== '') return 'NUMERIC';
    return 'TEXT';
  });

  const createTableSQL = `CREATE TABLE ${tableName} (\n  ${headers.map((h, i) => `${h} ${types[i]}`).join(',\n  ')}\n);`;
  
  const insertStatements = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length !== headers.length) continue; // Skip malformed rows
    
    const values = row.map(val => {
      if (val === null || val === undefined || val === '') return 'NULL';
      if (!isNaN(Number(val)) && val.trim() !== '') return val;
      // Escape single quotes for SQL
      return `'${val.replace(/'/g, "''")}'`;
    });
    
    insertStatements.push(`INSERT INTO ${tableName} VALUES (${values.join(', ')});`);
  }

  return {
    createTableSQL,
    insertStatements: insertStatements.join('\n'),
    schema: {
      tableName,
      columns: headers.map((h, i) => ({ name: h, type: types[i] }))
    }
  };
}
