import { PROFILES } from "@/data/profiles";

const MOCK_IDS = new Set(PROFILES.map((p) => p.id));

/** True if this id belongs to a real signed-up user, not one of the mock demo profiles. */
export function isRealProfileId(id: string): boolean {
  return !MOCK_IDS.has(id);
}
