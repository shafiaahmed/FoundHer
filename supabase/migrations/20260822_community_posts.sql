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

create index if not exists posts_created_at_idx
  on public.posts (created_at desc);
create index if not exists posts_author_id_idx
  on public.posts (author_id);

alter table public.posts enable row level security;

drop policy if exists "Members can view posts" on public.posts;
drop policy if exists "Members can create their own posts" on public.posts;
drop policy if exists "Members can update their own posts" on public.posts;
drop policy if exists "Members can delete their own posts" on public.posts;

create policy "Members can view posts"
  on public.posts for select to authenticated
  using (true);

create policy "Members can create their own posts"
  on public.posts for insert to authenticated
  with check (auth.uid() = author_id);

create policy "Members can update their own posts"
  on public.posts for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Members can delete their own posts"
  on public.posts for delete to authenticated
  using (auth.uid() = author_id);
