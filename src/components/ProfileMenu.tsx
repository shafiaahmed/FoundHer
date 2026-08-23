"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ProfileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === "/account" || pathname.startsWith("/account/");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="group/profile relative">
      <button
        type="button"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        className={`rounded-full p-2 transition-all hover:-translate-y-0.5 hover:bg-violet-100 hover:text-violet-900 hover:shadow-[0_6px_16px_rgba(109,40,217,0.22)] ${
          isActive ? "bg-violet-100 text-violet-900 ring-1 ring-violet-200" : "text-stone-600"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </svg>
      </button>

      <div className="invisible absolute right-0 top-full z-50 w-44 pt-2 opacity-0 transition-all duration-150 group-hover/profile:visible group-hover/profile:opacity-100 group-focus-within/profile:visible group-focus-within/profile:opacity-100">
        <div role="menu" className="overflow-hidden rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl">
          <Link
            href="/account"
            role="menuitem"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-violet-50 hover:text-violet-900 focus:bg-violet-50 focus:outline-none"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
              <circle cx="10" cy="6" r="3" />
              <path d="M4 17a6 6 0 0 1 12 0" />
            </svg>
            View profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-stone-700 transition hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:outline-none"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
              <path d="M8 4H4v12h4M12 6l4 4-4 4M6 10h10" />
            </svg>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
