import { GoogleGenAI, Type } from "@google/genai";
import { MatchReason, MatchResult, MatchTag, Profile } from "@/lib/types";

const MODEL = "gemini-3.6-flash";

interface AiMatch {
  id: string;
  score: number;
  reasons: string[];
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    matches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          score: { type: Type.NUMBER },
          reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["id", "score", "reasons"],
      },
    },
  },
  required: ["matches"],
};

function buildPrompt(query: string, profiles: Profile[]): string {
  const profileSummaries = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    program: p.program,
    year: p.year,
    bio: p.bio,
    interests: p.interests,
    helpWith: p.helpWith,
    communities: p.communities,
  }));

  return `You are matching a user's request to a list of potential mentors/peers on a platform called FoundHer.

User's request: "${query}"

Candidate profiles (JSON):
${JSON.stringify(profileSummaries, null, 2)}

Rank every profile by how well it matches the user's request. For each profile return:
- id: the profile's id, unchanged
- score: an integer 0-100 estimating match quality (be discriminating; not everyone should score highly)
- reasons: 1-3 short phrases (each under 8 words) explaining the match, written in third person about what the profile offers (e.g. "Can help with technical interviews", "Shares an interest in AI/ML")

Include all profiles, even low-scoring ones. Return only the structured data.`;
}

export async function getAiRecommendations(query: string, profiles: Profile[]): Promise<MatchResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(query, profiles),
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  const parsed = JSON.parse(text) as { matches: AiMatch[] };
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const results: MatchResult[] = parsed.matches
    .map((match) => {
      const profile = profileById.get(match.id);
      if (!profile) return null;

      const score = Math.max(0, Math.min(100, Math.round(match.score)));
      const fallbackTag: MatchTag = profile.interests[0] ?? profile.helpWith[0] ?? "Mentorship";
      const reasons: MatchReason[] = match.reasons.map((reasonText) => ({
        tag: fallbackTag,
        text: reasonText,
        clause: reasonText.charAt(0).toLowerCase() + reasonText.slice(1),
      }));

      const result: MatchResult = { profile, score, reasons };
      return result;
    })
    .filter((result): result is MatchResult => result !== null)
    .sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    throw new Error("Gemini returned no usable matches");
  }

  return results;
}
