-- ─────────────────────────────────────────────────────────────────────────────
-- StudyTracker — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
-- NOTE: set search_path = public is required so Supabase can resolve
-- the profiles table inside a security definer function context.
create or replace function handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Exam Plans ───────────────────────────────────────────────────────────────
create table if not exists exam_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  certification_id text not null,          -- e.g. 'cpa', 'cfa1', etc.
  certification_name text not null,
  exam_date date not null,
  weekly_hours numeric(5,1) not null,
  total_recommended_hours numeric(6,1) not null,
  sections jsonb not null default '[]',    -- [{name, fullName, recommendedHours, order}]
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table exam_plans enable row level security;

create policy "Users can manage own exam plans"
  on exam_plans for all using (auth.uid() = user_id);

-- ─── Study Sessions ───────────────────────────────────────────────────────────
create table if not exists study_sessions (
  id uuid primary key default uuid_generate_v4(),
  plan_id uuid references exam_plans(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  section_name text not null,
  hours_spent numeric(4,1) not null,
  session_date date not null default current_date,
  note text,
  created_at timestamptz default now()
);

alter table study_sessions enable row level security;

create policy "Users can manage own study sessions"
  on study_sessions for all using (auth.uid() = user_id);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_exam_plans_user_id on exam_plans(user_id);
create index if not exists idx_study_sessions_plan_id on study_sessions(plan_id);
create index if not exists idx_study_sessions_user_id on study_sessions(user_id);
create index if not exists idx_study_sessions_date on study_sessions(session_date);
