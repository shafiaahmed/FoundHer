create table if not exists public.event_join_requests (
  id uuid primary key default gen_random_uuid(),
  event_id text not null,
  requester_id uuid not null references auth.users (id) on delete cascade,
  organizer_id uuid not null references auth.users (id) on delete cascade,
  requester_name text not null,
  event_title text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (event_id, requester_id)
);

create index if not exists event_join_requests_organizer_idx
  on public.event_join_requests (organizer_id, status, created_at desc);
create index if not exists event_join_requests_requester_idx
  on public.event_join_requests (requester_id, created_at desc);

alter table public.event_join_requests enable row level security;
drop policy if exists "Participants can view event join requests" on public.event_join_requests;
drop policy if exists "Members can request internal events" on public.event_join_requests;
drop policy if exists "Organizers can respond to requests" on public.event_join_requests;
drop policy if exists "Requesters can cancel pending requests" on public.event_join_requests;
create policy "Participants can view event join requests"
  on public.event_join_requests for select to authenticated
  using (auth.uid() = requester_id or auth.uid() = organizer_id);
create policy "Members can request internal events"
  on public.event_join_requests for insert to authenticated
  with check (
    auth.uid() = requester_id
    and requester_id <> organizer_id
    and exists (
      select 1 from public.events
      where id::text = event_id and creator_id = organizer_id
    )
  );
create policy "Organizers can respond to requests"
  on public.event_join_requests for update to authenticated
  using (auth.uid() = organizer_id)
  with check (auth.uid() = organizer_id);
create policy "Requesters can cancel pending requests"
  on public.event_join_requests for delete to authenticated
  using (auth.uid() = requester_id and status = 'pending');

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('join_request', 'join_accepted', 'join_declined')),
  title text not null,
  message text not null,
  event_id text,
  join_request_id uuid references public.event_join_requests (id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, read_at, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists "Members can view their notifications" on public.notifications;
drop policy if exists "Members can mark their notifications read" on public.notifications;
create policy "Members can view their notifications"
  on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy "Members can mark their notifications read"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.notify_new_join_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, message, event_id, join_request_id)
  values (
    new.organizer_id,
    'join_request',
    'New event join request',
    new.requester_name || ' requested to join ' || new.event_title || '.',
    new.event_id,
    new.id
  );
  return new;
end;
$$;

create or replace function public.handle_join_request_response()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  capacity_limit integer;
  accepted_count integer;
begin
  if old.status <> 'pending' or new.status not in ('accepted', 'declined') then
    raise exception 'Only pending requests can be accepted or declined';
  end if;

  if new.status = 'accepted' then
    select max_attendees into capacity_limit from public.events where id::text = new.event_id;
    select count(*) into accepted_count
      from public.event_attendance
      where event_key = new.event_id and status in ('going', 'attended');
    if capacity_limit is not null and accepted_count >= capacity_limit then
      raise exception 'This event has reached capacity';
    end if;

    insert into public.event_attendance
      (event_key, user_id, display_name, status, visibility, updated_at)
    values
      (new.event_id, new.requester_id, new.requester_name, 'going', 'members', now())
    on conflict (event_key, user_id) do update
      set status = 'going', visibility = 'members', updated_at = now();
  end if;

  new.responded_at := now();
  insert into public.notifications (user_id, type, title, message, event_id, join_request_id)
  values (
    new.requester_id,
    case when new.status = 'accepted' then 'join_accepted' else 'join_declined' end,
    case when new.status = 'accepted' then 'Event request accepted' else 'Event request declined' end,
    case
      when new.status = 'accepted' then 'Your request to join ' || new.event_title || ' was accepted.'
      else 'Your request to join ' || new.event_title || ' was declined.'
    end,
    new.event_id,
    new.id
  );
  return new;
end;
$$;

drop trigger if exists notify_new_join_request_trigger on public.event_join_requests;
create trigger notify_new_join_request_trigger
after insert on public.event_join_requests
for each row execute function public.notify_new_join_request();

drop trigger if exists handle_join_request_response_trigger on public.event_join_requests;
create trigger handle_join_request_response_trigger
before update of status on public.event_join_requests
for each row when (old.status is distinct from new.status)
execute function public.handle_join_request_response();
