const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const databases = [
  'hospital', 'ecommerce', 'university', 'airlines', 'banking', 
  'hr', 'movies', 'library', 'sports', 'music'
];

const TARGET_ROWS = 50000;

const sqlDir = path.join(__dirname, '../src/data/databases');
const outputDir = path.join(__dirname, '../public/databases');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function processDatabase(dbName) {
  console.log(`\nProcessing ${dbName}...`);
  const sqlPath = path.join(sqlDir, `${dbName}.sql`);
  const outPath = path.join(outputDir, `${dbName}.sqlite`);
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`Missing ${sqlPath}`);
    return;
  }
  
  // Remove existing DB file if it exists
  if (fs.existsSync(outPath)) {
    fs.unlinkSync(outPath);
  }
  
  const db = new Database(outPath);
  
  // 1. Run the original schema and initial seeds
  db.exec('PRAGMA foreign_keys = OFF;');
  const originalSql = fs.readFileSync(sqlPath, 'utf-8');
  db.exec(originalSql);
  
  // 2. Find all tables
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all().map(t => t.name);
  
  // 3. For each table, amplify data to TARGET_ROWS
  for (const table of tables) {
    const existingRows = db.prepare(`SELECT * FROM ${table}`).all();
    if (existingRows.length === 0) continue;
    
    let currentCount = existingRows.length;
    if (currentCount >= TARGET_ROWS) {
      console.log(` - ${table} already has ${currentCount} rows.`);
      continue;
    }
    
    const needed = TARGET_ROWS - currentCount;
    
    // Get table info (columns, types, pk)
    const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all();
    
    // We will build an insert statement
    const columns = tableInfo.map(c => c.name);
    const placeholders = columns.map(() => '?').join(', ');
    const insertStmt = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`);
    
    // Find primary key columns
    const pkColumns = tableInfo.filter(c => c.pk > 0).map(c => c.name);
    
    // Calculate max PK if integer
    let maxPkValues = {};
    for (const pk of pkColumns) {
       const pkColInfo = tableInfo.find(c => c.name === pk);
       if (pkColInfo.type.toUpperCase().includes('INT')) {
         const maxRes = db.prepare(`SELECT MAX(${pk}) as m FROM ${table}`).get();
         maxPkValues[pk] = maxRes ? (maxRes.m || 0) : 0;
       }
    }
    
    console.log(` - Multiplying ${table} from ${currentCount} to ${TARGET_ROWS}...`);
    
    // Fast transaction for bulk insert
    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        insertStmt.run(row);
      }
    });
    
    // Generate rows in chunks to save memory
    let remaining = needed;
    const chunkSize = 10000;
    
    let sourceIndex = 0;
    
    while (remaining > 0) {
      const batchSize = Math.min(remaining, chunkSize);
      const batch = [];
      
      for (let i = 0; i < batchSize; i++) {
        // Pick a base row to clone
        const baseRow = existingRows[sourceIndex % existingRows.length];
        sourceIndex++;
        
        // Construct new row
        const newRowParams = columns.map(col => {
           const info = tableInfo.find(c => c.name === col);
           let val = baseRow[col];
           
           if (info.pk > 0) {
              if (info.type.toUpperCase().includes('INT')) {
                 maxPkValues[col]++;
                 return maxPkValues[col];
              } else {
                 return val + '_' + sourceIndex;
              }
           }
           
           // If UNIQUE constraint exists, we'd theoretically need to modify it, but PRAGMA table_info doesn't easily show unique.
           // For simplicity in a vast DB, we'll append an index to strings to avoid potential unique constraints on emails, usernames etc.
           if (info.type.toUpperCase().includes('CHAR') || info.type.toUpperCase().includes('TEXT')) {
              // We'll append an ID to avoid unique collisions, but only for certain likely columns
              if (col.toLowerCase().includes('email') || col.toLowerCase().includes('name') || col.toLowerCase().includes('code')) {
                 return val + '_' + sourceIndex;
              }
           }
           
           return val;
        });
        batch.push(newRowParams);
      }
      
      insertMany(batch);
      remaining -= batchSize;
    }
  }
  
  db.close();
  console.log(`Finished ${dbName}!`);
}

for (const db of databases) {
  try {
    processDatabase(db);
  } catch (e) {
    console.error(`Error processing ${db}:`, e);
  }
}
