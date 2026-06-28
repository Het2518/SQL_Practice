import fs from 'fs';
import path from 'path';

const dir = 'src/data/databases';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));

for (const file of files) {
  const filePath = path.join(dir, file);
  const c = fs.readFileSync(filePath, 'utf-8');
  
  // Extract all tables
  const tables = [...c.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)].map(m => m[1]);
  
  // Extract all relationships
  const edges = [];
  const tableBodies = [...c.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*?)\);/g)];
  
  for (const [_, tableName, body] of tableBodies) {
    const refs = [...body.matchAll(/REFERENCES (\w+)/g)].map(m => m[1]);
    for (const ref of refs) {
      edges.push([tableName, ref]);
      edges.push([ref, tableName]); // Undirected for connectivity
    }
  }

  // Find disconnected components
  const visited = new Set();
  const components = [];
  
  for (const table of tables) {
    if (!visited.has(table)) {
      const component = [];
      const queue = [table];
      visited.add(table);
      
      while (queue.length > 0) {
        const curr = queue.shift();
        component.push(curr);
        
        for (const [u, v] of edges) {
          if (u === curr && !visited.has(v)) {
            visited.add(v);
            queue.push(v);
          }
        }
      }
      components.push(component);
    }
  }
  
  if (components.length > 1) {
    console.log(`\n❌ ${file} has disconnected components:`);
    components.forEach((comp, i) => console.log(`  Component ${i + 1}: ${comp.join(', ')}`));
  } else {
    console.log(`\n✅ ${file} is fully connected.`);
  }
}
