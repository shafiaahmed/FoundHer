import Link from "next/link";
import { redirect } from "next/navigation";
import { Section, TagList } from "@/components/ProfileDetailSections";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getMyProfile } from "@/lib/supabase/profile";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const profile = await getMyProfile();

  if (!profile) {
    redirect("/onboarding");
  }

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
