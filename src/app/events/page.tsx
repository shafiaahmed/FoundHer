"use client";

import { useEffect, useMemo, useState } from "react";
import { Event, EventType, EventTag } from "@/lib/types";
import EventCard from "@/components/EventCard";
import EventFilterChips from "@/components/EventFilterChips";
import { filterEvents } from "@/lib/eventMatching";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const router = useRouter();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("Toronto");
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [selectedTags, setSelectedTags] = useState<EventTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set("q", searchQuery.trim());
        if (locationQuery.trim()) params.set("location", locationQuery.trim());

        const response = await fetch(`/api/events?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to load events");
        const data = await response.json();
        const events = Array.isArray(data.events) ? data.events : [];
        setAllEvents(events);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to load events:", error);
        setAllEvents([]);
      } finally {
        setIsLoading(false);
      }
    }

    const timeout = window.setTimeout(loadEvents, 400);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery, locationQuery]);

  const filteredEvents = useMemo(
    () =>
      filterEvents(allEvents, {
        eventTypes: selectedTypes,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        searchQuery,
      }),
    [searchQuery, selectedTypes, selectedTags, allEvents]
  );

  const handleRsvp = async (event: Event) => {
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
      router.push(`/login?next=${encodeURIComponent("/events")}`);
      return;
    }
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      window.alert(result?.error ?? "Unable to update your attendance right now.");
      return;
    }

    setAllEvents((events) =>
      events.map((item) =>
        item.id === event.id
          ? {
              ...item,
              currentUserGoing: nextGoing,
              foundHerAttendeeCount: Math.max(
                0,
                (item.foundHerAttendeeCount ?? 0) + (nextGoing ? 1 : -1)
              ),
            }
          : item
      )
    );
  };

  const handleJoinRequest = async (event: Event) => {
    const pendingRequest = event.currentUserJoinRequest?.status === "pending"
      ? event.currentUserJoinRequest
      : null;
    const response = await fetch(`/api/events/${encodeURIComponent(event.id)}/join-requests`, {
      method: pendingRequest ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: pendingRequest ? JSON.stringify({ requestId: pendingRequest.id }) : undefined,
    });
    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent("/events")}`);
      return;
    }
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      window.alert(result?.error ?? "Unable to update your join request.");
      return;
    }
    setAllEvents((events) =>
      events.map((item) =>
        item.id === event.id
          ? { ...item, currentUserJoinRequest: pendingRequest ? undefined : result.request }
          : item
      )
    );
  };

  const hasActiveFilters = searchQuery || selectedTypes.length > 0 || selectedTags.length > 0;

  return (
    <main className="relative isolate min-h-screen overflow-clip bg-gradient-to-br from-[#f2e9ed] via-[#f1eadb] to-[#dcd0e5]">
      <div className="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-violet-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-[-8%] h-96 w-96 rounded-full bg-rose-100/45 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 top-24 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-[8%] h-80 w-80 rounded-full bg-violet-300/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(92,40,95,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(92,40,95,0.045)_1px,transparent_1px)] [background-size:48px_48px]" />
      {/* Header */}
      <div className="relative z-10 border-b border-white/50 bg-white/25 px-6 py-8 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">Events</h1>
              <p className="mt-3 max-w-md border-l-2 border-violet-600 pl-3 text-sm font-medium leading-relaxed text-stone-700 sm:text-base">
                Discover Hackathons, Workshops, Networking Events, And More
              </p>
            </div>
            <Link
              href="/events/create"
              className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-violet-700"
            >
              Create Event
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="sticky top-24 h-fit w-64 flex-shrink-0 self-start">
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Search Events
                </label>
                <input
                  type="text"
                  placeholder="Hackathon, workshop, networking..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm placeholder-stone-400 focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Toronto, New York, online..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm placeholder-stone-400 focus:border-violet-500 focus:outline-none"
                />
              </div>

              {/* Filters */}
              <EventFilterChips
                selectedTypes={selectedTypes}
                selectedTags={selectedTags}
                onTypeChange={setSelectedTypes}
                onTagChange={setSelectedTags}
              />

              {/* Clear Filters */}
              {(hasActiveFilters || locationQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setLocationQuery("");
                    setSelectedTypes([]);
                    setSelectedTags([]);
                  }}
                  className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-100"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Events Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-stone-600">Loading events...</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              <>
                <p className="mb-6 text-sm text-stone-600">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRsvp={handleRsvp}
                      onJoinRequest={handleJoinRequest}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white py-12">
                <p className="text-stone-600">No events found matching your criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setLocationQuery("");
                    setSelectedTypes([]);
                    setSelectedTags([]);
                  }}
                  className="mt-4 rounded-lg bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
