const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');
fs.writeFileSync('src/App.jsx', lines.slice(0, 477).join('\n'), 'utf8');
console.log('Done. Lines now:', lines.slice(0,477).length);
