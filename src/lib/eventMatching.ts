import { Event, EventRecommendation, Profile, EventFilter } from "@/lib/types";
import { events as sampleEvents } from "@/data/events";
import { getEventDateTime } from "@/lib/format";
import { getExternalEventsWithCache } from "./externalEvents";

/**
 * Get recommended events for a user based on their profile interests
 */
export async function getRecommendedEvents(
  userProfile: Profile,
  allEvents?: Event[]
): Promise<EventRecommendation[]> {
  // Use provided events or combine sample + external events
  let eventsToScore = allEvents || [];
  if (!allEvents || allEvents.length === 0) {
    const externalEvents = await getExternalEventsWithCache(
      "women tech hackathon workshop",
      userProfile.university
    );
    eventsToScore = [...sampleEvents, ...externalEvents];
  }

  const recommendations = eventsToScore.map((event) => ({
    event,
    score: scoreEvent(userProfile, event),
    reason: getRecommendationReason(userProfile, event),
  }));

  // Sort by score descending, then by date ascending
  return recommendations
    .filter((rec) => rec.score > 0) // Filter out non-matching events
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.event.date).getTime() - new Date(b.event.date).getTime();
    });
}

/**
 * Score an event based on user profile match
 */
function scoreEvent(userProfile: Profile, event: Event): number {
  let score = 0;

  // Score based on event type matching interests
  if (event.eventType === "Hackathon" && userProfile.interests.includes("AI/ML")) {
    score += 20;
  }
  if (
    event.eventType === "Hackathon" &&
    userProfile.interests.includes("Software Engineering")
  ) {
    score += 15;
  }
  if (event.eventType === "Workshop") {
    // Workshops often related to learning/interests
    score += 10;
  }

  // Score based on event tags matching user profile
  if (event.tags.includes("Women-Only")) {
    score += 15; // FoundHer is for women, so women-only events score high
  }
  if (
    event.tags.includes("Muslim Women") &&
    userProfile.communities.includes("Muslim Women in Tech")
  ) {
    score += 20;
  }
  if (
    event.tags.includes("Beginners Welcome") &&
    userProfile.year.includes("Year") &&
    parseInt(userProfile.year) <= 2
  ) {
    score += 10;
  }

  // Slight preference for events at same university
  if (
    event.university &&
    userProfile.university &&
    event.university.toLowerCase() === userProfile.university.toLowerCase()
  ) {
    score += 5;
  }

  // Bonus for events in the future (within 60 days)
  const eventDate = getEventDateTime(event.date, event.time);
  const today = new Date();
  const daysUntilEvent = (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (daysUntilEvent > 0 && daysUntilEvent <= 60) {
    score += 10;
  } else if (daysUntilEvent <= 0) {
    score = Math.max(0, score - 30); // Heavily penalize past events
  }

  // Base score for any valid event
  score += 8;

  return Math.min(score, 99); // Cap at 99
}

/**
 * Get a human-readable recommendation reason
 */
function getRecommendationReason(userProfile: Profile, event: Event): string {
  if (event.tags.includes("Muslim Women") && userProfile.communities.includes("Muslim Women in Tech")) {
    return "Matches your Muslim Women in Tech community";
  }
  if (event.eventType === "Hackathon" && userProfile.interests.includes("AI/ML")) {
    return "Hackathon matching your AI/ML interests";
  }
  if (event.tags.includes("Beginners Welcome") && parseInt(userProfile.year) <= 2) {
    return "Beginner-friendly event for students";
  }
  if (event.university && userProfile.university === event.university) {
    return `Event at your university: ${event.university}`;
  }
  return `${event.eventType} event matching your interests`;
}

/**
 * Search and filter events based on query and filters
 */
export function filterEvents(
  events: Event[],
  filters: EventFilter
): Event[] {
  let filtered = [...events];

  // Match any selected event type. Keep eventType for older API callers.
  const selectedEventTypes = filters.eventTypes?.length
    ? filters.eventTypes
    : filters.eventType
      ? [filters.eventType]
      : [];

  if (selectedEventTypes.length > 0) {
    filtered = filtered.filter((event) => selectedEventTypes.includes(event.eventType));
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((e) =>
      filters.tags!.some((tag) => e.tags.includes(tag))
    );
  }

  // Filter by location
  if (filters.location) {
    filtered = filtered.filter((e) =>
      e.location.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  // Filter by date range
  if (filters.dateFrom) {
    filtered = filtered.filter((e) => e.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter((e) => e.date <= filters.dateTo!);
  }

  // Filter by search query (title + description)
  if (filters.searchQuery && filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query)
    );
  }

  // Sort by date (nearest first)
  filtered.sort(
    (a, b) =>
      getEventDateTime(a.date, a.time).getTime() - getEventDateTime(b.date, b.time).getTime()
  );

  return filtered;
}

/**
 * Get a single event by ID
 */
export function getEventById(eventId: string): Event | undefined {
  return sampleEvents.find((e) => e.id === eventId);
}

/**
 * Get events created by a specific user
 */
export function getEventsByCreator(creatorId: string): Event[] {
  return sampleEvents.filter((e) => e.creatorId === creatorId);
}

/**
 * RSVP a user to an event (returns updated event)
 */
export function rsvpEventImpl(
  event: Event,
  userId: string,
  userName: string
): Event {
  // Check if already attending
  if (event.attendees.some((a) => a.userId === userId)) {
    return event; // Already RSVP'd
  }

  // Check max capacity
  if (event.maxAttendees && event.attendeeCount >= event.maxAttendees) {
    throw new Error("Event is at maximum capacity");
  }

  const updatedEvent = {
    ...event,
    attendeeCount: event.attendeeCount + 1,
    attendees: [
      ...event.attendees,
      { userId, userName, rsvpDate: new Date().toISOString() },
    ],
  };

  return updatedEvent;
}
