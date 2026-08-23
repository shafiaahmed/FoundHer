-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  university text not null,
  program text not null,
  year text not null,
  company text,
  interests text[] not null default '{}',
  help_with text[] not null default '{}',
  looking_for text[] not null default '{}',
  communities text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Any signed-in user can browse everyone else's profile on Discover — this
-- is a public directory of real users, not private data.
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Connections between FoundHer members. profile_id remains text so the
-- existing mock/demo Discover profiles can still be saved as outreach.
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  profile_id text not null,
  message text not null,
  created_at timestamptz not null default now(),
  unique (user_id, profile_id)
);

alter table public.connections enable row level security;

create policy "Connection participants can view connections"
  on public.connections for select
  using (auth.uid() = user_id or auth.uid()::text = profile_id);

create policy "Users can create their own connections"
  on public.connections for insert
  with check (auth.uid() = user_id);

create policy "Connection participants can remove connections"
  on public.connections for delete
  using (auth.uid() = user_id or auth.uid()::text = profile_id);

-- Required for upsert (sending a request to someone you already reached out
-- to before) to work — that's an insert-or-update under the hood.
create policy "Users can update their own connections"
  on public.connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Stable snapshots for Eventbrite events that FoundHer members interact with.
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

create policy "Anyone can view external event snapshots"
  on public.external_events for select using (true);

create policy "Members can save external event snapshots"
  on public.external_events for insert to authenticated
  with check (auth.uid() is not null);

create policy "Members can refresh external event snapshots"
  on public.external_events for update to authenticated
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- FoundHer attendance is intentionally separate from Eventbrite ticketing.
-- A row means a member has self-reported their plans in FoundHer.
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

create policy "Members can view opted-in attendance"
  on public.event_attendance for select to authenticated
  using (auth.uid() = user_id or visibility = 'members');

create policy "Members can create their own attendance"
  on public.event_attendance for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Members can update their own attendance"
  on public.event_attendance for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Members can remove their own attendance"
  on public.event_attendance for delete to authenticated
  using (auth.uid() = user_id);

-- Direct messages between two real signed-up users. Only available once a
-- connection exists between them in either direction — there's no separate
-- "accept" step, sending or receiving a connection request is enough.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_thread_idx
  on public.messages (least(sender_id, recipient_id), greatest(sender_id, recipient_id), created_at);

alter table public.messages enable row level security;

create policy "Users can view messages they sent or received"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages as themselves"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.connections as connection
      where
        (connection.user_id = sender_id and connection.profile_id = recipient_id::text)
        or
        (connection.user_id = recipient_id and connection.profile_id = sender_id::text)
    )
  );

-- Community posts shared by signed-in FoundHer members.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  category text not null default 'general'
    check (category in ('question', 'advice', 'collaboration', 'offering_help', 'general')),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id);

alter table public.posts enable row level security;

create policy "Members can view posts"
  on public.posts for select to authenticated using (true);
create policy "Members can create their own posts"
  on public.posts for insert to authenticated with check (auth.uid() = author_id);
create policy "Members can update their own posts"
  on public.posts for update to authenticated
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "Members can delete their own posts"
  on public.posts for delete to authenticated using (auth.uid() = author_id);
