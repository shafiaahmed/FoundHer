import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [{ data: event }, { data: profile }] = await Promise.all([
      supabase.from("events").select("id,title,creator_id").eq("id", id).single(),
      supabase.from("profiles").select("name").eq("id", user.id).single(),
    ]);

    if (!event) return NextResponse.json({ error: "Internal event not found" }, { status: 404 });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    if (event.creator_id === user.id) {
      return NextResponse.json({ error: "You already organize this event" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("event_join_requests")
      .insert({
        event_id: String(event.id),
        requester_id: user.id,
        organizer_id: event.creator_id,
        requester_name: profile.name,
        event_title: event.title,
        status: "pending",
      })
      .select("id,status")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "You already requested to join this event" }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ request: data }, { status: 201 });
  } catch (error) {
    const databaseError = error as { code?: string; message?: string };
    console.error("Error creating join request:", databaseError.code, databaseError.message);
    return NextResponse.json({ error: "Unable to send your request right now" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { requestId } = (await request.json()) as { requestId?: string };
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!requestId) return NextResponse.json({ error: "Request ID is required" }, { status: 400 });

    const { error } = await supabase
      .from("event_join_requests")
      .delete()
      .eq("id", requestId)
      .eq("event_id", id)
      .eq("requester_id", user.id)
      .eq("status", "pending");
    if (error) throw error;
    return NextResponse.json({ cancelled: true });
  } catch (error) {
    const databaseError = error as { code?: string; message?: string };
    console.error("Error cancelling join request:", databaseError.code, databaseError.message);
    return NextResponse.json({ error: "Unable to cancel your request right now" }, { status: 500 });
  }
}
