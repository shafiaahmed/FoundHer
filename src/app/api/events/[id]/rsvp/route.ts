import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type AttendanceRequest = {
  visibility?: "members" | "private";
  event?: {
    externalId?: string;
    title?: string;
    url?: string;
    date?: string;
    location?: string;
    isExternal?: boolean;
  };
};

function attendanceErrorResponse(error: unknown) {
  const databaseError = error as { code?: string; message?: string };
  const tablesMissing = databaseError.code === "PGRST205" || databaseError.message?.includes("schema cache");
  console.error("Error saving FoundHer attendance:", databaseError.code, databaseError.message);
  return NextResponse.json(
    {
      error: tablesMissing
        ? "Attendance storage has not been set up in Supabase yet. Run the event attendance migration."
        : "Unable to update your attendance right now.",
    },
    { status: tablesMissing ? 503 : 500 }
  );
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as AttendanceRequest;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 400 });

    if (body.event?.isExternal) {
      if (!body.event.externalId || !body.event.title || !body.event.url) {
        return NextResponse.json({ error: "Invalid external event" }, { status: 400 });
      }

      const { error: snapshotError } = await supabase.from("external_events").upsert(
        {
          event_key: id,
          external_id: body.event.externalId,
          provider: "eventbrite",
          title: body.event.title,
          url: body.event.url,
          date: body.event.date || null,
          location: body.event.location || null,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "event_key" }
      );
      if (snapshotError) throw snapshotError;
    }

    const { error } = await supabase.from("event_attendance").upsert(
      {
        event_key: id,
        user_id: user.id,
        display_name: profile.name,
        status: "going",
        visibility: body.visibility === "private" ? "private" : "members",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_key,user_id" }
    );

    if (error) throw error;
    return NextResponse.json({ going: true, userId: user.id, userName: profile.name });
  } catch (error) {
    return attendanceErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("event_attendance")
      .delete()
      .eq("event_key", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ going: false });
  } catch (error) {
    return attendanceErrorResponse(error);
  }
}
