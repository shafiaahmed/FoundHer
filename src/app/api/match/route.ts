import { NextResponse } from "next/server";
import { getAiRecommendations } from "@/lib/aiMatching";

export async function POST(request: Request) {
  const { query } = (await request.json()) as { query?: string };

  if (!query || !query.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const results = await getAiRecommendations(query);
    return NextResponse.json({ results, source: "ai" });
  } catch (error) {
    console.error("AI matching failed:", error);
    return NextResponse.json({ error: "AI matching failed" }, { status: 502 });
  }
}
