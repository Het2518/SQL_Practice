-- Add gamification columns to user_progress table
ALTER TABLE user_progress
ADD COLUMN activity JSONB DEFAULT '{}'::jsonb,
ADD COLUMN current_streak INTEGER DEFAULT 0,
ADD COLUMN max_streak INTEGER DEFAULT 0,
ADD COLUMN badges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN last_practice_date DATE;
