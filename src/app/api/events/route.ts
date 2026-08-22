import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllEvents, createEvent } from "@/lib/eventStorage";
import { getExternalEventsWithCache } from "@/lib/externalEvents";
import { attachFoundHerAttendance } from "@/lib/eventAttendance";

/**
 * GET /api/events
 * Returns all internal events plus any available Eventbrite public events
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const location = searchParams.get("location")?.trim() ?? "";
    const internalEvents = await getAllEvents();
    let externalEvents: typeof internalEvents = [];

    try {
      externalEvents = await getExternalEventsWithCache(query, location);
    } catch {
      externalEvents = [];
    }

    const events = await attachFoundHerAttendance([...internalEvents, ...externalEvents]);
    return NextResponse.json({ events, total: events.length });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

/**
 * POST /api/events
 * Create a new event (requires authentication)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requiredFields = ["title", "date", "location", "description"]; // description is required in form
    for (const field of requiredFields) {
      if (!body?.[field] || String(body[field]).trim() === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const profileResult = await supabase
      .from("profiles")
      .select("name, university")
      .eq("id", user.id)
      .single();

    if (profileResult.error || !profileResult.data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    const event = await createEvent({
      title: String(body.title),
      description: String(body.description),
      eventType: body.eventType ?? "Workshop",
      date: String(body.date),
      time: String(body.time ?? "14:00"),
      location: String(body.location),
      creatorId: user.id,
      creatorName: String(profileResult.data.name),
      university: profileResult.data.university ?? undefined,
      maxAttendees: body.maxAttendees ? Number(body.maxAttendees) : undefined,
      tags: Array.isArray(body.tags) ? body.tags : [],
    });

    return NextResponse.json({ event, message: "Event created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
