"use client";

import { useEffect, useRef, useState } from "react";
import { getAvatarColor, getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { MessageRow } from "@/lib/supabase/messaging";
import { Profile } from "@/lib/types";

interface MessageThreadProps {
  otherUserId: string;
  otherProfile: Profile;
  initialMessages: MessageRow[];
  currentUserId: string;
}

const POLL_INTERVAL_MS = 4000;

export function MessageThread({
  otherUserId,
  otherProfile,
  initialMessages,
  currentUserId,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function markIncomingMessagesRead() {
    const supabase = createClient();
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", currentUserId)
      .eq("sender_id", otherUserId)
      .is("read_at", null);
    if (!error) window.dispatchEvent(new Event("foundher:messages-read"));
  }

  async function fetchMessages() {
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true })
      .returns<MessageRow[]>();

    if (data) setMessages(data);

    await markIncomingMessagesRead();
  }

  // Lightweight polling so a reply shows up without a manual refresh — no realtime subscription needed for this scale.
  useEffect(() => {
    markIncomingMessagesRead();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend() {
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("messages")
      .insert({ sender_id: currentUserId, recipient_id: otherUserId, body });

    if (!error) {
      setDraft("");
      await fetchMessages();
    }
    setSending(false);
  }

  return (
    <div className="mt-6 flex h-[65vh] flex-col rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-stone-100 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(
            otherProfile.id
          )}`}
        >
          {getInitials(otherProfile.name)}
        </div>
        <div>
          <p className="font-semibold text-stone-900">{otherProfile.name}</p>
          <p className="text-xs text-stone-500">{otherProfile.university}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="mt-4 text-center text-sm text-stone-400">Say hello to start the conversation.</p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === currentUserId;
            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine ? "bg-violet-700 text-white" : "bg-stone-100 text-stone-800"
                  }`}
                >
                  {message.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t border-stone-100 p-3"
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message..."
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-full bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}
