import { NextResponse } from "next/server";
import { PROFILES } from "@/data/profiles";
import { getAiRecommendations } from "@/lib/aiMatching";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getRealProfiles } from "@/lib/supabase/directory";

export async function POST(request: Request) {
  const { query } = (await request.json()) as { query?: string };

  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const [user, realProfiles] = await Promise.all([getCurrentUser(), getRealProfiles()]);
    const profiles = [...PROFILES, ...realProfiles.filter((profile) => profile.id !== user?.id)];

    const results = await getAiRecommendations(query, profiles);
    return NextResponse.json({ results, source: "ai" });
  } catch (error) {
    console.error("AI matching failed:", error);
    return NextResponse.json({ error: "AI matching failed" }, { status: 502 });
  }
}
