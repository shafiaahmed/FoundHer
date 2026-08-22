"use client";

import { EventType, EventTag } from "@/lib/types";
import { EVENT_TYPES, EVENT_TAGS } from "@/data/options";
import { ChipSelector } from "./ChipSelector";

interface EventFilterChipsProps {
  selectedTypes: EventType[];
  selectedTags: EventTag[];
  onTypeChange: (types: EventType[]) => void;
  onTagChange: (tags: EventTag[]) => void;
}

export default function EventFilterChips({
  selectedTypes,
  selectedTags,
  onTypeChange,
  onTagChange,
}: EventFilterChipsProps) {
  const handleTypeToggle = (type: string) => {
    const eventType = type as EventType;
    const newTypes = selectedTypes.includes(eventType)
      ? selectedTypes.filter((t) => t !== eventType)
      : [...selectedTypes, eventType];
    onTypeChange(newTypes);
  };

  const handleTagToggle = (tag: string) => {
    const eventTag = tag as EventTag;
    const newTags = selectedTags.includes(eventTag)
      ? selectedTags.filter((t) => t !== eventTag)
      : [...selectedTags, eventTag];
    onTagChange(newTags);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Event Type Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-stone-700">Event Type</label>
        <ChipSelector
          options={EVENT_TYPES as string[]}
          selected={selectedTypes as string[]}
          onToggle={handleTypeToggle}
          compact
        />
      </div>

      {/* Event Tags Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-stone-700">Tags</label>
        <ChipSelector
          options={EVENT_TAGS as string[]}
          selected={selectedTags as string[]}
          onToggle={handleTagToggle}
          compact
        />
      </div>
    </div>
  );
}
