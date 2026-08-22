import { NextResponse } from "next/server";
import { EventFilter } from "@/lib/types";
import { filterEvents } from "@/lib/eventMatching";
import { events as sampleEvents } from "@/data/events";

/**
 * POST /api/events/search
 * Search and filter events
 */
export async function POST(request: Request) {
  try {
    const filters = (await request.json()) as EventFilter;

    const results = filterEvents(sampleEvents, filters);

    return NextResponse.json({
      events: results,
      total: results.length,
    });
  } catch (error) {
    console.error("Error searching events:", error);
    return NextResponse.json({ error: "Failed to search events" }, { status: 500 });
  }
}
