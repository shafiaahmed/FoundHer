"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const REFRESH_INTERVAL_MS = 8000;

export function MessageNavIcon() {
  const pathname = usePathname();
  const [hasUnread, setHasUnread] = useState(false);
  const isActive = pathname === "/messages" || pathname.startsWith("/messages/");

  const refreshUnread = useCallback(() => {
    fetch("/api/messages/unread", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setHasUnread((data?.unreadCount ?? 0) > 0))
      .catch(() => setHasUnread(false));
  }, []);

  useEffect(() => {
    refreshUnread();
  }, [pathname, refreshUnread]);

  useEffect(() => {
    const handleMessagesRead = () => refreshUnread();
    const interval = window.setInterval(refreshUnread, REFRESH_INTERVAL_MS);
    window.addEventListener("focus", refreshUnread);
    window.addEventListener("foundher:messages-read", handleMessagesRead);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshUnread);
      window.removeEventListener("foundher:messages-read", handleMessagesRead);
    };
  }, [refreshUnread]);

  return (
    <Link
      href="/messages"
      aria-label={hasUnread ? "Messages, unread messages available" : "Messages"}
      aria-current={isActive ? "page" : undefined}
      className={`relative rounded-lg p-2 transition-all hover:-translate-y-0.5 hover:bg-violet-100 hover:text-violet-900 hover:shadow-[0_6px_16px_rgba(109,40,217,0.22)] ${
        isActive ? "bg-violet-100 text-violet-900 ring-1 ring-violet-200" : "text-stone-600"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
      {hasUnread && (
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-violet-600 ring-2 ring-[#faf8f6]" aria-hidden="true" />
      )}
    </Link>
  );
}
