import { NextResponse } from "next/server";
import { events as sampleEvents } from "@/data/events";

/**
 * POST /api/events/[id]/rsvp
 * RSVP a user to an event
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { userId: string; userName: string };

    const event = sampleEvents.find((e) => e.id === id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if already RSVPed
    if (event.attendees.some((a) => a.userId === body.userId)) {
      return NextResponse.json(
        { error: "You are already attending this event" },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.maxAttendees && event.attendeeCount >= event.maxAttendees) {
      return NextResponse.json(
        { error: "Event is at maximum capacity" },
        { status: 400 }
      );
    }

    // TODO: Update in database
    // For now, simulate the update

    const updatedEvent = {
      ...event,
      attendeeCount: event.attendeeCount + 1,
      attendees: [
        ...event.attendees,
        {
          userId: body.userId,
          userName: body.userName,
          rsvpDate: new Date().toISOString(),
        },
      ],
    };

    // TODO: Persist updatedEvent to database

    return NextResponse.json(
      {
        event: updatedEvent,
        message: "Successfully RSVPed to event",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error RSVPing to event:", error);
    return NextResponse.json({ error: "Failed to RSVP to event" }, { status: 500 });
  }
}

/**
 * DELETE /api/events/[id]/rsvp
 * Cancel RSVP for a user
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { userId: string };

    const event = sampleEvents.find((e) => e.id === id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const attendeeIndex = event.attendees.findIndex((a) => a.userId === body.userId);

    if (attendeeIndex === -1) {
      return NextResponse.json(
        { error: "You are not attending this event" },
        { status: 400 }
      );
    }

    // TODO: Update in database

    const updatedEvent = {
      ...event,
      attendeeCount: event.attendeeCount - 1,
      attendees: event.attendees.filter((_, i) => i !== attendeeIndex),
    };

    return NextResponse.json(
      {
        event: updatedEvent,
        message: "Successfully cancelled RSVP",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling RSVP:", error);
    return NextResponse.json({ error: "Failed to cancel RSVP" }, { status: 500 });
  }
}
