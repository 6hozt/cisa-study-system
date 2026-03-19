-- ─────────────────────────────────────────────────────────────────────────────
-- StudyTracker — RLS Patch
-- Run this in Supabase SQL Editor if you already ran supabase-schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Fix the trigger function: add set search_path = public so Supabase
-- can resolve the profiles table inside the security definer context,
-- and pull full_name from signup metadata.
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

-- Recreate trigger (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
