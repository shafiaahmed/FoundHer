-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  university text not null,
  program text not null,
  year text not null,
  interests text[] not null default '{}',
  help_with text[] not null default '{}',
  looking_for text[] not null default '{}',
  communities text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Connection requests a user has sent to the mock/demo profiles shown on
-- Discover. profile_id refers to a Profile.id from src/data/profiles.ts,
-- not a row in this database — those profiles aren't real accounts, so
-- this only tracks outreach the signed-in user has sent, not mutual
-- friendships.
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  profile_id text not null,
  message text not null,
  created_at timestamptz not null default now(),
  unique (user_id, profile_id)
);

alter table public.connections enable row level security;

create policy "Users can view their own connections"
  on public.connections for select
  using (auth.uid() = user_id);

create policy "Users can create their own connections"
  on public.connections for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own connections"
  on public.connections for delete
  using (auth.uid() = user_id);
