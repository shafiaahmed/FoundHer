"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Event } from "@/lib/types";
import { formatEventDate } from "@/lib/format";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        setEvent(data.event ?? null);
      } catch (error) {
        console.error("Failed to load event:", error);
      }
    }

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/user");
        const data = await response.json();
        setCurrentUserId(data.user?.id ?? null);
      } catch {
        setCurrentUserId(null);
      }
    }

    loadEvent();
    loadUser();
  }, [eventId]);

  const isCreator = Boolean(event && currentUserId && event.creatorId === currentUserId);

  const handleDelete = async () => {
    if (!event) return;

    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      router.push("/account");
    } catch (error) {
      console.error("Delete failed:", error);
      window.alert("Unable to delete this event right now.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!event) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-stone-600">Event not found</p>
          <Link href="/events" className="mt-4 text-violet-600 hover:underline">
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const isPast = new Date(event.date) < new Date();

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <Link href="/events" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            ← Back to Events
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-800">
              {event.eventType}
            </span>
            {event.isExternal && (
              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
                External Event
              </span>
            )}
            {isPast && (
              <span className="rounded-full bg-stone-200 px-4 py-2 text-sm font-semibold text-stone-600">
                Past Event
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-stone-900">{event.title}</h1>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-stone-600">Date & Time</p>
              <p className="mt-1 text-lg text-stone-900">
                {formatEventDate(event.date)} at {event.time}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-600">Location</p>
              <p className="mt-1 text-lg text-stone-900">{event.location}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-stone-200 pt-8">
            <h2 className="mb-4 text-xl font-bold text-stone-900">About this event</h2>
            <p className="whitespace-pre-wrap text-stone-700">{event.description}</p>
          </div>

          {event.tags.length > 0 && (
            <div className="mt-8 border-t border-stone-200 pt-8">
              <h3 className="mb-4 font-semibold text-stone-900">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-amber-50 px-3 py-1.5 text-sm text-amber-800">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-stone-200 pt-8">
            <h3 className="mb-4 font-semibold text-stone-900">Organized by</h3>
            <div className="flex items-center justify-between rounded-xl border border-stone-200 p-4">
              <div>
                <p className="font-semibold text-stone-900">{event.creatorName}</p>
                {event.university && <p className="text-sm text-stone-600">{event.university}</p>}
              </div>
              {event.isExternal ? (
                event.url ? (
                  <a href={event.url} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline">
                    View on Eventbrite
                  </a>
                ) : null
              ) : (
                <Link href={`/profile/${event.creatorId}`} className="text-violet-600 hover:underline">
                  View profile
                </Link>
              )}
            </div>
          </div>

          {!isPast && !isCreator && (
            <div className="mt-8 border-t border-stone-200 pt-8">
              {event.isExternal && event.url ? (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-violet-700"
                >
                  RSVP on Eventbrite
                </a>
              ) : (
                <button className="w-full rounded-lg bg-violet-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-violet-700">
                  RSVP to Event
                </button>
              )}
            </div>
          )}

          {isCreator && (
            <div className="mt-8 border-t border-stone-200 pt-8">
              <div className="flex gap-3">
                <Link
                  href={`/events/${event.id}/edit`}
                  className="flex-1 rounded-lg border border-stone-200 px-5 py-3 text-center font-semibold text-stone-700 transition hover:bg-stone-50"
                >
                  Edit Event
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg bg-rose-600 px-5 py-3 font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                >
                  {isDeleting ? "Deleting..." : "Delete Event"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
