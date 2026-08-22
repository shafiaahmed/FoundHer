"use client";

import { useEffect, useId, useState } from "react";
import { generateIcebreaker } from "@/lib/icebreaker";
import { getAvatarColor, getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { findExistingConnection } from "@/lib/supabase/connectionCheck";
import { MatchReason, Profile } from "@/lib/types";

interface ConnectModalProps {
  profile: Profile;
  reasons?: MatchReason[];
  open: boolean;
  onClose: () => void;
  /** Called once a request is confirmed sent (new or already existing), so a parent card can update its button. */
  onSent?: () => void;
}

type SendStatus = "checking" | "idle" | "sending" | "sent" | "already-sent" | "error";

export function ConnectModal({ profile, reasons = [], open, onClose, onSent }: ConnectModalProps) {
  const [message, setMessage] = useState(() => generateIcebreaker(profile, reasons));
  const [status, setStatus] = useState<SendStatus>("checking");
  const [prevOpen, setPrevOpen] = useState(open);
  const titleId = useId();

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMessage(generateIcebreaker(profile, reasons));
      setStatus("checking");
    }
  }

  // Check for an existing connection so we never show the compose form for
  // someone you've already reached out to.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) setStatus("idle");
        return;
      }

      const existing = await findExistingConnection(supabase, user.id, profile.id);

      if (cancelled) return;

      if (existing) {
        setMessage(existing.message);
        setStatus("already-sent");
        onSent?.();
      } else {
        setStatus("idle");
      }
    })();

    return () => {
      cancelled = true;
    };
    // onSent is intentionally excluded — tied only to the modal opening for this profile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, profile.id]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSend() {
    setStatus("sending");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("error");
      return;
    }

    const { error } = await supabase
      .from("connections")
      .upsert({ user_id: user.id, profile_id: profile.id, message }, { onConflict: "user_id,profile_id" });

    if (error) {
      setStatus("error");
    } else {
      setStatus("sent");
      onSent?.();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-fade-in-up w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {status === "checking" ? (
          <div className="py-10 text-center text-sm text-stone-400">Loading&hellip;</div>
        ) : status === "sent" || status === "already-sent" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
              ✅
            </div>
            <h3 id={titleId} className="text-lg font-semibold text-stone-900">
              {status === "sent" ? "Request to Connect Sent" : "Invite Already Sent"}
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              {status === "sent"
                ? `Your message to ${profile.name.split(" ")[0]} has been saved to your connections. You can view or remove it anytime from My Connections.`
                : `You've already sent a connection request to ${profile.name.split(" ")[0]}. You can view or remove it from My Connections.`}
            </p>
            <button
              type="button"
              onClick={onClose}
              autoFocus
              className="mt-6 rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h3 id={titleId} className="text-lg font-semibold text-stone-900">
                Break the ice 👋
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-stone-400 transition hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(
                  profile.id
                )}`}
              >
                {getInitials(profile.name)}
              </div>
              <div>
                <p className="font-semibold text-stone-900">{profile.name}</p>
                <p className="text-xs text-stone-500">
                  {profile.program} &middot; {profile.year}
                </p>
              </div>
            </div>

            <label htmlFor={`${titleId}-message`} className="mt-5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Suggested introduction
            </label>
            <textarea
              id={`${titleId}-message`}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              autoFocus
              className="mt-2 w-full resize-none rounded-xl border border-stone-300 p-3 text-sm text-stone-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={status === "sending"}
              className="mt-5 w-full rounded-full bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? "Sending..." : "Send Connection Request"}
            </button>
            {status === "error" && (
              <p className="mt-3 text-sm text-rose-600">
                Something went wrong sending your request. Please try again.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
