create table public.user_progress (
  user_id uuid references auth.users(id) primary key,
  activity jsonb default '{}'::jsonb,
  completed_questions jsonb default '{}'::jsonb,
  current_streak integer default 0,
  max_streak integer default 0,
  badges jsonb default '[]'::jsonb,
  last_practice_date text
);

-- Enable Row Level Security (RLS)
alter table public.user_progress enable row level security;

-- Create policy to allow users to read their own progress
create policy "Users can view their own progress"
  on public.user_progress for select
  using ( auth.uid() = user_id );

-- Create policy to allow users to insert/update their own progress
create policy "Users can update their own progress"
  on public.user_progress for all
  using ( auth.uid() = user_id );
