import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * True if messaging should be unlocked between these two users: either one
 * has sent the other a connection request, or a message thread already
 * exists between them (so a reply is always possible once contact is made).
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
    .eq("user_id", myId)
    .eq("profile_id", otherId)
    .maybeSingle();

  if (connection) return true;

  const { data: message } = await supabase
    .from("messages")
    .select("id")
    .or(
      `and(sender_id.eq.${myId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${myId})`
    )
    .limit(1)
    .maybeSingle();

  return Boolean(message);
}
