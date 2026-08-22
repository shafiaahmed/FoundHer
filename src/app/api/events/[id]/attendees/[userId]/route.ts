import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("event_join_requests")
      .update({ status: "removed" })
      .eq("event_id", id)
      .eq("requester_id", userId)
      .eq("organizer_id", user.id)
      .eq("status", "accepted")
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Accepted attendee not found" }, { status: 404 });
    }
    return NextResponse.json({ removed: true });
  } catch (error) {
    const databaseError = error as { code?: string; message?: string };
    console.error("Error removing attendee:", databaseError.code, databaseError.message);
    return NextResponse.json({ error: "Unable to remove this attendee" }, { status: 500 });
  }
}
