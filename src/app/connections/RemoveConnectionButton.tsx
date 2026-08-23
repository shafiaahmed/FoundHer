"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RemoveConnectionButton({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  async function handleRemove() {
    setRemoving(true);
    setError("");
    try {
      const response = await fetch(`/api/connections/${connectionId}`, { method: "DELETE" });
      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "Unable to remove connection");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to remove connection");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={handleRemove}
        disabled={removing}
        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {removing ? "Removing..." : "Remove"}
      </button>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
