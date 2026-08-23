"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChipSelector } from "@/components/ChipSelector";
import { EVENT_TAGS, EVENT_TYPES } from "@/data/options";
import { Event, EventTag, EventType } from "@/lib/types";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "Workshop" as EventType,
    date: "",
    time: "14:00",
    location: "",
    maxAttendees: "",
  });
  const [selectedTags, setSelectedTags] = useState<EventTag[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${encodeURIComponent(eventId)}`);
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.event) return;
        const nextEvent = data.event as Event | null;
        setEvent(nextEvent);

        if (nextEvent) {
          setFormData({
            title: nextEvent.title,
            description: nextEvent.description,
            eventType: nextEvent.eventType,
            date: nextEvent.date,
            time: nextEvent.time,
            location: nextEvent.location,
            maxAttendees: nextEvent.maxAttendees ? String(nextEvent.maxAttendees) : "",
          });
          setSelectedTags(nextEvent.tags);
        }
      } catch (error) {
        console.error("Error loading event to edit:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tag: string) => {
    const eventTag = tag as EventTag;
    const nextTags = selectedTags.includes(eventTag)
      ? selectedTags.filter((item) => item !== eventTag)
      : [...selectedTags, eventTag];
    setSelectedTags(nextTags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          maxAttendees: formData.maxAttendees ? Number(formData.maxAttendees) : undefined,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      router.push(`/events/${eventId}`);
    } catch (error) {
      console.error("Failed to save event updates:", error);
      window.alert("Unable to save your changes right now.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-stone-600">Loading event...</p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <p className="text-stone-600">Event not found.</p>
          <Link href="/events" className="mt-4 inline-block text-violet-600 hover:underline">
            Back to events
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <Link href={`/events/${eventId}`} className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            ← Back to event
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-8">
          <h1 className="mb-2 text-3xl font-bold text-stone-900">Edit Event</h1>
          <p className="mb-8 text-stone-600">Update your event details and tags.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-stone-700">
                Event Title *
              </label>
              <input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-stone-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="eventType" className="block text-sm font-semibold text-stone-700">
                Event Type *
              </label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-stone-700">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-semibold text-stone-700">
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-stone-700">
                Location *
              </label>
              <input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-semibold text-stone-700">
                Max Attendees (Optional)
              </label>
              <input
                id="maxAttendees"
                name="maxAttendees"
                type="number"
                min="1"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">Event Tags</label>
              <ChipSelector
                options={EVENT_TAGS as string[]}
                selected={selectedTags as string[]}
                onToggle={handleTagToggle}
              />
            </div>

            <div className="flex gap-4 border-t border-stone-200 pt-8">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-lg bg-violet-600 px-6 py-3 font-bold text-white transition-colors hover:bg-violet-700 disabled:bg-stone-300"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <Link
                href={`/events/${eventId}`}
                className="flex items-center justify-center rounded-lg border border-stone-200 px-6 py-3 font-semibold text-stone-700 transition-colors hover:bg-stone-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
