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
  const [hours, minutes] = timeString.split(":").map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0);
}

export function isEventPast(dateString: string, timeString?: string): boolean {
  return getEventDateTime(dateString, timeString).getTime() < Date.now();
}

/**
 * Format time string (HH:MM) to readable format
 * E.g., "14:30" → "2:30 PM"
 */
export function formatEventTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, minutes);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
