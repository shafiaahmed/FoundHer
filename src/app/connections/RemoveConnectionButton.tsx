"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RemoveConnectionButton({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    const supabase = createClient();
    await supabase.from("connections").delete().eq("id", connectionId);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={removing}
      className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {removing ? "Removing..." : "Remove"}
    </button>
  );
}
