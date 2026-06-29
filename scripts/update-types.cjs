const fs = require('fs');
const parsed = require('../parsed_schemas.json');

let typesContent = fs.readFileSync('src/types.jsx', 'utf-8');

// Replace the tables array for each database
Object.keys(parsed).forEach(db => {
  const tables = parsed[db];
  
  // We need to replace the `tables: [...]` for the specific database.
  // The structure in types.jsx is:
  // dbName: {
  //   name: 'dbName',
  //   label: '...',
  //   ...,
  //   tables: [{...}, {...}]
  // },
  
  const dbRegex = new RegExp(`(${db}:\\s*\\{[\\s\\S]*?tables:\\s*\\[)([\\s\\S]*?)(\\]\\n\\s*\\}(?:,\\s*|\\n\\s*\\};))`);
  const match = typesContent.match(dbRegex);
  
  if (match) {
    // Generate the new tables string
    const newTablesStr = JSON.stringify(tables, null, 2)
      .replace(/^\[/m, '')
      .replace(/\]$/m, '')
      .split('\n')
      .map(line => '    ' + line)
      .join('\n');
      
    typesContent = typesContent.replace(dbRegex, `$1\n${newTablesStr}\n    $3`);
  }
});

fs.writeFileSync('src/types.jsx', typesContent);
console.log('Updated types.jsx');
