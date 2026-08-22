import { PROFILES } from "@/data/profiles";
import { MatchReason, MatchResult, MatchTag, Profile } from "@/lib/types";

/**
 * Maps free-text keywords/phrases a user might type to the structured tags
 * used on profiles. Longer/more specific phrases are listed first so they
 * can be matched before their broader substrings.
 */
const KEYWORD_MAP: { phrases: string[]; tag: MatchTag }[] = [
  { phrases: ["leetcode", "leet code", "algorithm", "algorithms", "data structures"], tag: "LeetCode" },
  { phrases: ["technical interview", "coding interview", "interview prep", "swe interview", "interview"], tag: "Technical Interviews" },
  { phrases: ["resume", "cv review", "cover letter"], tag: "Resume Reviews" },
  { phrases: ["internship", "intern"], tag: "Internships" },
  { phrases: ["hackathon", "hack team", "hackathon teammate", "build a team"], tag: "Hackathons" },
  { phrases: ["course advice", "which course", "class advice", "taken this course", "course"], tag: "Course Advice" },
  { phrases: ["mentor", "mentorship"], tag: "Mentorship" },
  { phrases: ["study buddy", "study partner", "study group", "study"], tag: "Study Buddy" },
  { phrases: ["career advice", "career switch", "career"], tag: "Career Advice" },
  { phrases: ["machine learning", "artificial intelligence", " ai ", "ai/ml", "ml ", "ai."], tag: "AI/ML" },
  { phrases: ["software engineering", "swe", "backend", "software engineer"], tag: "Software Engineering" },
  { phrases: ["web development", "web dev", "frontend", "front-end", "react"], tag: "Web Development" },
  { phrases: ["cybersecurity", "cyber security", "security", "ctf"], tag: "Cybersecurity" },
  { phrases: ["data science", "data analyst", "data scientist"], tag: "Data Science" },
  { phrases: ["cloud", "aws", "azure", "distributed systems"], tag: "Cloud" },
  { phrases: ["product manager", "product management", " pm ", "product"], tag: "Product" },
  { phrases: ["ui/ux", "ux design", "ui design", "product design", "design"], tag: "UI/UX" },
  { phrases: ["muslim women", "muslim woman", "muslim"], tag: "Muslim Women in Tech" },
];

const HELP_WEIGHT = 15;
const INTEREST_WEIGHT = 10;
const COMMUNITY_WEIGHT = 20;
const BASE_SCORE = 8;

/** Extracts the set of known tags mentioned in a free-text query. */
export function extractTags(query: string): MatchTag[] {
  const normalized = ` ${query.toLowerCase()} `;
  const found = new Set<MatchTag>();

  for (const { phrases, tag } of KEYWORD_MAP) {
    if (phrases.some((phrase) => normalized.includes(phrase))) {
      found.add(tag);
    }
  }

  return Array.from(found);
}

/**
 * Deterministic fallback score used when there is no query yet (or no
 * recognizable tags in it): derived purely from how much a profile has to
 * offer, so it never relies on randomness.
 */
function baselineScore(profile: Profile): number {
  const score =
    35 + profile.helpWith.length * 6 + profile.interests.length * 4 + profile.communities.length * 5;
  return Math.min(score, 97);
}

function tagIn(list: readonly string[], tag: MatchTag): boolean {
  return (list as readonly string[]).includes(tag);
}

function buildReason(tag: MatchTag, profile: Profile): MatchReason | null {
  if (tagIn(profile.helpWith, tag)) {
    return { tag, text: `Can help you with ${tag}`, clause: `can help with ${tag}` };
  }
  if (tagIn(profile.communities, tag)) {
    return {
      tag,
      text: `Part of the ${tag} community`,
      clause: `are part of the ${tag} community`,
    };
  }
  if (tagIn(profile.interests, tag)) {
    return { tag, text: `Shares your interest in ${tag}`, clause: `share an interest in ${tag}` };
  }
  return null;
}

/**
 * When only one query tag matched, every profile with that tag reads
 * identically ("Can help you with Mentorship"). Pad with a couple of
 * distinguishing reasons pulled from the profile's other attributes so
 * cards don't all look the same under the keyword-matcher fallback.
 */
function bonusReasons(profile: Profile, exclude: Set<MatchTag>, limit: number): MatchReason[] {
  const bonuses: MatchReason[] = [];

  for (const tag of profile.helpWith) {
    if (bonuses.length >= limit) break;
    if (exclude.has(tag)) continue;
    bonuses.push({ tag, text: `Also helps with ${tag}`, clause: `also help with ${tag}` });
  }

  for (const tag of profile.interests) {
    if (bonuses.length >= limit) break;
    if (exclude.has(tag)) continue;
    bonuses.push({ tag, text: `Also into ${tag}`, clause: `are also into ${tag}` });
  }

  return bonuses;
}

function scoreProfile(profile: Profile, queryTags: MatchTag[]): MatchResult {
  if (queryTags.length === 0) {
    return { profile, score: baselineScore(profile), reasons: [] };
  }

  let score = BASE_SCORE;
  const reasons: MatchReason[] = [];

  for (const tag of queryTags) {
    if (tagIn(profile.communities, tag)) {
      score += COMMUNITY_WEIGHT;
    } else if (tagIn(profile.helpWith, tag)) {
      score += HELP_WEIGHT;
    } else if (tagIn(profile.interests, tag)) {
      score += INTEREST_WEIGHT;
    } else {
      continue;
    }

    const reason = buildReason(tag, profile);
    if (reason) reasons.push(reason);
  }

  if (reasons.length > 0 && reasons.length < 2) {
    const existingTags = new Set(reasons.map((r) => r.tag));
    reasons.push(...bonusReasons(profile, existingTags, 2 - reasons.length));
  }

  return { profile, score: Math.min(score, 99), reasons };
}

export interface GetRecommendationsOptions {
  profiles?: Profile[];
  limit?: number;
}

export function getRecommendations(
  query: string,
  options: GetRecommendationsOptions = {}
): MatchResult[] {
  const { profiles = PROFILES, limit } = options;
  const queryTags = extractTags(query);

  const results = profiles
    .map((profile) => scoreProfile(profile, queryTags))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.profile.name.localeCompare(b.profile.name);
    });

  return typeof limit === "number" ? results.slice(0, limit) : results;
}

export function getProfileById(id: string): Profile | undefined {
  return PROFILES.find((profile) => profile.id === id);
}
