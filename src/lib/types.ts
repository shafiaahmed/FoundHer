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
  /** Current or most recent employer, if any — not everyone has one yet. */
  company?: string;
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
  company: string;
  interests: Interest[];
  helpWith: HelpCategory[];
  lookingFor: MatchTag[];
}

export type EventType =
  | "Hackathon"
  | "Study Session"
  | "Networking"
  | "Workshop"
  | "Career Fair"
  | "Panel Discussion";

export type EventTag =
  | "Women-Only"
  | "Muslim Women"
  | "Students Only"
  | "Beginners Welcome"
  | "Remote-Friendly"
  | "Virtual";

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  date: string; // ISO date string
  time: string; // HH:MM format
  location: string;
  university?: string;
  creatorId: string;
  creatorName: string;
  maxAttendees?: number;
  attendeeCount: number;
  attendees: { userId: string; userName: string; rsvpDate: string }[];
  tags: EventTag[];
  isExternal: boolean; // true if from Eventbrite
  externalId?: string; // Eventbrite event ID
  url?: string; // External event URL
  foundHerAttendeeCount?: number;
  foundHerAttendees?: { userId: string; userName: string }[];
  currentUserGoing?: boolean;
  currentUserIsOrganizer?: boolean;
  currentUserJoinRequest?: {
    id: string;
    status: "pending" | "accepted" | "declined" | "cancelled" | "removed";
  };
  pendingJoinRequests?: {
    id: string;
    requesterId: string;
    requesterName: string;
    createdAt: string;
  }[];
}

export interface EventRecommendation {
  event: Event;
  score: number;
  reason: string;
}

export interface EventFilter {
  eventType?: EventType;
  eventTypes?: EventType[];
  tags?: EventTag[];
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export type PostCategory = "question" | "collaboration" | "offering_help" | "general";

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  category: PostCategory;
  content: string;
  createdAt: string;
  updatedAt: string;
}
