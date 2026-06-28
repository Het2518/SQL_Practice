/**
 * convert-to-js.cjs
 * Converts all .ts/.tsx files in src/ to .js/.jsx files in src-js/
 * by stripping TypeScript-only syntax using simple regex patterns.
 * 
 * Run: node convert-to-js.cjs
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUT_DIR = path.join(__dirname, 'src-js');

function stripTypes(code, isJsx) {
  // Remove `import type { ... } from '...'` lines entirely
  code = code.replace(/^import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\s*\n/gm, '');
  // Remove `import type X from '...'` lines entirely
  code = code.replace(/^import\s+type\s+\w+\s+from\s+['"][^'"]+['"];?\s*\n/gm, '');
  // Remove `export type { ... }` lines
  code = code.replace(/^export\s+type\s+\{[^}]*\};?\s*\n/gm, '');
  // Remove inline type imports: `import { type X, Y }` -> `import { Y }`
  code = code.replace(/,?\s*type\s+\w+/g, '');

  // Remove type annotations from variables: `: SomeType` and `<SomeType>`
  // Remove `: ReturnType` on function signatures
  // These are done carefully to avoid breaking JS object syntax

  // Remove `as Type` casts (but not `as` keyword in imports)
  code = code.replace(/\)\s+as\s+[A-Z][A-Za-z<>\[\]{},\s|&]*(?=[;\),\n])/g, ')');

  // Remove interface declarations (multi-line)
  code = code.replace(/^(export\s+)?interface\s+\w+[\s\S]*?^\}/gm, '');

  // Remove type alias declarations
  code = code.replace(/^(export\s+)?type\s+\w+\s*=[\s\S]*?;/gm, '');

  // Remove generic type parameters from function calls and declarations: `<T, U>`
  // This is tricky — we remove simple generics that look like TypeScript
  // Pattern: function Foo<T>( or const x = foo<T>(
  code = code.replace(/(<)([A-Z][A-Za-z,\s\[\]|&?]*?)(>)(?=\s*[\(\{])/g, '');

  // Remove typed parameters: `param: SomeType` -> `param`
  // Only when followed by `,` or `)` or `=`
  code = code.replace(/(\w+)\s*\??\s*:\s*[A-Z][A-Za-z<>\[\]{|&\s,?.]*(?=[,)=])/g, '$1');
  // Remove `: void`, `: string`, `: number`, `: boolean`, `: null`, `: never`, `: any`
  code = code.replace(/:\s*(void|string|number|boolean|null|never|any|unknown|object)\b/g, '');
  // Remove `: Record<K, V>` patterns
  code = code.replace(/:\s*Record<[^>]+>/g, '');
  // Remove return type annotations on functions: `): SomeType {` -> `) {`
  code = code.replace(/\)\s*:\s*[A-Z][A-Za-z<>\[\]{|&\s,?.]*(?=\s*[{])/g, ')');
  code = code.replace(/\)\s*:\s*[a-z]+(?=\s*[{])/g, ')');

  // Remove `as const`
  code = code.replace(/\s+as\s+const\b/g, '');

  // Remove `declare` statements
  code = code.replace(/^declare\s+.*\n/gm, '');
  // Remove `declare global { ... }`
  code = code.replace(/declare\s+global\s*\{[\s\S]*?\n\}/gm, '');

  // Remove `export type` keyword from re-exports
  code = code.replace(/export\s+type\s+/g, 'export ');

  return code;
}

function convertFile(filePath, outPath) {
  const ext = path.extname(filePath);
  const isTs = ext === '.ts';
  const isTsx = ext === '.tsx';

  if (!isTs && !isTsx) {
    // Just copy non-TS files
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.copyFileSync(filePath, outPath);
    return;
  }

  const outExt = isTsx ? '.jsx' : '.js';
  const outFilePath = outPath.replace(/\.(tsx|ts)$/, outExt);

  let code = fs.readFileSync(filePath, 'utf8');
  code = stripTypes(code, isTsx);

  fs.mkdirSync(path.dirname(outFilePath), { recursive: true });
  fs.writeFileSync(outFilePath, code, 'utf8');
  console.log(`✅ ${path.relative(__dirname, filePath)} → ${path.relative(__dirname, outFilePath)}`);
}

function walkDir(dir, outDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(dir, entry.name);
    const outPath = path.join(outDir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules and assets
      if (entry.name === 'node_modules' || entry.name === 'assets' || entry.name === 'databases') {
        continue;
      }
      walkDir(srcPath, outPath);
    } else {
      convertFile(srcPath, outPath);
    }
  }
}

// Clean output dir
if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true });
}

walkDir(SRC_DIR, OUT_DIR);

// Copy styles.css
fs.copyFileSync(path.join(SRC_DIR, 'styles.css'), path.join(OUT_DIR, 'styles.css'));
// Copy index.css if exists
const indexCss = path.join(SRC_DIR, 'index.css');
if (fs.existsSync(indexCss)) {
  fs.copyFileSync(indexCss, path.join(OUT_DIR, 'index.css'));
}
// Copy App.css if exists
const appCss = path.join(SRC_DIR, 'App.css');
if (fs.existsSync(appCss)) {
  fs.copyFileSync(appCss, path.join(OUT_DIR, 'App.css'));
}

console.log('\n🎉 Conversion complete! Output in src-js/');
