import { Community, HelpCategory, Interest, MatchTag, Profile } from "@/lib/types";

/** Shape of a row in the Supabase `profiles` table (real signed-up users' onboarding data). */
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

/** Maps a real signed-up user's saved onboarding row into the shape the rest of the app expects. */
export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    university: row.university,
    program: row.program,
    year: row.year,
    bio: "Just joined FoundHer and hasn't added a bio yet.",
    experience: "",
    interests: row.interests as Interest[],
    helpWith: row.help_with as HelpCategory[],
    lookingFor: row.looking_for as MatchTag[],
    communities: row.communities as Community[],
  };
}
