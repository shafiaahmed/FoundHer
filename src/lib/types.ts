export type Interest =
  | "AI/ML"
  | "Software Engineering"
  | "Web Development"
  | "Cybersecurity"
  | "Data Science"
  | "Cloud"
  | "Product"
  | "UI/UX";

export type HelpCategory =
  | "Technical Interviews"
  | "LeetCode"
  | "Resume Reviews"
  | "Internships"
  | "Hackathons"
  | "Course Advice"
  | "Mentorship"
  | "Study Buddy"
  | "Career Advice";

export type Community = "Muslim Women in Tech";

export type MatchTag = Interest | HelpCategory | Community;

export interface Profile {
  id: string;
  name: string;
  university: string;
  program: string;
  year: string;
  bio: string;
  experience: string;
  interests: Interest[];
  helpWith: HelpCategory[];
  lookingFor: MatchTag[];
  communities: Community[];
}

export interface MatchReason {
  tag: MatchTag;
  /** Card-friendly phrase, e.g. "Can help you with LeetCode". */
  text: string;
  /** Second-person clause for icebreaker sentences, e.g. "can help with LeetCode". */
  clause: string;
}

export interface MatchResult {
  profile: Profile;
  score: number;
  reasons: MatchReason[];
}

export interface OnboardingData {
  name: string;
  university: string;
  program: string;
  year: string;
  interests: Interest[];
  helpWith: HelpCategory[];
  lookingFor: MatchTag[];
}
