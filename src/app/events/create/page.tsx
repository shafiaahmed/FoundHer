"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventType, EventTag } from "@/lib/types";
import { EVENT_TYPES, EVENT_TAGS } from "@/data/options";
import { ChipSelector } from "@/components/ChipSelector";
import Link from "next/link";

const confettiColors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#38bdf8", "#f43f5e"];

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "Hackathon" as EventType,
    date: "",
    time: "14:00",
    location: "",
    maxAttendees: "",
  });

  const [selectedTags, setSelectedTags] = useState<EventTag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.title.trim() || !formData.date || !formData.location.trim()) {
      setSubmitError("Please fill in the title, date, and location.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      setShowSuccess(true);
      window.setTimeout(() => {
        router.push("/account");
      }, 1800);
    } catch (error) {
      console.error("Error creating event:", error);
      setSubmitError("Something went wrong while creating your event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    const eventTag = tag as EventTag;
    const newTags = selectedTags.includes(eventTag)
      ? selectedTags.filter((t) => t !== eventTag)
      : [...selectedTags, eventTag];
    setSelectedTags(newTags);
  };

  const confettiPieces = Array.from({ length: 18 }, (_, index) => ({
    id: index,
    left: `${(index * 13) % 100}%`,
    delay: `${(index % 6) * 0.08}s`,
    duration: `${1.2 + (index % 5) * 0.18}s`,
    color: confettiColors[index % confettiColors.length],
  }));

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <Link href="/events" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
            ← Back to Events
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-8">
          <h1 className="mb-2 text-3xl font-bold text-stone-900">Create Event</h1>
          <p className="mb-8 text-stone-600">
            Share an event with the FoundHer community. Hackathons, study sessions, networking
            events, and more!
          </p>

          {submitError && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-stone-700">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="E.g., Women in Tech Hackathon 2026"
                className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-stone-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell the community about this event. What can attendees expect? Any requirements?"
                rows={5}
                className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            {/* Event Type */}
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

            {/* Date & Time */}
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

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-stone-700">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="E.g., Stanford University, Palo Alto, CA or Virtual"
                className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
                required
              />
            </div>

            {/* Max Attendees */}
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-semibold text-stone-700">
                Max Attendees (Optional)
              </label>
              <input
                type="number"
                id="maxAttendees"
                name="maxAttendees"
                value={formData.maxAttendees}
                onChange={handleInputChange}
                placeholder="Leave blank for unlimited"
                min="1"
                className="mt-2 w-full rounded-lg border border-stone-200 px-4 py-2 focus:border-violet-500 focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">Event Tags</label>
              <ChipSelector
                options={EVENT_TAGS as string[]}
                selected={selectedTags as string[]}
                onToggle={handleTagToggle}
              />
              <p className="mt-2 text-xs text-stone-500">
                Tags help people find your event. Select all that apply.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 border-t border-stone-200 pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-violet-600 px-6 py-3 font-bold text-white transition-colors hover:bg-violet-700 disabled:bg-stone-300"
              >
                {isSubmitting ? "Creating..." : "Create Event"}
              </button>
              <Link
                href="/events"
                className="flex items-center justify-center rounded-lg border border-stone-200 px-6 py-3 font-semibold text-stone-700 transition-colors hover:bg-stone-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/45 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl">
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
              {confettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className="absolute top-[70%] h-3 w-3 rounded-full"
                  style={{
                    left: piece.left,
                    backgroundColor: piece.color,
                    animation: `confetti-burst ${piece.duration} ease-out forwards`,
                    animationDelay: piece.delay,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-4 text-5xl">🎉</div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
                Success
              </p>
              <h2 className="mt-2 text-3xl font-bold text-stone-900">Event created</h2>
              <p className="mt-2 text-base text-stone-600">
                Your event is now live and ready for RSVPs.
              </p>

              <div className="mt-6 flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/account")}
                  className="flex-1 rounded-full bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
                >
                  View my events
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/events")}
                  className="flex-1 rounded-full border border-stone-200 px-5 py-3 font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Browse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes confetti-burst {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.7) rotate(0deg);
          }
          15% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-180px) scale(1.2) rotate(220deg);
          }
        }
      `}</style>
    </main>
  );
}
