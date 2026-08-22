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

  const handleAttendance = async () => {
    if (!event) return;
    const nextGoing = !event.currentUserGoing;
    const response = await fetch(`/api/events/${encodeURIComponent(event.id)}/rsvp`, {
      method: nextGoing ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: nextGoing
        ? JSON.stringify({
            visibility: "members",
            event: {
              externalId: event.externalId,
              title: event.title,
              url: event.url,
              date: event.date,
              location: event.location,
              isExternal: event.isExternal,
            },
          })
        : undefined,
    });

    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      window.alert(result?.error ?? "Unable to update your attendance right now.");
      return;
    }

    const result = await response.json();
    setEvent((current) => {
      if (!current) return current;
      const attendees = current.foundHerAttendees ?? [];
      return {
        ...current,
        currentUserGoing: nextGoing,
        foundHerAttendeeCount: Math.max(
          0,
          (current.foundHerAttendeeCount ?? 0) + (nextGoing ? 1 : -1)
        ),
        foundHerAttendees: nextGoing
          ? [...attendees, { userId: result.userId, userName: result.userName }]
          : attendees.filter((attendee) => attendee.userId !== currentUserId),
      };
    });
  };

  const handleJoinRequest = async () => {
    if (!event) return;
    const pendingRequest = event.currentUserJoinRequest?.status === "pending"
      ? event.currentUserJoinRequest
      : null;
    const response = await fetch(`/api/events/${encodeURIComponent(event.id)}/join-requests`, {
      method: pendingRequest ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: pendingRequest ? JSON.stringify({ requestId: pendingRequest.id }) : undefined,
    });
    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      window.alert(result?.error ?? "Unable to update your join request.");
      return;
    }
    setEvent((current) => current ? {
      ...current,
      currentUserJoinRequest: pendingRequest ? undefined : result.request,
    } : current);
  };

  const handleRequestDecision = async (requestId: string, decision: "accepted" | "declined") => {
    if (!event) return;
    const response = await fetch(
      `/api/events/${encodeURIComponent(event.id)}/join-requests/${requestId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      }
    );
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      window.alert(result?.error ?? "Unable to respond to this request.");
      return;
    }
    setEvent((current) => current ? {
      ...current,
      pendingJoinRequests: current.pendingJoinRequests?.filter((item) => item.id !== requestId),
      foundHerAttendeeCount:
        (current.foundHerAttendeeCount ?? 0) + (decision === "accepted" ? 1 : 0),
    } : current);
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

          {isCreator && !event.isExternal && (
            <div className="mt-8 border-t border-stone-200 pt-8">
              <h3 className="font-semibold text-stone-900">
                Pending join requests ({event.pendingJoinRequests?.length ?? 0})
              </h3>
              {(event.pendingJoinRequests?.length ?? 0) > 0 ? (
                <div className="mt-4 space-y-3">
                  {event.pendingJoinRequests?.map((joinRequest) => (
                    <div key={joinRequest.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 p-4">
                      <div>
                        <p className="font-medium text-stone-900">{joinRequest.requesterName}</p>
                        <p className="text-xs text-stone-500">Requested {new Date(joinRequest.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleRequestDecision(joinRequest.id, "declined")} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">Decline</button>
                        <button type="button" onClick={() => handleRequestDecision(joinRequest.id, "accepted")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">Accept</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-stone-500">No pending requests.</p>
              )}
            </div>
          )}

          <div className="mt-8 border-t border-stone-200 pt-8">
            <h3 className="font-semibold text-stone-900">
              FoundHer members planning to attend ({event.foundHerAttendeeCount ?? 0})
            </h3>
            {(event.foundHerAttendees?.length ?? 0) > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {event.foundHerAttendees?.map((attendee) => (
                  <span
                    key={attendee.userId}
                    className="rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-800"
                  >
                    {attendee.userName}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-stone-500">
                No members have shared that they are going yet.
              </p>
            )}
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
              <div className="grid gap-3 sm:grid-cols-2">
                {event.isExternal ? (
                  <button
                    type="button"
                    onClick={handleAttendance}
                    className="w-full rounded-lg bg-violet-600 px-6 py-3 font-bold text-white transition-colors hover:bg-violet-700"
                  >
                    {event.currentUserGoing ? "Shared: I’m Going ✓" : "Share I’m Going"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleJoinRequest}
                    disabled={event.currentUserJoinRequest?.status === "accepted" || event.currentUserJoinRequest?.status === "declined"}
                    className="w-full rounded-lg bg-violet-600 px-6 py-3 font-bold text-white transition-colors hover:bg-violet-700 disabled:bg-stone-200 disabled:text-stone-500"
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
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-6 py-3 font-bold text-stone-700 transition-colors hover:bg-stone-50"
                  >
                    Get tickets on Eventbrite ↗
                  </a>
                )}
              </div>
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
