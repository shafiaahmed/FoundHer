import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export interface ProfileRow {
  id: string;
  name: string;
  university: string;
  program: string;
  year: string;
  interests: string[];
  help_with: string[];
  looking_for: string[];
  communities: string[];
}

/** Returns the signed-in user's saved onboarding profile, or null if signed out or not yet onboarded. */
export async function getMyProfile(): Promise<ProfileRow | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<ProfileRow>();

  return profile ?? null;
}
