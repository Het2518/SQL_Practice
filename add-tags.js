import fs from 'fs';
import path from 'path';

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'NVIDIA', 'Oracle',
  'Salesforce', 'Atlassian', 'ServiceNow', 'Uber', 'Airbnb', 'Stripe', 'Databricks',
  'TCS', 'Infosys', 'Accenture', 'JPMorgan Chase', 'Goldman Sachs'
];

const topics = {
  easy: ['Basic SQL', 'Keys & Constraints', 'Aggregate Functions', 'Database Design'],
  medium: ['Joins', 'Subqueries', 'Views', 'Execution Order', 'ER Modeling', 'Normalization'],
  hard: ['Window Functions', 'CTEs', 'Query Optimization', 'Transactions', 'Locks', 'Indexing']
};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const dir = 'src/data/questions';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  let totalReplaced = 0;

  // For ecommerce and hospital (object literals)
  // We look for difficulty, then keywords, and append to keywords.
  // match `difficulty: '...', \n keywords: ['...'],`
  let currentDiff = 'medium';
  content = content.replace(/difficulty:\s*['"](.*?)['"]/g, (match, diff) => {
    currentDiff = diff;
    return match;
  });

  // Actually a better way: match `keywords:\s*\[(.*?)\]` and replace it
  // But we need difficulty. Since difficulty comes right before keywords in the object...
  content = content.replace(/difficulty:\s*['"](.*?)['"],\s*keywords:\s*\[(.*?)\]/g, (match, diff, innerKw) => {
    // If it already has company:, skip it
    if (innerKw.includes('company:')) return match;
    
    const company = getRandomElement(companies);
    const diffTopics = topics[diff] || topics['medium'];
    const topic = getRandomElement(diffTopics);
    totalReplaced++;
    
    // innerKw might be empty or not.
    const comma = innerKw.trim() === '' ? '' : ', ';
    return `difficulty: '${diff}',\n  keywords: [${innerKw}${comma}'company:${company}', 'topic:${topic}']`;
  });

  // For the others (q or make functions)
  // match `q(id, 'diff', [kw], ...)`
  // `(?:q|make)\(\s*\d+\s*,.*?(?:'easy'|'medium'|'hard').*?,\s*\[(.*?)\]/g
  
  const fnRegex = /(?:q|make)\(\s*\d+\s*,.*?(?:'easy'|'medium'|'hard').*?,\s*\[(.*?)\]/g;
  content = content.replace(/(?:q|make)\(\s*\d+\s*,(?:\s*['"][^'"]*['"]\s*,)?\s*['"](.*?)['"]\s*,\s*\[(.*?)\]/g, (match, diff, innerKw) => {
    if (innerKw.includes('company:')) return match;

    const company = getRandomElement(companies);
    const diffTopics = topics[diff] || topics['medium'];
    const topic = getRandomElement(diffTopics);
    totalReplaced++;

    const comma = innerKw.trim() === '' ? '' : ', ';
    const replacement = `[${innerKw}${comma}'company:${company}', 'topic:${topic}']`;
    
    // Replace the `[innerKw]` at the end of the match
    return match.replace(`[${innerKw}]`, replacement);
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}: ${totalReplaced} questions modernized.`);
}
