import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const { id, requestId } = await params;
    const { decision } = (await request.json()) as { decision?: "accepted" | "declined" };
    if (decision !== "accepted" && decision !== "declined") {
      return NextResponse.json({ error: "Decision must be accepted or declined" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("event_join_requests")
      .update({ status: decision })
      .eq("id", requestId)
      .eq("event_id", id)
      .eq("organizer_id", user.id)
      .eq("status", "pending")
      .select("id,status")
      .single();

    if (error) throw error;
    return NextResponse.json({ request: data });
  } catch (error) {
    const databaseError = error as { code?: string; message?: string };
    console.error("Error responding to join request:", databaseError.code, databaseError.message);
    return NextResponse.json(
      { error: databaseError.message?.includes("capacity") ? "This event has reached capacity" : "Unable to respond to this request" },
      { status: 500 }
    );
  }
}
