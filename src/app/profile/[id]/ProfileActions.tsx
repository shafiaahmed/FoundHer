"use client";

import { useState } from "react";
import { ConnectModal } from "@/components/ConnectModal";
import { Profile } from "@/lib/types";

export function ProfileActions({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-full bg-violet-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-800 sm:w-auto"
      >
        Connect with {profile.name.split(" ")[0]}
      </button>
      <ConnectModal profile={profile} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
