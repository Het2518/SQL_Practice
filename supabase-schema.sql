-- Create the user_progress table to store completed questions and gamification data
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_questions JSONB DEFAULT '{}'::jsonb,
  activity_history JSONB DEFAULT '{}'::jsonb,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  category TEXT NOT NULL, -- e.g., 'MNC', 'Startup', 'FinTech'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create the topics table
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Create the questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  schema_name TEXT NOT NULL, -- e.g., 'Hospital', 'E-commerce'
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Easy', 'Medium', 'Hard', 'Expert')),
  question_type TEXT DEFAULT 'Query Writing', -- 'Query Writing', 'Debugging', 'Output Prediction', 'Optimization'
  estimated_time_minutes INTEGER DEFAULT 15,
  expected_approach TEXT,
  common_mistakes TEXT,
  solution_sql TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Mapping table for Question <-> Company (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.question_company_mapping (
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  frequency_score INTEGER DEFAULT 1, -- How often this company asks this question
  PRIMARY KEY (question_id, company_id)
);

-- Mapping table for Question <-> Topic (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.question_topic_mapping (
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, topic_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_company_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_topic_mapping ENABLE ROW LEVEL SECURITY;

-- Performance Indexes for RLS and Joins
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_qcm_question_id ON public.question_company_mapping(question_id);
CREATE INDEX IF NOT EXISTS idx_qcm_company_id ON public.question_company_mapping(company_id);
CREATE INDEX IF NOT EXISTS idx_qtm_question_id ON public.question_topic_mapping(question_id);
CREATE INDEX IF NOT EXISTS idx_qtm_topic_id ON public.question_topic_mapping(topic_id);

-- Policies for user_progress
DROP POLICY IF EXISTS "Anyone can view progress" ON public.user_progress;
CREATE POLICY "Anyone can view progress" ON public.user_progress FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert/update their own progress" ON public.user_progress;
CREATE POLICY "Users can insert/update their own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);

-- Policies for read-only public data
DROP POLICY IF EXISTS "Public read access for companies" ON public.companies;
CREATE POLICY "Public read access for companies" ON public.companies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for topics" ON public.topics;
CREATE POLICY "Public read access for topics" ON public.topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for questions" ON public.questions;
CREATE POLICY "Public read access for questions" ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for question_company" ON public.question_company_mapping;
CREATE POLICY "Public read access for question_company" ON public.question_company_mapping FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for question_topic" ON public.question_topic_mapping;
CREATE POLICY "Public read access for question_topic" ON public.question_topic_mapping FOR SELECT USING (true);
