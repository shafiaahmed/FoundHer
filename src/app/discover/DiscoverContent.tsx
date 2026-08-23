"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfileCarousel } from "@/components/ProfileCarousel";
import { PROFILES } from "@/data/profiles";
import { HELP_CATEGORIES, INTERESTS, UNIVERSITIES } from "@/data/options";
import { getRecommendations } from "@/lib/matching";
import { MatchResult } from "@/lib/types";

const SUGGESTIONS = [
  "I have my first technical interview next week and want to practice LeetCode",
  "I'm looking for a hackathon teammate interested in AI",
  "I want advice from someone who's taken CS 341",
  "I'd like to meet other Muslim women in tech",
];

const SUGGESTED_COUNT = 3;

type MatchSource = "keyword" | "ai";

export function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [results, setResults] = useState<MatchResult[]>(() => getRecommendations(initialQuery));
  const [source, setSource] = useState<MatchSource>("keyword");
  const [aiLoading, setAiLoading] = useState(Boolean(initialQuery));
  const [aiUnavailable, setAiUnavailable] = useState(false);

  const [universityFilter, setUniversityFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [helpFilter, setHelpFilter] = useState("");

  async function runSearch(searchQuery: string) {
    setSubmittedQuery(searchQuery);
    setAiUnavailable(false);

    // Instant local results so the UI never feels stuck waiting on the network.
    setResults(getRecommendations(searchQuery));
    setSource("keyword");

    if (!searchQuery.trim()) return;

    setAiLoading(true);
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) throw new Error("AI matching request failed");

      const data = (await response.json()) as { results: MatchResult[] };
      setResults(data.results);
      setSource("ai");
    } catch {
      setAiUnavailable(true);
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    if (!initialQuery) return;

    let cancelled = false;

    fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: initialQuery }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("AI matching request failed");
        const data = (await response.json()) as { results: MatchResult[] };
        if (cancelled) return;
        setResults(data.results);
        setSource("ai");
      })
      .catch(() => {
        if (!cancelled) setAiUnavailable(true);
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Only run for the query present on first load — not on every param change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const suggested = submittedQuery ? results.slice(0, SUGGESTED_COUNT) : [];

  const browsable = useMemo(() => {
    return PROFILES.filter((profile) => {
      if (universityFilter && profile.university !== universityFilter) return false;
      if (interestFilter && !(profile.interests as string[]).includes(interestFilter)) return false;
      if (helpFilter && !(profile.helpWith as string[]).includes(helpFilter)) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [universityFilter, interestFilter, helpFilter]);

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
          runSearch(query);
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
                runSearch(suggestion);
              }}
              className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-600 transition hover:border-violet-300 hover:text-violet-800"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      {submittedQuery && (
        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-stone-900">Suggested for you</h2>
              {aiLoading && (
                <span className="text-xs font-medium text-violet-500">Refining with AI&hellip;</span>
              )}
              {!aiLoading && source === "ai" && (
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                  AI-matched
                </span>
              )}
              {!aiLoading && aiUnavailable && (
                <span className="text-xs font-medium text-stone-400">
                  AI matching unavailable &mdash; showing keyword matches
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {suggested.map(({ profile, score, reasons }) => (
              <ProfileCard key={profile.id} profile={profile} score={score} reasons={reasons} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-stone-900">All women in your network</h2>
          <span className="text-sm text-stone-500">{browsable.length} profiles</span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2.5">
          <select
            value={universityFilter}
            onChange={(event) => setUniversityFilter(event.target.value)}
            className="rounded-full border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-700 focus:border-violet-400 focus:outline-none"
          >
            <option value="">All universities</option>
            {UNIVERSITIES.map((university) => (
              <option key={university} value={university}>
                {university}
              </option>
            ))}
          </select>

          <select
            value={interestFilter}
            onChange={(event) => setInterestFilter(event.target.value)}
            className="rounded-full border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-700 focus:border-violet-400 focus:outline-none"
          >
            <option value="">All interests</option>
            {INTERESTS.map((interest) => (
              <option key={interest} value={interest}>
                {interest}
              </option>
            ))}
          </select>

          <select
            value={helpFilter}
            onChange={(event) => setHelpFilter(event.target.value)}
            className="rounded-full border border-stone-300 bg-white px-3.5 py-2 text-sm text-stone-700 focus:border-violet-400 focus:outline-none"
          >
            <option value="">Can help with anything</option>
            {HELP_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {(universityFilter || interestFilter || helpFilter) && (
            <button
              type="button"
              onClick={() => {
                setUniversityFilter("");
                setInterestFilter("");
                setHelpFilter("");
              }}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-50"
            >
              Clear filters
            </button>
          )}
        </div>

        {browsable.length === 0 ? (
          <p className="text-sm text-stone-500">No profiles match these filters.</p>
        ) : (
          <ProfileCarousel profiles={browsable} />
        )}
      </div>
    </div>
  );
}
