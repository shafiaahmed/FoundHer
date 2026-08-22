"use client";

import { useState } from "react";
import { ConnectModal } from "@/components/ConnectModal";
import { useAuthGate } from "@/lib/supabase/useAuthGate";
import { Profile } from "@/lib/types";

export function ProfileActions({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const requireAuth = useAuthGate();

  return (
    <>
      <button
        type="button"
        onClick={() => requireAuth(() => setOpen(true))}
        className="w-full rounded-full bg-violet-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-800 sm:w-auto"
      >
        Connect with {profile.name.split(" ")[0]}
      </button>
      <ConnectModal profile={profile} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
