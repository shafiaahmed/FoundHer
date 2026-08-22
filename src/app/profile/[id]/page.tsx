import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, TagList } from "@/components/ProfileDetailSections";
import { getAvatarColor, getInitials } from "@/lib/format";
import { getProfileByIdIncludingReal } from "@/lib/supabase/directory";
import { ProfileActions } from "./ProfileActions";

export default async function ProfilePage({ params }: PageProps<"/profile/[id]">) {
  const { id } = await params;
  const profile = await getProfileByIdIncludingReal(id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Link href="/discover" className="text-sm font-medium text-violet-700 hover:text-violet-900">
        &larr; Back to discover
      </Link>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <div
            className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-semibold ${getAvatarColor(
              profile.id
            )}`}
          >
            {getInitials(profile.name)}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">{profile.name}</h1>
            <p className="text-stone-600">{profile.university}</p>
            <p className="text-stone-600">
              {profile.program} &middot; {profile.year}
            </p>
            {profile.communities.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
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
          </div>
        </div>

        {profile.bio && <p className="mt-6 leading-relaxed text-stone-700">{profile.bio}</p>}

        {profile.experience && (
          <Section title="Experience">
            <p className="leading-relaxed text-stone-700">{profile.experience}</p>
          </Section>
        )}

        <Section title="Tech interests">
          <TagList tags={profile.interests} tone="neutral" />
        </Section>

        <Section title="Can help with">
          <TagList tags={profile.helpWith} tone="amber" />
        </Section>

        <Section title="Looking for">
          <TagList tags={profile.lookingFor} tone="violet" />
        </Section>

        <div className="mt-8 border-t border-stone-100 pt-6">
          <ProfileActions profile={profile} />
        </div>
      </div>
    </div>
  );
}
