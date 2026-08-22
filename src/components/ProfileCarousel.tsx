"use client";

import { useRef } from "react";
import { ProfileCard } from "@/components/ProfileCard";
import { Profile } from "@/lib/types";

export function ProfileCarousel({ profiles }: { profiles: Profile[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute -left-4 top-[104px] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-md transition hover:border-violet-300 hover:text-violet-700 sm:flex"
      >
        &larr;
      </button>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {profiles.map((profile) => (
          <div key={profile.id} className="w-[320px] shrink-0">
            <ProfileCard profile={profile} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute -right-4 top-[104px] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-md transition hover:border-violet-300 hover:text-violet-700 sm:flex"
      >
        &rarr;
      </button>
    </div>
  );
}
