import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/matching";
import { getAvatarColor, getInitials } from "@/lib/format";
import { ProfileActions } from "./ProfileActions";

export default async function ProfilePage({ params }: PageProps<"/profile/[id]">) {
  const { id } = await params;
  const profile = getProfileById(id);

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

        <p className="mt-6 leading-relaxed text-stone-700">{profile.bio}</p>

        <Section title="Experience">
          <p className="leading-relaxed text-stone-700">{profile.experience}</p>
        </Section>

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</h2>
      {children}
    </div>
  );
}

const TONE_CLASSES = {
  neutral: "bg-stone-100 text-stone-600",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
};

function TagList({ tags, tone }: { tags: string[]; tone: keyof typeof TONE_CLASSES }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className={`rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}>
          {tag}
        </span>
      ))}
    </div>
  );
}
