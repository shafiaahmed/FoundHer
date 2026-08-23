create index if not exists connections_profile_id_idx
  on public.connections (profile_id);

alter table public.connections enable row level security;

drop policy if exists "Users can view their own connections" on public.connections;
drop policy if exists "Connection participants can view connections" on public.connections;
create policy "Connection participants can view connections"
  on public.connections for select to authenticated
  using (auth.uid() = user_id or auth.uid()::text = profile_id);

drop policy if exists "Users can remove their own connections" on public.connections;
drop policy if exists "Connection participants can remove connections" on public.connections;
create policy "Connection participants can remove connections"
  on public.connections for delete to authenticated
  using (auth.uid() = user_id or auth.uid()::text = profile_id);
