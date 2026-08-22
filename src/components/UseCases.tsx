import Link from "next/link";
import type { ProfileRow } from "@/lib/supabase/profile";

interface UseCase {
  emoji: string;
  title: string;
  description: string;
  defaultQuery: string;
  personalize?: (profile: ProfileRow) => string | null;
}

const USE_CASES: UseCase[] = [
  {
    emoji: "🌱",
    title: "Find a mentor",
    description: "Connect with women who've walked the path you're on now.",
    defaultQuery: "I'm looking for a mentor to guide me",
    personalize: (profile) =>
      profile.interests[0] ? `I'm looking for a mentor in ${profile.interests[0]}` : null,
  },
  {
    emoji: "💻",
    title: "Practice interviews",
    description: "Pair up for mock interviews and technical prep that actually helps.",
    defaultQuery: "I want to practice for technical interviews",
  },
  {
    emoji: "📚",
    title: "Find a study buddy",
    description: "Grind through coursework and LeetCode with someone who gets it.",
    defaultQuery: "I'm looking for a study buddy",
    personalize: (profile) =>
      profile.interests[0]
        ? `I'm looking for a study buddy who's into ${profile.interests[0]}`
        : null,
  },
  {
    emoji: "🚀",
    title: "Build a hackathon team",
    description: "Meet teammates who share your interests and your ambition.",
    defaultQuery: "I'm looking for a hackathon teammate",
    personalize: (profile) =>
      profile.interests[0]
        ? `I'm looking for a hackathon teammate interested in ${profile.interests[0]}`
        : null,
  },
  {
    emoji: "🤝",
    title: "Meet women like you",
    description: "Find community around shared backgrounds, identities, and interests.",
    defaultQuery: "I want to meet other women in tech with similar interests",
    personalize: (profile) =>
      profile.communities[0]
        ? `I want to meet other ${profile.communities[0]}`
        : profile.interests[0]
          ? `I want to meet other women in tech interested in ${profile.interests[0]}`
          : null,
  },
];

export function UseCases({ profile }: { profile: ProfileRow | null }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Whatever you&apos;re facing
        </h2>
        <p className="mt-3 text-stone-600">there&apos;s a woman who&apos;s been there.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {USE_CASES.map((useCase) => {
          const query = (profile && useCase.personalize?.(profile)) || useCase.defaultQuery;

          return (
            <Link
              key={useCase.title}
              href={`/discover?q=${encodeURIComponent(query)}`}
              className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl transition group-hover:bg-violet-100">
                {useCase.emoji}
              </div>
              <h3 className="font-semibold text-stone-900">{useCase.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{useCase.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
