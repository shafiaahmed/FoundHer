import Link from "next/link";
import { redirect } from "next/navigation";
import { getAvatarColor, getInitials } from "@/lib/format";
import { getProfileById } from "@/lib/matching";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getMyConnections } from "@/lib/supabase/connections";
import { RemoveConnectionButton } from "./RemoveConnectionButton";

export default async function ConnectionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/connections");
  }

  const connections = await getMyConnections();

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-2xl font-semibold text-stone-900">My Connections</h1>
      <p className="mt-1.5 text-stone-600">
        Everyone you&apos;ve reached out to on FoundHer, and the message you sent them.
      </p>

      {connections.length === 0 ? (
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
        <div className="mt-8 space-y-4">
          {connections.map((connection) => {
            const profile = getProfileById(connection.profile_id);
            if (!profile) return null;

            return (
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
            );
          })}
        </div>
      )}
    </div>
  );
}
