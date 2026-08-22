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
  const [attendeeToRemove, setAttendeeToRemove] = useState<{ id: string; name: string } | null>(null);
  const [isRemovingAttendee, setIsRemovingAttendee] = useState(false);
  const [removalError, setRemovalError] = useState("");

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

  useEffect(() => {
    if (!attendeeToRemove) return;
    const closeOnEscape = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape" && !isRemovingAttendee) setAttendeeToRemove(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [attendeeToRemove, isRemovingAttendee]);

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

  const handleRemoveAttendee = async () => {
    if (!event || !attendeeToRemove) return;
    setIsRemovingAttendee(true);
    setRemovalError("");
    const response = await fetch(
      `/api/events/${encodeURIComponent(event.id)}/attendees/${encodeURIComponent(attendeeToRemove.id)}`,
      { method: "DELETE" }
    );
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setRemovalError(result?.error ?? "Unable to remove this attendee.");
      setIsRemovingAttendee(false);
      return;
    }
    setEvent((current) => current ? {
      ...current,
      foundHerAttendees: current.foundHerAttendees?.filter(
        (attendee) => attendee.userId !== attendeeToRemove.id
      ),
      foundHerAttendeeCount: Math.max(0, (current.foundHerAttendeeCount ?? 0) - 1),
    } : current);
    setIsRemovingAttendee(false);
    setAttendeeToRemove(null);
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
                        <Link
                          href={`/profile/${joinRequest.requesterId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900 hover:underline"
                          aria-label={`View ${joinRequest.requesterName}'s profile in a new tab`}
                        >
                          View profile
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden="true">
                            <path d="M11 3h6v6M17 3l-8 8" />
                            <path d="M15 11v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
                          </svg>
                        </Link>
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
              <div className={`mt-4 ${isCreator && !event.isExternal ? "space-y-2" : "flex flex-wrap gap-2"}`}>
                {event.foundHerAttendees?.map((attendee) => (
                  isCreator && !event.isExternal ? (
                    <div key={attendee.userId} className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-3">
                      <Link href={`/profile/${attendee.userId}`} target="_blank" rel="noreferrer" className="font-medium text-stone-900 hover:text-violet-700 hover:underline">
                        {attendee.userName}
                      </Link>
                      <button type="button" onClick={() => { setRemovalError(""); setAttendeeToRemove({ id: attendee.userId, name: attendee.userName }); }} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span key={attendee.userId} className="rounded-full bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-800">
                      {attendee.userName}
                    </span>
                  )
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
                    disabled={event.currentUserJoinRequest?.status === "accepted" || event.currentUserJoinRequest?.status === "declined" || event.currentUserJoinRequest?.status === "removed"}
                    className="w-full rounded-lg bg-violet-600 px-6 py-3 font-bold text-white transition-colors hover:bg-violet-700 disabled:bg-stone-200 disabled:text-stone-500"
                  >
                    {event.currentUserJoinRequest?.status === "pending"
                      ? "Request Pending · Cancel"
                      : event.currentUserJoinRequest?.status === "accepted"
                        ? "Accepted ✓"
                        : event.currentUserJoinRequest?.status === "declined"
                          ? "Request Declined"
                          : event.currentUserJoinRequest?.status === "removed"
                            ? "Removed by Organizer"
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

      {attendeeToRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
          onClick={() => !isRemovingAttendee && setAttendeeToRemove(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-attendee-title"
            className="animate-fade-in-up w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 10v6M14 10v6" />
              </svg>
            </div>
            <h2 id="remove-attendee-title" className="mt-4 text-xl font-semibold text-stone-900">
              Remove attendee?
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Remove <span className="font-semibold text-stone-900">{attendeeToRemove.name}</span> from {event.title}? They will be notified and the attendee count will update.
            </p>
            {removalError && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{removalError}</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAttendeeToRemove(null)}
                disabled={isRemovingAttendee}
                autoFocus
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveAttendee}
                disabled={isRemovingAttendee}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-wait disabled:opacity-60"
              >
                {isRemovingAttendee ? "Removing..." : "Remove attendee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
