"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConnectModal } from "@/components/ConnectModal";
import { getAvatarColor, getInitials } from "@/lib/format";
import { isRealProfileId } from "@/lib/realProfile";
import { checkCanMessage } from "@/lib/supabase/canMessage";
import { createClient } from "@/lib/supabase/client";
import { findExistingConnection } from "@/lib/supabase/connectionCheck";
import { useAuthGate } from "@/lib/supabase/useAuthGate";
import { MatchReason, Profile } from "@/lib/types";

interface ProfileCardProps {
  profile: Profile;
  reasons?: MatchReason[];
}

export function ProfileCard({ profile, reasons = [] }: ProfileCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const [messagingUnlocked, setMessagingUnlocked] = useState(false);
  const requireAuth = useAuthGate();
  const isReal = isRealProfileId(profile.id);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const existing = await findExistingConnection(supabase, user.id, profile.id);
      if (cancelled) return;
      if (existing) setAlreadySent(true);

      if (isReal) {
        const unlocked = await checkCanMessage(supabase, user.id, profile.id);
        if (!cancelled && unlocked) setMessagingUnlocked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profile.id, isReal]);

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
              {profile.company && <p className="text-sm text-stone-500">{profile.company}</p>}
            </div>
          </Link>
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

        <div className="mt-auto flex items-center gap-2 pt-5">
          <Link
            href={`/profile/${profile.id}`}
            className="flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-center text-sm font-semibold text-stone-700 transition hover:border-violet-300 hover:text-violet-800"
          >
            View profile
          </Link>
          {messagingUnlocked ? (
            <Link
              href={`/messages/${profile.id}`}
              className="flex-1 rounded-full bg-violet-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              Message
            </Link>
          ) : (
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
          )}
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
