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
  if old.status = 'removed' and new.status = 'pending' then
    new.responded_at := null;
    new.created_at := now();
    insert into public.notifications (user_id, type, title, message, event_id, join_request_id)
    values (
      new.organizer_id,
      'join_request',
      'New event join request',
      new.requester_name || ' requested to join ' || new.event_title || ' again.',
      new.event_id,
      new.id
    );
    return new;
  end if;

  if old.status = 'accepted' and new.status = 'removed' then
    delete from public.event_attendance
      where event_key = new.event_id and user_id = new.requester_id;
    new.responded_at := now();
    insert into public.notifications (user_id, type, title, message, event_id, join_request_id)
    values (
      new.requester_id,
      'attendee_removed',
      'Removed from event',
      'The organizer removed you from ' || new.event_title || '.',
      new.event_id,
      new.id
    );
    return new;
  end if;

  if old.status <> 'pending' or new.status not in ('accepted', 'declined') then
    raise exception 'This request status change is not allowed';
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

create or replace function public.resubmit_removed_join_request(p_request_id uuid)
returns table (id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    update public.event_join_requests as request
      set status = 'pending'
      where request.id = p_request_id
        and request.requester_id = auth.uid()
        and request.status = 'removed'
      returning request.id, request.status;
end;
$$;

revoke all on function public.resubmit_removed_join_request(uuid) from public;
grant execute on function public.resubmit_removed_join_request(uuid) to authenticated;
