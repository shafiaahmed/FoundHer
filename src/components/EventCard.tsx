"use client";

import { Event } from "@/lib/types";
import Link from "next/link";
import { formatEventDate } from "@/lib/format";

interface EventCardProps {
  event: Event;
  score?: number;
  onRsvp?: (event: Event) => void;
  onJoinRequest?: (event: Event) => void;
}

export default function EventCard({ event, score, onRsvp, onJoinRequest }: EventCardProps) {
  const eventDate = new Date(event.date);
  const today = new Date();
  const isPast = eventDate < today;

  // Color coding for event types
  const eventTypeColors: Record<string, string> = {
    Hackathon: "bg-rose-100 text-rose-800",
    "Study Session": "bg-emerald-100 text-emerald-800",
    Networking: "bg-sky-100 text-sky-800",
    Workshop: "bg-amber-100 text-amber-800",
    "Career Fair": "bg-violet-100 text-violet-800",
    "Panel Discussion": "bg-stone-200 text-stone-800",
  };

  const typeColor = eventTypeColors[event.eventType] || "bg-stone-100 text-stone-800";

  return (
      <article className="group relative flex h-full flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:shadow-lg hover:translate-y-[-4px]">
        {/* Score Badge */}
        {score !== undefined && (
          <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800">
            {score}%
          </div>
        )}

        {/* Event source */}
        <p className="text-xs font-medium text-stone-400">
          {event.isExternal ? "External · Eventbrite" : "Internal · FoundHer"}
        </p>

        {/* Event type badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${typeColor}`}>
            {event.eventType}
          </span>
          {isPast && (
            <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-600">
              Past
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex-1">
          <Link href={`/events/${event.id}`} className="block">
            <h3 className="text-lg font-bold text-stone-900 line-clamp-2 group-hover:text-violet-600">
              {event.title}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-stone-600 line-clamp-2">
            {event.description}
          </p>
        </div>

        {/* Event Details */}
        <div className="flex flex-col gap-2 text-sm text-stone-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold">📅</span>
            <span>
              {formatEventDate(event.date)} at {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">📍</span>
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800"
              >
                {tag}
              </span>
            ))}
            {event.tags.length > 2 && (
              <span className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-700">
                +{event.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* FoundHer attendance and actions */}
        <div className="border-t border-stone-100 pt-4">
          <span className="text-sm text-stone-600">
            {event.foundHerAttendeeCount ?? 0} FoundHer {(event.foundHerAttendeeCount ?? 0) === 1 ? "member" : "members"} going
          </span>
          {!isPast && (
            <div className="mt-3 flex flex-wrap gap-2">
              {event.isExternal ? (
                <button
                  type="button"
                  onClick={() => onRsvp?.(event)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                    event.currentUserGoing
                      ? "border border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100"
                      : "bg-violet-600 text-white hover:bg-violet-700"
                  }`}
                >
                  {event.currentUserGoing ? "Shared: I’m Going ✓" : "Share I’m Going"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onJoinRequest?.(event)}
                  disabled={event.currentUserJoinRequest?.status === "accepted" || event.currentUserJoinRequest?.status === "declined"}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-default ${
                    event.currentUserJoinRequest?.status === "accepted"
                      ? "bg-emerald-100 text-emerald-800"
                      : event.currentUserJoinRequest?.status === "declined"
                        ? "bg-stone-100 text-stone-500"
                        : event.currentUserJoinRequest?.status === "pending"
                          ? "border border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100"
                          : "bg-violet-600 text-white hover:bg-violet-700"
                  }`}
                >
                  {event.currentUserJoinRequest?.status === "pending"
                    ? "Request Pending · Cancel"
                    : event.currentUserJoinRequest?.status === "accepted"
                      ? "Accepted ✓"
                      : event.currentUserJoinRequest?.status === "declined"
                        ? "Request Declined"
                        : "Request to Join"}
                </button>
              )}
          {event.isExternal && event.url && (
            <a
              href={event.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
              aria-label={`Get tickets for ${event.title} on Eventbrite (opens in a new tab)`}
            >
              Get tickets
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M11 3h6v6M17 3l-8 8" />
                <path d="M15 11v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
              </svg>
            </a>
          )}
            </div>
          )}
        </div>
      </article>
  );
}
