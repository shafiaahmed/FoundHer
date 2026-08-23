drop policy if exists "Users can send messages as themselves" on public.messages;

create policy "Users can send messages as themselves"
  on public.messages for insert to authenticated
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
