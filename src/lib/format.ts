export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

const AVATAR_PALETTE = [
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
];

export function getAvatarColor(seed: string): string {
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

/**
 * Format date string (YYYY-MM-DD) to readable format
 * E.g., "2026-09-15" → "Sep 15, 2026"
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getEventDateTime(dateString: string, timeString = "23:59"): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  const time = parseEventTime(timeString) ?? { hours: 23, minutes: 59 };
  return new Date(year, month - 1, day, time.hours, time.minutes);
}

export function isEventPast(dateString: string, timeString?: string): boolean {
  return getEventDateTime(dateString, timeString).getTime() < Date.now();
}

/**
 * Format time string (HH:MM) to readable format
 * E.g., "14:30" → "2:30 PM"
 */
export function formatEventTime(timeString: string): string {
  const time = parseEventTime(timeString);
  if (!time) return "TBA";

  const date = new Date(2000, 0, 1, time.hours, time.minutes);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function parseEventTime(timeString: string): { hours: number; minutes: number } | null {
  const match = timeString.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([ap]m))?$/i);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();

  if (minutes < 0 || minutes > 59) return null;
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === "am" && hours === 12) hours = 0;
    if (meridiem === "pm" && hours !== 12) hours += 12;
  } else if (hours < 0 || hours > 23) {
    return null;
  }

  return { hours, minutes };
}
