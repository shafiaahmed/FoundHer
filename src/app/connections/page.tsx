import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getMyConnections } from "@/lib/supabase/connections";
import { getProfileByIdIncludingReal } from "@/lib/supabase/directory";
import { ConnectionItem, ConnectionsList } from "./ConnectionsList";

export default async function ConnectionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/connections");
  }

  const connections = await getMyConnections();
  const resolved = await Promise.all(
    connections.map(async (connection) => {
      const profile = await getProfileByIdIncludingReal(connection.profile_id);
      return profile ? { connection, profile } : null;
    })
  );
  const items: ConnectionItem[] = resolved.filter((item): item is ConnectionItem => item !== null);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-2xl font-semibold text-stone-900">My Connections</h1>
      <p className="mt-1.5 text-stone-600">
        Everyone you&apos;ve reached out to on FoundHer, and the message you sent them.
      </p>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="text-stone-600">You haven&apos;t connected with anyone yet.</p>
          <Link
            href="/discover"
            className="mt-4 inline-block rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
          >
            Find your circle
          </Link>
        </div>
      ) : (
        <ConnectionsList items={items} />
      )}
    </div>
  );
}
