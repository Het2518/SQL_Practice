import fs from 'fs';
import path from 'path';

const SRC_DIR = path.join(process.cwd(), 'src');
const cssPath = path.join(SRC_DIR, 'styles.css');
const stylesDir = path.join(SRC_DIR, 'styles');

if (!fs.existsSync(stylesDir)) {
  fs.mkdirSync(stylesDir);
}

const lines = fs.readFileSync(cssPath, 'utf8').split('\n');

const files = {
  'variables.css': [],
  'ui.css': [],
  'home.css': [],
  'practice.css': [],
  'mobile.css': []
};

let currentFile = 'variables.css';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('/* ── Buttons ── */')) {
    currentFile = 'ui.css';
  } else if (line.includes('/* ────────────────── Navbar ────────────────── */')) {
    currentFile = 'home.css';
  } else if (line.includes('/* ── Top Navbar ── */')) {
    currentFile = 'practice.css';
  } else if (line.includes('/* ── Responsive Layout ── */') || line.includes('/* ── Responsive ── */')) {
    currentFile = 'mobile.css';
  }

  files[currentFile].push(line);
}

// Write the files
for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(stylesDir, filename), content.join('\n').trim() + '\n');
}

// Rewrite styles.css to just import them
const mainStyles = `
@import './styles/variables.css';
@import './styles/ui.css';
@import './styles/home.css';
@import './styles/practice.css';
@import './styles/mobile.css';
`;

fs.writeFileSync(cssPath, mainStyles.trim() + '\n');
console.log('CSS split into modular files successfully!');
