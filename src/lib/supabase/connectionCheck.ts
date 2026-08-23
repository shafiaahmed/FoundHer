import type { SupabaseClient } from "@supabase/supabase-js";

/** Looks up an existing connection between two users in either direction. */
export async function findExistingConnection(
  supabase: SupabaseClient,
  userId: string,
  profileId: string
): Promise<{ message: string } | null> {
  const { data } = await supabase
    .from("connections")
    .select("message")
    .or(
      `and(user_id.eq.${userId},profile_id.eq.${profileId}),and(user_id.eq.${profileId},profile_id.eq.${userId})`
    )
    .limit(1)
    .maybeSingle<{ message: string }>();

  return data ?? null;
}
