import { Event } from "@/lib/types";

type EventbriteJsonLdItem = {
  item?: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    image?: string;
    eventAttendanceMode?: string;
    url?: string;
    location?: {
      name?: string;
      address?: {
        streetAddress?: string;
        addressLocality?: string;
        addressRegion?: string;
        addressCountry?: string;
      };
    };
  };
};

type EventbriteApiEvent = {
  id?: string;
  name?: { text?: string };
  summary?: string;
  description?: { text?: string };
  start?: { local?: string };
  url?: string;
  online_event?: boolean;
  organizer?: { name?: string };
  venue?: {
    name?: string;
    address?: {
      localized_address_display?: string;
      address_1?: string;
      city?: string;
      region?: string;
      country?: string;
    };
  };
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function eventTypeFromText(title: string, description?: string): Event["eventType"] {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  if (text.includes("hackathon")) return "Hackathon";
  if (text.includes("study session") || text.includes("study group")) return "Study Session";
  if (text.includes("panel")) return "Panel Discussion";
  if (text.includes("career fair") || text.includes("job fair")) return "Career Fair";
  if (text.includes("network") || text.includes("mixer") || text.includes("meetup")) return "Networking";
  if (text.includes("workshop") || text.includes("bootcamp")) return "Workshop";
  return "Workshop";
}

function detectEventTags(text: string): Event["tags"] {
  const tags: Event["tags"] = [];
  const lower = text.toLowerCase();

  if (lower.includes("women")) tags.push("Women-Only");
  if (lower.includes("muslim")) tags.push("Muslim Women");
  if (lower.includes("student")) tags.push("Students Only");
  if (lower.includes("beginner") || lower.includes("no experience")) tags.push("Beginners Welcome");
  if (lower.includes("virtual") || lower.includes("online") || lower.includes("remote")) tags.push("Virtual", "Remote-Friendly");

  return [...new Set(tags)];
}

const TECH_TERMS = [
  "tech",
  "technology",
  "software",
  "developer",
  "engineering",
  "coding",
  "programming",
  "computer science",
  "data",
  "artificial intelligence",
  "machine learning",
  "cybersecurity",
  "cloud",
  "product management",
  "ux",
  "ui",
  "startup",
  "stem",
  "hackathon",
];

function isTechEvent(event: Event): boolean {
  const text = `${event.title} ${event.description}`.toLowerCase();
  return /\bai\b/.test(text) || TECH_TERMS.some((term) => text.includes(term));
}

function isWomenFocused(event: Event): boolean {
  const text = `${event.title} ${event.description}`.toLowerCase();
  return ["women", "woman", "female", "girls", "nonbinary", "non-binary"].some((term) =>
    text.includes(term)
  );
}

function toLocationString(location?: NonNullable<EventbriteJsonLdItem["item"]>["location"]): string {
  const address = location?.address;
  const parts = [address?.streetAddress, address?.addressLocality, address?.addressRegion, address?.addressCountry]
    .filter(Boolean)
    .join(", ");
  return parts || location?.name || "Virtual";
}

function toTimeString(dateString?: string): string {
  if (!dateString) return "TBA";

  // Eventbrite dates are ISO strings. Preserve the event's advertised local
  // clock time instead of converting it to the server's timezone.
  const isoTime = dateString.match(/T(\d{2}):(\d{2})/);
  if (isoTime) return `${isoTime[1]}:${isoTime[2]}`;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "TBA";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function extractJsonLd(html: string): EventbriteJsonLdItem[] {
  const scripts = Array.from(
    html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)
  ).map((match) => match[1]);

  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script.trim()) as { [key: string]: unknown; itemListElement?: unknown };
      if (parsed && parsed["@type"] === "ItemList" && Array.isArray(parsed.itemListElement)) {
        return parsed.itemListElement as EventbriteJsonLdItem[];
      }
    } catch {
      // ignore malformed JSON blocks
    }
  }

  return [];
}

async function fetchEventbritePublicEvents(
  keywords: string = "",
  location?: string
): Promise<Event[]> {
  if (!keywords.trim() && !location?.trim()) return [];

  const loc = slugify(location || "online");
  const params = new URLSearchParams();
  params.set("q", ["women tech", keywords.trim()].filter(Boolean).join(" "));
  const url = `https://www.eventbrite.com/d/${loc}/events/?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 FoundHer/1.0",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    console.error(`Eventbrite public search error: ${response.status} ${response.statusText}`);
    return [];
  }

  const html = await response.text();
  const items = extractJsonLd(html);

  const discoveredEvents = items
    .map((entry) => entry.item)
    .filter((item): item is NonNullable<EventbriteJsonLdItem["item"]> => Boolean(item?.url && item?.name && item?.startDate))
    .slice(0, 20)
    .map((item) => {
      const title = item.name ?? "Eventbrite event";
      const description = item.description ?? "External Eventbrite event";
      const eventType = eventTypeFromText(title, description);
      const tags = detectEventTags(`${title} ${description}`);
      const date = item.startDate ? item.startDate.slice(0, 10) : new Date().toISOString().slice(0, 10);
      const time = toTimeString(item.startDate);
      const locationText = toLocationString(item.location);
      const eventbriteIdMatch = item.url?.match(/tickets-(\d+)/) ?? item.url?.match(/-(\d+)$/);
      const externalId = eventbriteIdMatch?.[1] ?? item.url ?? title;

      return {
        id: `eventbrite-${externalId}`,
        title,
        description,
        eventType,
        date,
        time,
        location: locationText,
        creatorId: `eventbrite-${externalId}`,
        creatorName: "Eventbrite",
        attendeeCount: 0,
        attendees: [],
        tags,
        isExternal: true,
        externalId: String(externalId),
        url: item.url,
      } as Event;
    });

  const token = process.env.EVENTBRITE_API_TOKEN;
  if (!token) {
    return discoveredEvents
      .filter(isTechEvent)
      .sort((a, b) => Number(isWomenFocused(b)) - Number(isWomenFocused(a)));
  }

  const enrichedEvents = await Promise.all(
    discoveredEvents.map(async (event) => {
      if (!event.externalId || !/^\d+$/.test(event.externalId)) return event;

      try {
        const apiResponse = await fetch(
          `https://www.eventbriteapi.com/v3/events/${event.externalId}/?expand=venue,organizer`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!apiResponse.ok) return event;

        const apiEvent = (await apiResponse.json()) as EventbriteApiEvent;
        const title = apiEvent.name?.text || event.title;
        const description = apiEvent.summary || apiEvent.description?.text || event.description;
        const venueAddress = apiEvent.venue?.address;
        const locationText = apiEvent.online_event
          ? "Online"
          : venueAddress?.localized_address_display ||
            [venueAddress?.address_1, venueAddress?.city, venueAddress?.region, venueAddress?.country]
              .filter(Boolean)
              .join(", ") ||
            apiEvent.venue?.name ||
            event.location;

        return {
          ...event,
          title,
          description,
          eventType: eventTypeFromText(title, description),
          date: apiEvent.start?.local?.slice(0, 10) || event.date,
          time: toTimeString(apiEvent.start?.local) || event.time,
          location: locationText,
          creatorName: apiEvent.organizer?.name || event.creatorName,
          tags: detectEventTags(`${title} ${description} ${locationText}`),
          url: apiEvent.url || event.url,
        };
      } catch {
        return event;
      }
    })
  );

  return enrichedEvents
    .filter(isTechEvent)
    .sort((a, b) => Number(isWomenFocused(b)) - Number(isWomenFocused(a)));
}

const cache = new Map<string, { events: Event[]; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000;

export async function getExternalEventsWithCache(
  keywords?: string,
  location?: string
): Promise<Event[]> {
  const cacheKey = `${keywords ?? ""}|${location ?? ""}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.events;
  }

  const events = await fetchEventbritePublicEvents(keywords, location);
  cache.set(cacheKey, { events, timestamp: now });
  return events;
}

export function getCachedExternalEvents(): Event[] {
  const allEvents = Array.from(cache.values()).flatMap((entry) => entry.events);
  return allEvents.filter((event, index, list) => list.findIndex((item) => item.id === event.id) === index);
}

export async function getExternalEventById(eventId: string): Promise<Event | null> {
  const cached = getCachedExternalEvents().find((event) => event.id === eventId);
  if (cached) return cached;

  return null;
}
