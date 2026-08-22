import Link from "next/link";
import { redirect } from "next/navigation";
import { getAvatarColor, getInitials } from "@/lib/format";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getMyThreads } from "@/lib/supabase/messaging";

export default async function MessagesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/messages");
  }

  const threads = await getMyThreads();

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="text-2xl font-semibold text-stone-900">Messages</h1>
      <p className="mt-1.5 text-stone-600">
        Conversations with women you&apos;ve connected with on FoundHer.
      </p>

      {threads.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
          <p className="text-stone-600">
            No conversations yet. Connect with a real signed-up member to start messaging.
          </p>
          <Link
            href="/discover"
            className="mt-4 inline-block rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
          >
            Find your circle
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {threads.map(({ profile, lastMessage }) => (
            <Link
              key={profile.id}
              href={`/messages/${profile.id}`}
              className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(
                  profile.id
                )}`}
              >
                {getInitials(profile.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-stone-900">{profile.name}</p>
                <p className="truncate text-sm text-stone-500">
                  {lastMessage ? lastMessage.body : "Say hello — no messages yet"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
