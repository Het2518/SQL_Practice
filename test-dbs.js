import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

async function testDbs() {
  const SQL = await initSqlJs();
  const dir = 'src/data/databases';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    const sqlContent = fs.readFileSync(filePath, 'utf-8');
    
    try {
      const db = new SQL.Database();
      db.run(sqlContent);
      console.log(`✅ ${file} loaded successfully.`);
    } catch (e) {
      console.error(`❌ ${file} failed: ${e.message}`);
    }
  }
}

testDbs();
