import { MatchReason, Profile } from "@/lib/types";

/**
 * Builds a suggested opening message. This is intentionally simple template
 * logic so it can later be swapped for an LLM-generated message without
 * touching any UI code — callers only depend on this function's signature.
 */
export function generateIcebreaker(profile: Profile, reasons: MatchReason[] = []): string {
  const firstName = profile.name.split(" ")[0];
  const topReasons = reasons.slice(0, 2);

  if (topReasons.length === 0) {
    const fallbackHelp = profile.helpWith[0];
    return fallbackHelp
      ? `Hey ${firstName}! I saw you can help with ${fallbackHelp.toLowerCase()} and would love to connect and learn from your experience!`
      : `Hey ${firstName}! I came across your profile on FoundHer and would love to connect!`;
  }

  if (topReasons.length === 1) {
    return `Hey ${firstName}! I saw that you ${topReasons[0].clause}. I'd love to connect!`;
  }

  return `Hey ${firstName}! I saw that you ${topReasons[0].clause}, and I ${topReasons[1].clause} too. I'd love to connect!`;
}
