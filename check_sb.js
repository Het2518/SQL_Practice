import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wxtrinsikqdgaigvcxxr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dHJpbnNpa3FkZ2FpZ3ZjeHhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MzYxNDUsImV4cCI6MjA5ODIxMjE0NX0.JzJ1sI9GcYF2xSh6DBfsqnNxHndRd_dG6kDOpIA7bNA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('question_company_mapping').select('*').limit(5);
  console.log('Mapping Data:', data, error);
}

check();
