import Link from "next/link";
import type { ProfileRow } from "@/lib/supabase/profile";

interface UseCase {
  title: string;
  description: string;
  defaultQuery: string;
  personalize?: (profile: ProfileRow) => string | null;
}

const USE_CASES: UseCase[] = [
  {
    title: "Find a mentor",
    description: "Connect with women who've walked the path you're on now.",
    defaultQuery: "I'm looking for a mentor to guide me",
    personalize: (profile) =>
      profile.interests[0] ? `I'm looking for a mentor in ${profile.interests[0]}` : null,
  },
  {
    title: "Practice interviews",
    description: "Pair up for mock interviews and technical prep that actually helps.",
    defaultQuery: "I want to practice for technical interviews",
  },
  {
    title: "Find a study buddy",
    description: "Grind through coursework and LeetCode with someone who gets it.",
    defaultQuery: "I'm looking for a study buddy",
    personalize: (profile) =>
      profile.interests[0]
        ? `I'm looking for a study buddy who's into ${profile.interests[0]}`
        : null,
  },
  {
    title: "Build a hackathon team",
    description: "Meet teammates who share your interests and your ambition.",
    defaultQuery: "I'm looking for a hackathon teammate",
    personalize: (profile) =>
      profile.interests[0]
        ? `I'm looking for a hackathon teammate interested in ${profile.interests[0]}`
        : null,
  },
  {
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

const CARD_STYLES = [
  "bg-violet-50/55",
  "bg-purple-50/50",
  "bg-indigo-50/45",
  "bg-slate-100/55",
  "bg-violet-50/45",
];

export function UseCases({ profile }: { profile: ProfileRow | null }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Find The Right People For Your Next Step
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {USE_CASES.map((useCase, index) => {
          const query = (profile && useCase.personalize?.(profile)) || useCase.defaultQuery;

          return (
            <Link
              key={useCase.title}
              href={`/discover?q=${encodeURIComponent(query)}`}
              className={`group flex min-h-[190px] flex-col rounded-2xl border border-stone-200 p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-md ${CARD_STYLES[index]}`}
            >
              <div className="mb-4" aria-hidden="true">
                <span className="block h-1 w-1/2 rounded-full bg-violet-900/40" />
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
