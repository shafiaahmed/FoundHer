import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export interface ConnectionRow {
  id: string;
  user_id: string;
  profile_id: string;
  message: string;
  created_at: string;
}

/** Returns the signed-in user's sent connection requests, newest first, or [] if signed out. */
export async function getMyConnections(): Promise<ConnectionRow[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("connections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
