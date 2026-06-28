-- Create the user_progress table to store completed questions and gamification data
CREATE TABLE public.user_progress (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_questions JSONB DEFAULT '{}'::jsonb,
  activity_history JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own progress
CREATE POLICY "Users can view their own progress" 
  ON public.user_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to update their own progress
CREATE POLICY "Users can insert/update their own progress" 
  ON public.user_progress 
  FOR ALL 
  USING (auth.uid() = user_id);
