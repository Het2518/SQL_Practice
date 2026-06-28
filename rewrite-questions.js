import fs from 'fs';
import path from 'path';

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'NVIDIA', 'Oracle',
  'Salesforce', 'Atlassian', 'ServiceNow', 'Uber', 'Airbnb', 'Stripe', 'Databricks',
  'TCS', 'Infosys', 'Accenture', 'JPMorgan Chase', 'Goldman Sachs'
];

const topics = {
  easy: ['Basic SQL (SELECT, WHERE, GROUP BY, ORDER BY)', 'Keys & Constraints', 'Aggregate Functions', 'Database Design'],
  medium: ['Joins', 'Subqueries', 'Views', 'Execution Order', 'ER Modeling', 'Normalization'],
  hard: ['Window Functions', 'CTEs', 'Query Optimization', 'Transactions & ACID', 'Locks & Deadlocks', 'Indexing', 'Stored Procedures & Triggers', 'Sharding & Partitioning']
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

  // Format 1: Object literal `difficulty: '...', ... prompt: '...'`
  let currentDifficulty = 'medium';
  content = content.replace(/(difficulty:\s*['"](.*?)['"]|prompt:\s*(['"`])(.*?)(?<!\\)\3)/g, (match, p1, diff, quote, prompt) => {
    if (match.startsWith('difficulty:')) {
      currentDifficulty = diff;
      return match;
    } else if (match.startsWith('prompt:')) {
      if (prompt.includes('Interview Question:')) return match;
      const company = getRandomElement(companies);
      const diffTopics = topics[currentDifficulty] || topics['medium'];
      const topic = getRandomElement(diffTopics);
      totalReplaced++;
      return `prompt: ${quote}[${company} Interview Question | Topic: ${topic}] ${prompt}${quote}`;
    }
    return match;
  });

  // Format 2: `q(id, 'diff', [kw], 'prompt'` or `make(id, 'db', 'diff', [kw], 'prompt'`
  // regex to match `(?:q|make)\(\s*\d+\s*,.*?(?:'easy'|'medium'|'hard').*?,\s*\[.*?\]\s*,\s*(['"`])(.*?)(?<!\\)\1/g;
  // Let's just match any function call that has a difficulty string and an array of keywords.
  // Actually, airlines has: make(181, 'airlines', 'easy', ['Select'], 'prompt', ...
  // hr has: q(301, 'easy', ['Select'], 'prompt', ...
  
  const qRegex = /(?:q|make)\(.*?(?:'easy'|'medium'|'hard').*?,\s*\[.*?\].*?,\s*(['"`])(.*?)(?<!\\)\1/g;
  content = content.replace(qRegex, (match, quote, prompt) => {
    if (prompt.includes('Interview Question:')) return match;
    
    let diffMatch = match.match(/(?:'easy'|'medium'|'hard')/);
    let diff = diffMatch ? diffMatch[0].replace(/'/g, '') : 'medium';
    
    const company = getRandomElement(companies);
    const diffTopics = topics[diff] || topics['medium'];
    const topic = getRandomElement(diffTopics);
    totalReplaced++;
    
    const prefix = match.substring(0, match.length - prompt.length - 1);
    return `${prefix}[${company} Interview Question | Topic: ${topic}] ${prompt}${quote}`;
  });

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}: ${totalReplaced} questions modernized.`);
}
