const fs = require('fs');

const f = fs.readFileSync('src/types.jsx', 'utf-8');
const m = f.match(/library:\s*\{[\s\S]*?tables:\s*\[([\s\S]*?)\]\n\s*\}/);
const tablesStr = '[' + m[1] + ']';
const tables = JSON.parse(tablesStr);

let erDef = 'erDiagram\n';
tables.forEach(t => {
  erDef += t.name + ' {\n';
  t.columns.forEach(c => {
    erDef += '  ' + (c.type||'').replace(/[^A-Za-z0-9_]/g, '') + ' ' + c.name + ' ' + (c.isPrimaryKey?'PK':c.isForeignKey?'FK':'') + '\n';
  });
  erDef += '}\n';
});

tables.forEach(t => {
  t.columns.forEach(c => {
    if(c.isForeignKey) {
      erDef += c.references + ' ||--o{ ' + t.name + ' : "has"\n';
    }
  });
});

console.log(erDef);
