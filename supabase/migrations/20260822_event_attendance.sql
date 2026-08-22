create table if not exists public.external_events (
  event_key text primary key,
  external_id text not null unique,
  provider text not null default 'eventbrite' check (provider = 'eventbrite'),
  title text not null,
  url text not null,
  date date,
  location text,
  last_synced_at timestamptz not null default now()
);

alter table public.external_events enable row level security;
drop policy if exists "Anyone can view external event snapshots" on public.external_events;
drop policy if exists "Members can save external event snapshots" on public.external_events;
drop policy if exists "Members can refresh external event snapshots" on public.external_events;
create policy "Anyone can view external event snapshots"
  on public.external_events for select using (true);
create policy "Members can save external event snapshots"
  on public.external_events for insert to authenticated with check (auth.uid() is not null);
create policy "Members can refresh external event snapshots"
  on public.external_events for update to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

create table if not exists public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_key text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  status text not null default 'going' check (status in ('interested', 'going', 'attended', 'cancelled')),
  visibility text not null default 'members' check (visibility in ('members', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_key, user_id)
);

create index if not exists event_attendance_event_key_idx
  on public.event_attendance (event_key);
alter table public.event_attendance enable row level security;
drop policy if exists "Members can view opted-in attendance" on public.event_attendance;
drop policy if exists "Members can create their own attendance" on public.event_attendance;
drop policy if exists "Members can update their own attendance" on public.event_attendance;
drop policy if exists "Members can remove their own attendance" on public.event_attendance;
create policy "Members can view opted-in attendance"
  on public.event_attendance for select to authenticated
  using (auth.uid() = user_id or visibility = 'members');
create policy "Members can create their own attendance"
  on public.event_attendance for insert to authenticated with check (auth.uid() = user_id);
create policy "Members can update their own attendance"
  on public.event_attendance for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Members can remove their own attendance"
  on public.event_attendance for delete to authenticated using (auth.uid() = user_id);
