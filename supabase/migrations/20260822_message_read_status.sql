alter table public.messages
  add column if not exists read_at timestamptz;

create index if not exists messages_unread_recipient_idx
  on public.messages (recipient_id, created_at desc)
  where read_at is null;

drop policy if exists "Recipients can mark messages read" on public.messages;
create policy "Recipients can mark messages read"
  on public.messages for update to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);
