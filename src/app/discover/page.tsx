"use client";

import { useMemo, useState } from "react";
import { ProfileCard } from "@/components/ProfileCard";
import { getRecommendations } from "@/lib/matching";

const SUGGESTIONS = [
  "I have my first technical interview next week and want to practice LeetCode",
  "I'm looking for a hackathon teammate interested in AI",
  "I want advice from someone who's taken CS 341",
  "I'd like to meet other Muslim women in tech",
];

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const results = useMemo(() => getRecommendations(submittedQuery), [submittedQuery]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          What are you looking for today?
        </h1>
        <p className="mt-3 text-stone-600">
          Tell us what you need in your own words &mdash; we&apos;ll match you with women who&apos;ve
          been there.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query);
        }}
        className="mx-auto mt-8 max-w-3xl"
      >
        <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:flex-row">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="I have my first technical interview next week and want someone to practice LeetCode with..."
            rows={2}
            className="flex-1 resize-none rounded-xl px-3 py-2 text-base text-stone-800 placeholder:text-stone-400 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 sm:self-end"
          >
            Find matches
          </button>
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setQuery(suggestion);
                setSubmittedQuery(suggestion);
              }}
              className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-600 transition hover:border-violet-300 hover:text-violet-800"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      <div className="mt-12">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">
            {submittedQuery ? "Recommended for you" : "All women in your network"}
          </h2>
          <span className="text-sm text-stone-500">{results.length} profiles</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ profile, score, reasons }) => (
            <ProfileCard key={profile.id} profile={profile} score={score} reasons={reasons} />
          ))}
        </div>
      </div>
    </div>
  );
}
