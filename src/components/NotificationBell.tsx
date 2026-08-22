"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUnreadCount(data?.unreadCount ?? 0))
      .catch(() => setUnreadCount(0));
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      className="relative rounded-lg p-2 text-stone-600 transition-all hover:-translate-y-0.5 hover:bg-violet-100 hover:text-violet-900 hover:shadow-[0_6px_16px_rgba(109,40,217,0.22)]"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-600 px-1 text-center text-[10px] font-bold leading-4 text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
