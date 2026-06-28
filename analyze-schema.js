import fs from 'fs';
import path from 'path';

const dir = 'src/data/databases';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));

for (const file of files) {
  const filePath = path.join(dir, file);
  const c = fs.readFileSync(filePath, 'utf-8');
  
  const tablesMatch = [...c.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\);/g)];
  const tableNames = tablesMatch.map(m => m[1]);
  
  const isolated = [];
  const missingRefs = [];
  const danglingRefs = [];
  
  for (const [_, tableName, body] of tablesMatch) {
    const hasFK = body.includes('REFERENCES');
    const isReferenced = c.includes('REFERENCES ' + tableName);
    
    if (!hasFK && !isReferenced) {
      isolated.push(tableName);
    }
    
    // Check all lines for _id columns
    const lines = body.split(',').map(l => l.trim()).filter(l => l);
    for (const line of lines) {
      // Find columns ending in _id
      const idMatch = line.match(/^(\w+_id)\s/);
      if (idMatch) {
        const colName = idMatch[1];
        // If it's a primary key, ignore
        if (line.includes('PRIMARY KEY')) continue;
        // If it's unique, ignore unless it's a FK
        // If it has no REFERENCES, it's a missing ref
        if (!line.includes('REFERENCES')) {
          missingRefs.push(`${tableName}.${colName}`);
        } else {
          // Check if referenced table exists
          const refMatch = line.match(/REFERENCES\s+(\w+)\s*\(/);
          if (refMatch) {
            const refTable = refMatch[1];
            if (!tableNames.includes(refTable)) {
              danglingRefs.push(`${tableName}.${colName} -> ${refTable}`);
            }
          }
        }
      }
    }
  }
  
  if (isolated.length || missingRefs.length || danglingRefs.length) {
    console.log(`\n📄 ${file}`);
    if (isolated.length) console.log(`  Isolated tables:`, isolated);
    if (missingRefs.length) console.log(`  Unreferenced _id columns:`, missingRefs);
    if (danglingRefs.length) console.log(`  Dangling references:`, danglingRefs);
  }
}
