import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const questionsDir = path.resolve('src/data/questions');
const outputSqlFile = path.resolve('scripts/seed-massive.sql');

// 1. Generate 150+ Companies
const companyNames = Array.from(new Set([
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'Airbnb', 'Stripe', 'Square',
  'Twilio', 'Snowflake', 'Databricks', 'Palantir', 'Salesforce', 'Oracle', 'IBM', 'Intel', 'AMD', 'Nvidia',
  'Adobe', 'Atlassian', 'Shopify', 'Spotify', 'Twitter', 'Snap', 'Pinterest', 'Reddit', 'LinkedIn', 'Zoom',
  'Dropbox', 'Box', 'DocuSign', 'Okta', 'CrowdStrike', 'Zscaler', 'Cloudflare', 'Fastly', 'Akamai', 'Cisco',
  'VMware', 'Red Hat', 'Splunk', 'Elastic', 'MongoDB', 'Couchbase', 'Redis', 'Confluent', 'HashiCorp', 'GitLab',
  'GitHub', 'Bitbucket', 'Jira', 'Trello', 'Asana', 'Monday.com', 'Notion', 'Airtable', 'Smartsheet', 'Coda',
  'Figma', 'Canva', 'InVision', 'Sketch', 'Miro', 'Lucidchart', 'Zeplin', 'Framer', 'Webflow', 'Wix',
  'Squarespace', 'WordPress', 'BigCommerce', 'Magento', 'WooCommerce', 'Etsy', 'eBay', 'Walmart', 'Target',
  'Home Depot', 'Lowe\'s', 'Best Buy', 'Costco', 'Walgreens', 'CVS', 'Kroger', 'Safeway', 'Publix', 'HEB',
  'Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'Goldman Sachs', 'Morgan Stanley', 'JPMorgan', 'Barclays', 'HSBC', 'Credit Suisse',
  'UBS', 'Deutsche Bank', 'Capital One', 'American Express', 'Discover', 'Visa', 'Mastercard', 'PayPal', 'Venmo', 'Cash App',
  'Robinhood', 'Coinbase', 'Kraken', 'Binance', 'FTX', 'BlockFi', 'Celsius', 'Nexo', 'Gemini', 'Crypto.com',
  'SoFi', 'Affirm', 'Klarna', 'Afterpay', 'Sezzle', 'Quadpay', 'Zip', 'Splitit', 'Bread', 'Uplift',
  'Zillow', 'Redfin', 'Trulia', 'Realtor.com', 'Opendoor', 'Offerpad', 'Compass', 'eXp Realty', 'Keller Williams', 'RE/MAX',
  'Peloton', 'Mirror', 'Tonal', 'NordicTrack', 'Bowflex', 'Fitbit', 'Garmin', 'Apple Watch', 'Whoop', 'Oura'
]));

const categories = ['MNC', 'Startup', 'SaaS', 'FinTech', 'Cloud', 'Data', 'E-commerce', 'Social', 'Security', 'HealthTech'];

const companies = companyNames.map(name => ({
  id: crypto.randomUUID(),
  name: name.replace(/'/g, "''"),
  category: categories[Math.floor(Math.random() * categories.length)],
  description: `Top-tier ${categories[Math.floor(Math.random() * categories.length)]} company known for rigorous technical interviews.`
}));

// 2. Extract Questions from JSX files
let allQuestions = [];
const files = fs.readdirSync(questionsDir);
for (const file of files) {
  if (file.endsWith('.jsx') || file.endsWith('.js')) {
    const filePath = path.join(questionsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Quick hack to parse the JS array safely
    try {
      content = content.replace(/export\s+const\s+\w+\s*=\s*/, 'return ');
      const func = new Function(content);
      const arr = func();
      if (Array.isArray(arr)) {
        allQuestions.push(...arr);
      }
    } catch (e) {
      console.warn(`Could not parse ${file}: ${e.message}`);
    }
  }
}

console.log(`Successfully parsed ${allQuestions.length} questions from local files.`);

// 3. Map Questions to Companies dynamically
const mappings = [];
const processedQuestions = [];

for (const q of allQuestions) {
  const qId = crypto.randomUUID();
  processedQuestions.push({
    id: qId,
    title: q.prompt.substring(0, 50).replace(/'/g, "''") + '...',
    prompt: q.prompt.replace(/'/g, "''"),
    schema_name: q.db,
    difficulty: q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1),
    estimated_time_minutes: q.difficulty === 'hard' ? 25 : q.difficulty === 'medium' ? 15 : 5,
    solution_sql: (q.solutionSQL || '').replace(/'/g, "''")
  });

  // Assign 2-5 random companies to this question
  const numCompanies = Math.floor(Math.random() * 4) + 2;
  const shuffled = [...companies].sort(() => 0.5 - Math.random());
  for (let i = 0; i < numCompanies; i++) {
    mappings.push({
      question_id: qId,
      company_id: shuffled[i].id,
      frequency_score: Math.floor(Math.random() * 10) + 1
    });
  }
}

// 4. Generate SQL string
let sql = `-- MASSIVE SEED FILE\n\n`;

sql += `TRUNCATE TABLE public.question_company_mapping CASCADE;\n`;
sql += `TRUNCATE TABLE public.questions CASCADE;\n`;
sql += `TRUNCATE TABLE public.companies CASCADE;\n\n`;

sql += `-- Insert Companies\n`;
sql += `INSERT INTO public.companies (id, name, category, description) VALUES\n`;
sql += companies.map(c => `('${c.id}', '${c.name}', '${c.category}', '${c.description}')`).join(',\n') + `;\n\n`;

sql += `-- Insert Questions (Batching due to size)\n`;
const batchSize = 100;
for (let i = 0; i < processedQuestions.length; i += batchSize) {
  const batch = processedQuestions.slice(i, i + batchSize);
  sql += `INSERT INTO public.questions (id, title, prompt, schema_name, difficulty, estimated_time_minutes, solution_sql) VALUES\n`;
  sql += batch.map(q => `('${q.id}', '${q.title}', '${q.prompt}', '${q.schema_name}', '${q.difficulty}', ${q.estimated_time_minutes}, '${q.solution_sql}')`).join(',\n') + `;\n`;
}

sql += `\n-- Insert Mappings (Batching)\n`;
for (let i = 0; i < mappings.length; i += batchSize) {
  const batch = mappings.slice(i, i + batchSize);
  sql += `INSERT INTO public.question_company_mapping (question_id, company_id, frequency_score) VALUES\n`;
  sql += batch.map(m => `('${m.question_id}', '${m.company_id}', ${m.frequency_score})`).join(',\n') + `;\n`;
}

fs.writeFileSync(outputSqlFile, sql);
console.log(`Generated ${outputSqlFile} successfully! Ready to run in Supabase SQL editor.`);
