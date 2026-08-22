import { createClient } from "@/lib/supabase/server";
import { Event, EventTag, EventType } from "@/lib/types";
import { events as fallbackEvents } from "@/data/events";
import { getExternalEventById } from "@/lib/externalEvents";

function normalizeDbEvent(row: Record<string, unknown>): Event {
  const attendees = Array.isArray(row.attendees)
    ? row.attendees.map((attendee) => {
        const attendeeRecord = attendee as Record<string, unknown>;
        return {
          userId: String(attendeeRecord.userId ?? attendeeRecord.user_id ?? ""),
          userName: String(attendeeRecord.userName ?? attendeeRecord.user_name ?? "Guest"),
          rsvpDate: String(attendeeRecord.rsvpDate ?? attendeeRecord.rsvp_date ?? new Date().toISOString()),
        };
      })
    : [];

  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? "Untitled event"),
    description: String(row.description ?? ""),
    eventType: (row.event_type ?? row.eventType ?? "Workshop") as EventType,
    date: String(row.date ?? new Date().toISOString().slice(0, 10)),
    time: String(row.time ?? "14:00"),
    location: String(row.location ?? "Virtual"),
    university: row.university ? String(row.university) : undefined,
    creatorId: String(row.creator_id ?? row.creatorId ?? "unknown"),
    creatorName: String(row.creator_name ?? row.creatorName ?? "Event Organizer"),
    maxAttendees: row.max_attendees == null ? undefined : Number(row.max_attendees),
    attendeeCount: Number(row.attendee_count ?? attendees.length ?? 0),
    attendees,
    tags: Array.isArray(row.tags) ? (row.tags as EventTag[]) : [],
    isExternal: Boolean(row.is_external ?? row.isExternal ?? false),
    externalId: row.external_id ? String(row.external_id) : undefined,
    url: row.url ? String(row.url) : undefined,
  };
}

export async function getAllEvents(): Promise<Event[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error || !data) {
      return fallbackEvents;
    }

    return data.map(normalizeDbEvent);
  } catch {
    return fallbackEvents;
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("events").select("*").eq("id", id).single();

    if (error || !data) {
      const fallback = fallbackEvents.find((event) => event.id === id);
      if (fallback) return fallback;

      const external = await getExternalEventById(id);
      return external ?? null;
    }

    return normalizeDbEvent(data);
  } catch {
    const fallback = fallbackEvents.find((event) => event.id === id);
    if (fallback) return fallback;

    const external = await getExternalEventById(id);
    return external ?? null;
  }
}

export async function getEventsForUser(userId: string): Promise<Event[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("creator_id", userId)
      .order("date", { ascending: true });

    if (error || !data) {
      return fallbackEvents.filter((event) => event.creatorId === userId);
    }

    return data.map(normalizeDbEvent);
  } catch {
    return fallbackEvents.filter((event) => event.creatorId === userId);
  }
}

export async function createEvent(input: {
  title: string;
  description: string;
  eventType: EventType;
  date: string;
  time: string;
  location: string;
  creatorId: string;
  creatorName: string;
  university?: string;
  maxAttendees?: number;
  tags: EventTag[];
}): Promise<Event> {
  const supabase = await createClient();

  const newEvent = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    event_type: input.eventType,
    date: input.date,
    time: input.time,
    location: input.location,
    creator_id: input.creatorId,
    creator_name: input.creatorName,
    university: input.university ?? null,
    max_attendees: input.maxAttendees ?? null,
    attendee_count: 0,
    attendees: [],
    tags: input.tags,
    is_external: false,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("events").insert(newEvent).select().single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to save event");
  }

  return normalizeDbEvent(data);
}

export async function updateEvent(
  eventId: string,
  input: Partial<{
    title: string;
    description: string;
    eventType: EventType;
    date: string;
    time: string;
    location: string;
    maxAttendees: number;
    tags: EventTag[];
  }>,
  userId: string
): Promise<Event> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update({
      title: input.title,
      description: input.description,
      event_type: input.eventType,
      date: input.date,
      time: input.time,
      location: input.location,
      max_attendees: input.maxAttendees ?? null,
      tags: input.tags ?? [],
    })
    .eq("id", eventId)
    .eq("creator_id", userId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to update event");
  }

  return normalizeDbEvent(data);
}

export async function deleteEvent(eventId: string, userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("creator_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
