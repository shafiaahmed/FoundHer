import { getProfileById as getMockProfileById } from "@/lib/matching";
import { ProfileRow, toProfile } from "@/lib/profileRow";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/lib/types";

/** All real signed-up users' profiles. Requires the profiles table to allow authenticated read-all. */
export async function getRealProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").returns<ProfileRow[]>();

  return (data ?? []).map(toProfile);
}

/** Looks up a profile by id across both the mock dataset and real signed-up users. */
export async function getProfileByIdIncludingReal(id: string): Promise<Profile | null> {
  const mock = getMockProfileById(id);
  if (mock) return mock;

  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).single<ProfileRow>();

  return data ? toProfile(data) : null;
}
