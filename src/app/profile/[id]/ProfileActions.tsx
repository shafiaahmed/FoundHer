"use client";

import { useEffect, useState } from "react";
import { ConnectModal } from "@/components/ConnectModal";
import { createClient } from "@/lib/supabase/client";
import { findExistingConnection } from "@/lib/supabase/connectionCheck";
import { useAuthGate } from "@/lib/supabase/useAuthGate";
import { Profile } from "@/lib/types";

export function ProfileActions({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
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
      <button
        type="button"
        onClick={() => requireAuth(() => setOpen(true))}
        className={`w-full rounded-full px-6 py-3.5 text-sm font-semibold transition sm:w-auto ${
          alreadySent
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "bg-violet-700 text-white hover:bg-violet-800"
        }`}
      >
        {alreadySent ? "Invite to Connect Sent" : `Connect with ${profile.name.split(" ")[0]}`}
      </button>
      <ConnectModal
        profile={profile}
        open={open}
        onClose={() => setOpen(false)}
        onSent={() => setAlreadySent(true)}
      />
    </>
  );
}
