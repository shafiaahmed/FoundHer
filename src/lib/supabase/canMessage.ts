import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * True only while an active connection exists between these two users.
 * Historical messages must not keep messaging unlocked after either person
 * removes the connection.
 * Works with either the server or browser Supabase client — only reads rows
 * the caller's own RLS policies already allow them to see.
 */
export async function checkCanMessage(
  supabase: SupabaseClient,
  myId: string,
  otherId: string
): Promise<boolean> {
  const { data: connection } = await supabase
    .from("connections")
    .select("id")
    .or(
      `and(user_id.eq.${myId},profile_id.eq.${otherId}),and(user_id.eq.${otherId},profile_id.eq.${myId})`
    )
    .limit(1)
    .maybeSingle();

  return Boolean(connection);
}
