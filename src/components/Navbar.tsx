import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { NavLink } from "@/components/NavLink";
import { NotificationBell } from "@/components/NotificationBell";
import { MessageNavIcon } from "@/components/MessageNavIcon";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-violet-100 bg-[#faf8f6]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-violet-900">
          Found<span className="text-violet-500">Her</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <NavLink href="/discover">Discover</NavLink>
          <NavLink href="/events">Events</NavLink>
          {user ? (
            <>
              <NavLink href="/account">My Profile</NavLink>
              <NavLink href="/connections">My Connections</NavLink>
              <MessageNavIcon />
              <NotificationBell />
              <LogoutButton />
            </>
          ) : (
            <>
              <NavLink href="/login">Log in</NavLink>
              <NavLink href="/onboarding" prominent>Find My Circle</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
