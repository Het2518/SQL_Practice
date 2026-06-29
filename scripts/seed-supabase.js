import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const companies = [
  { name: 'Google', category: 'MNC', description: 'Global tech giant known for rigorous algorithmic and deep SQL rounds.' },
  { name: 'Amazon', category: 'MNC', description: 'E-commerce and cloud computing. Heavy focus on Window Functions and CTEs.' },
  { name: 'Microsoft', category: 'MNC', description: 'Enterprise software and cloud. Mix of basic joins and complex aggregations.' },
  { name: 'Stripe', category: 'FinTech', description: 'Payment processing platform. Expect financial scenario-based SQL.' },
  { name: 'Airbnb', category: 'SaaS', description: 'Online marketplace for lodging. Focuses on temporal queries and reporting.' }
];

const topics = [
  { name: 'Joins', description: 'INNER, LEFT, RIGHT, FULL OUTER joins.' },
  { name: 'Window Functions', description: 'ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG.' },
  { name: 'CTEs', description: 'Common Table Expressions and Recursive CTEs.' },
  { name: 'Aggregations', description: 'GROUP BY, HAVING, COUNT, SUM, AVG.' },
  { name: 'Date Functions', description: 'DATE_TRUNC, EXTRACT, DATEDIFF.' }
];

async function seed() {
  console.log("Seeding companies...");
  const { data: insertedCompanies, error: compErr } = await supabase
    .from('companies')
    .upsert(companies, { onConflict: 'name' })
    .select();

  if (compErr) return console.error("Error inserting companies", compErr);

  console.log("Seeding topics...");
  const { data: insertedTopics, error: topErr } = await supabase
    .from('topics')
    .upsert(topics, { onConflict: 'name' })
    .select();

  if (topErr) return console.error("Error inserting topics", topErr);

  console.log("Database seeded successfully with base taxonomy!");
  console.log("Next step: We will migrate the local JS questions into the 'questions' table.");
}

seed();
