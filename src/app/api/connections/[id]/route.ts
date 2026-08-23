import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ConnectionParticipants {
  user_id: string;
  profile_id: string;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: connection, error: lookupError } = await supabase
    .from("connections")
    .select("user_id,profile_id")
    .eq("id", id)
    .maybeSingle<ConnectionParticipants>();

  if (lookupError || !connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  if (connection.user_id !== user.id && connection.profile_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("connections")
    .delete()
    .or(
      `and(user_id.eq.${connection.user_id},profile_id.eq.${connection.profile_id}),and(user_id.eq.${connection.profile_id},profile_id.eq.${connection.user_id})`
    );

  if (error) {
    return NextResponse.json({ error: "Unable to remove this connection" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
