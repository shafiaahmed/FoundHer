"use client";

import { useState } from "react";
import { generateIcebreaker } from "@/lib/icebreaker";
import { getAvatarColor, getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { MatchReason, Profile } from "@/lib/types";

interface ConnectModalProps {
  profile: Profile;
  reasons?: MatchReason[];
  open: boolean;
  onClose: () => void;
}

type SendStatus = "idle" | "sending" | "sent" | "error";

export function ConnectModal({ profile, reasons = [], open, onClose }: ConnectModalProps) {
  const [message, setMessage] = useState(() => generateIcebreaker(profile, reasons));
  const [status, setStatus] = useState<SendStatus>("idle");
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMessage(generateIcebreaker(profile, reasons));
      setStatus("idle");
    }
  }

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

    setStatus(error ? "error" : "sent");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {status === "sent" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
              ✅
            </div>
            <h3 className="text-lg font-semibold text-stone-900">Request sent!</h3>
            <p className="mt-2 text-sm text-stone-600">
              Your connection request to {profile.name.split(" ")[0]} is on its way. She&apos;ll be
              notified and can respond directly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-stone-900">Break the ice 👋</h3>
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

            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Suggested introduction
            </label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
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
