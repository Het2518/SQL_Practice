import fs from 'fs';
const css = fs.readFileSync('src/styles.css', 'utf8');
const lines = css.split('\n');
const headers = lines.filter(l => l.includes('/* ──'));
console.log(headers.join('\n'));
