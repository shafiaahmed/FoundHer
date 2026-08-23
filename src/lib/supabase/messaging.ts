import { isRealProfileId } from "@/lib/realProfile";
import { Profile } from "@/lib/types";
import { getCurrentUser } from "@/lib/supabase/auth";
import { checkCanMessage } from "@/lib/supabase/canMessage";
import { getMyConnections } from "@/lib/supabase/connections";
import { getProfileByIdIncludingReal } from "@/lib/supabase/directory";
import { createClient } from "@/lib/supabase/server";

export interface MessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at?: string | null;
}

export async function canMessage(otherUserId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || !isRealProfileId(otherUserId) || otherUserId === user.id) return false;

  const supabase = await createClient();
  return checkCanMessage(supabase, user.id, otherUserId);
}

export async function getThreadMessages(otherUserId: string): Promise<MessageRow[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true })
    .returns<MessageRow[]>();

  return data ?? [];
}

export interface ThreadSummary {
  profile: Profile;
  lastMessage: MessageRow | null;
}

/** Everyone the signed-in user can message: people they've connected with, plus anyone they already have a thread with. */
export async function getMyThreads(): Promise<ThreadSummary[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await createClient();

  const [connections, sentResult, receivedResult] = await Promise.all([
    getMyConnections(),
    supabase.from("messages").select("*").eq("sender_id", user.id).returns<MessageRow[]>(),
    supabase.from("messages").select("*").eq("recipient_id", user.id).returns<MessageRow[]>(),
  ]);

  const allMessages = [...(sentResult.data ?? []), ...(receivedResult.data ?? [])];

  const otherIds = new Set<string>();
  connections.forEach((connection) => {
    const otherId = connection.user_id === user.id
      ? connection.profile_id
      : connection.user_id;
    if (isRealProfileId(otherId)) otherIds.add(otherId);
  });
  allMessages.forEach((m) => otherIds.add(m.sender_id === user.id ? m.recipient_id : m.sender_id));

  const threads = await Promise.all(
    Array.from(otherIds).map(async (otherId): Promise<ThreadSummary | null> => {
      const profile = await getProfileByIdIncludingReal(otherId);
      if (!profile) return null;

      const threadMessages = allMessages
        .filter((m) => m.sender_id === otherId || m.recipient_id === otherId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));

      return { profile, lastMessage: threadMessages[0] ?? null };
    })
  );

  return threads
    .filter((thread): thread is ThreadSummary => thread !== null)
    .sort((a, b) => {
      const aTime = a.lastMessage?.created_at ?? "";
      const bTime = b.lastMessage?.created_at ?? "";
      return bTime.localeCompare(aTime);
    });
}
