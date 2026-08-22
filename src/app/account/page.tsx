import Link from "next/link";
import { redirect } from "next/navigation";
import { Section, TagList } from "@/components/ProfileDetailSections";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getMyProfile } from "@/lib/supabase/profile";
import { Event } from "@/lib/types";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const profile = await getMyProfile();

  if (!profile) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { data: myEventsData } = await supabase
    .from("events")
    .select("*")
    .eq("creator_id", user.id)
    .order("date", { ascending: true });

  const myEvents: Event[] = (myEventsData ?? []).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    eventType: event.event_type ?? "Workshop",
    date: event.date,
    time: event.time ?? "14:00",
    location: event.location,
    university: event.university ?? undefined,
    creatorId: event.creator_id ?? user.id,
    creatorName: event.creator_name ?? profile.name,
    maxAttendees: event.max_attendees ?? undefined,
    attendeeCount: Number(event.attendee_count ?? 0),
    attendees: Array.isArray(event.attendees) ? event.attendees : [],
    tags: Array.isArray(event.tags) ? event.tags : [],
    isExternal: Boolean(event.is_external ?? false),
    externalId: event.external_id ?? undefined,
    url: event.url ?? undefined,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">{profile.name}</h1>
            <p className="text-stone-600">{profile.university}</p>
            <p className="text-stone-600">
              {profile.program} &middot; {profile.year}
            </p>
            {profile.company && <p className="text-stone-600">{profile.company}</p>}
            <p className="mt-1 text-sm text-stone-400">{user.email}</p>
          </div>
          <Link
            href="/onboarding"
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-violet-300 hover:text-violet-800"
          >
            Edit
          </Link>
        </div>

        {profile.communities.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.communities.map((community) => (
              <span
                key={community}
                className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"
              >
                {community}
              </span>
            ))}
          </div>
        )}

        <Section title="Tech interests">
          <TagList tags={profile.interests} tone="neutral" />
        </Section>

        <Section title="Can help with">
          <TagList tags={profile.help_with} tone="amber" />
        </Section>

        <Section title="Looking for">
          <TagList tags={profile.looking_for} tone="violet" />
        </Section>

        <div className="mt-8 border-t border-stone-100 pt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-stone-900">My events</h2>
            <Link
              href="/events/create"
              className="rounded-full bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              Create event
            </Link>
          </div>

          {myEvents.length > 0 ? (
            <div className="space-y-3">
              {myEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-stone-900">{event.title}</p>
                    <p className="text-sm text-stone-600">
                      {event.eventType} •{" "}
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-violet-300 hover:text-violet-800"
                  >
                    Manage
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-stone-600">
              You haven&apos;t created any events yet.
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-stone-100 pt-6">
          <Link
            href="/discover"
            className="inline-block rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
          >
            Go to Discover
          </Link>
          <Link
            href="/connections"
            className="inline-block rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-violet-300 hover:text-violet-800"
          >
            My Connections
          </Link>
        </div>
      </div>
    </div>
  );
}
