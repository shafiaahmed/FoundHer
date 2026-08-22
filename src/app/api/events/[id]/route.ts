import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteEvent, getEventById, updateEvent } from "@/lib/eventStorage";
import { attachFoundHerAttendance } from "@/lib/eventAttendance";

/**
 * GET /api/events/[id]
 * Get a single event by ID
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await getEventById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const [eventWithAttendance] = await attachFoundHerAttendance([event]);
    return NextResponse.json({ event: eventWithAttendance });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

/**
 * PATCH /api/events/[id]
 * Update an event (creator only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const updatedEvent = await updateEvent(
      id,
      {
        title: body.title,
        description: body.description,
        eventType: body.eventType,
        date: body.date,
        time: body.time,
        location: body.location,
        maxAttendees: body.maxAttendees ? Number(body.maxAttendees) : undefined,
        tags: Array.isArray(body.tags) ? body.tags : [],
      },
      user.id
    );

    return NextResponse.json({ event: updatedEvent, message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

/**
 * DELETE /api/events/[id]
 * Delete an event (creator only)
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteEvent(id, user.id);

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
