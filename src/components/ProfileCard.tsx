"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MatchBadge } from "@/components/MatchBadge";
import { ConnectModal } from "@/components/ConnectModal";
import { getAvatarColor, getInitials } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { findExistingConnection } from "@/lib/supabase/connectionCheck";
import { useAuthGate } from "@/lib/supabase/useAuthGate";
import { MatchReason, Profile } from "@/lib/types";

interface ProfileCardProps {
  profile: Profile;
  score?: number;
  reasons?: MatchReason[];
}

export function ProfileCard({ profile, score, reasons = [] }: ProfileCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const requireAuth = useAuthGate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const existing = await findExistingConnection(supabase, user.id, profile.id);
      if (!cancelled && existing) setAlreadySent(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [profile.id]);

  return (
    <>
      <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/profile/${profile.id}`} className="flex items-start gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(
                profile.id
              )}`}
            >
              {getInitials(profile.name)}
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 hover:text-violet-700">{profile.name}</h3>
              <p className="text-sm text-stone-500">{profile.university}</p>
              <p className="text-sm text-stone-500">
                {profile.program} &middot; {profile.year}
              </p>
            </div>
          </Link>
          {score !== undefined && <MatchBadge score={score} />}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-stone-600">{profile.bio}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {profile.interests.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {profile.helpWith.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {reasons.length > 0 && (
          <div className="mt-4 rounded-xl bg-violet-50/70 p-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-violet-600">
              Why you match
            </p>
            <ul className="space-y-1">
              {reasons.slice(0, 3).map((reason, index) => (
                <li
                  key={`${reason.tag}-${index}`}
                  className="flex items-start gap-1.5 text-sm text-violet-900"
                >
                  <span className="mt-0.5 text-violet-400">&bull;</span>
                  {reason.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 pt-5">
          <Link
            href={`/profile/${profile.id}`}
            className="flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-center text-sm font-semibold text-stone-700 transition hover:border-violet-300 hover:text-violet-800"
          >
            View profile
          </Link>
          <button
            type="button"
            onClick={() => requireAuth(() => setModalOpen(true))}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              alreadySent
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-violet-700 text-white hover:bg-violet-800"
            }`}
          >
            {alreadySent ? "Invite to Connect Sent" : "Connect"}
          </button>
        </div>
      </div>

      <ConnectModal
        profile={profile}
        reasons={reasons}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSent={() => setAlreadySent(true)}
      />
    </>
  );
}
