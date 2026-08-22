"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  title: string;
  message: string;
  event_id?: string;
  read_at?: string;
  created_at: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications ?? []);
        const markReadResponse = await fetch("/api/notifications", { method: "PATCH" });
        if (markReadResponse.ok) {
          const readAt = new Date().toISOString();
          setNotifications((current) =>
            current.map((notification) => ({ ...notification, read_at: notification.read_at ?? readAt }))
          );
          window.dispatchEvent(new Event("foundher:notifications-read"));
        }
      }
      setLoading(false);
    }
    loadNotifications();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-stone-900">Notifications</h1>
      <p className="mt-2 text-stone-600">Event requests and updates from your FoundHer community.</p>
      <div className="mt-8 space-y-3">
        {loading ? (
          <p className="text-stone-500">Loading notifications...</p>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} className={`rounded-xl border p-4 ${notification.read_at ? "border-stone-200 bg-white" : "border-violet-200 bg-violet-50"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-stone-900">{notification.title}</p>
                  <p className="mt-1 text-sm text-stone-600">{notification.message}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-stone-400">
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
              {notification.event_id && (
                <Link href={`/events/${notification.event_id}`} className="mt-3 inline-block text-sm font-semibold text-violet-700 hover:underline">
                  View event
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-500">No notifications yet.</div>
        )}
      </div>
    </main>
  );
}
