"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getAvatarColor, getInitials } from "@/lib/format";
import { ConnectionRow } from "@/lib/supabase/connections";
import { Profile } from "@/lib/types";
import { RemoveConnectionButton } from "./RemoveConnectionButton";

export interface ConnectionItem {
  connection: ConnectionRow;
  profile: Profile;
}

type SortOrder = "newest" | "oldest" | "name";

const SORTERS: Record<SortOrder, (a: ConnectionItem, b: ConnectionItem) => number> = {
  newest: (a, b) => b.connection.created_at.localeCompare(a.connection.created_at),
  oldest: (a, b) => a.connection.created_at.localeCompare(b.connection.created_at),
  name: (a, b) => a.profile.name.localeCompare(b.profile.name),
};

export function ConnectionsList({ items }: { items: ConnectionItem[] }) {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? items.filter(({ profile }) => {
          const haystack = `${profile.name} ${profile.university} ${profile.program}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : items;

    return [...filtered].sort(SORTERS[sortOrder]);
  }, [items, query, sortOrder]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, university, or program..."
          className="input sm:flex-1"
        />
        <select
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value as SortOrder)}
          className="rounded-full border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-700 focus:border-violet-400 focus:outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name (A&ndash;Z)</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 text-sm text-stone-500">No connections match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map(({ connection, profile }) => (
            <div
              key={connection.id}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <Link href={`/profile/${profile.id}`} className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(
                      profile.id
                    )}`}
                  >
                    {getInitials(profile.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 hover:text-violet-700">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-stone-500">
                      {profile.university} &middot; {profile.program}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-400">
                      Sent{" "}
                      {new Date(connection.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
                <RemoveConnectionButton connectionId={connection.id} />
              </div>

              <p className="mt-4 rounded-xl bg-violet-50/70 p-3 text-sm text-violet-900">
                {connection.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
