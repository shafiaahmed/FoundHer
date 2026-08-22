import type { SupabaseClient } from "@supabase/supabase-js";

/** Looks up an existing connection request from a user to a profile, if any. */
export async function findExistingConnection(
  supabase: SupabaseClient,
  userId: string,
  profileId: string
): Promise<{ message: string } | null> {
  const { data } = await supabase
    .from("connections")
    .select("message")
    .eq("user_id", userId)
    .eq("profile_id", profileId)
    .maybeSingle<{ message: string }>();

  return data ?? null;
}
