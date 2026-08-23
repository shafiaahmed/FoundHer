import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export interface ConnectionRow {
  id: string;
  user_id: string;
  profile_id: string;
  message: string;
  created_at: string;
}

/** Returns connections where the signed-in user is either participant. */
export async function getMyConnections(): Promise<ConnectionRow[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("connections")
    .select("*")
    .or(`user_id.eq.${user.id},profile_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return data ?? [];
}
