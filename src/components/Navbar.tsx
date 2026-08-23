import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { NotificationBell } from "@/components/NotificationBell";
import { MessageNavIcon } from "@/components/MessageNavIcon";
import { ProfileMenu } from "@/components/ProfileMenu";
import { getCurrentUser } from "@/lib/supabase/auth";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-violet-100 bg-[#faf8f6]/90 backdrop-blur">
      <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-violet-900">
          <span aria-hidden="true" className="relative flex h-4 w-4 items-center justify-center rounded-full border-2 border-violet-800/45 bg-violet-100/20">
            <span className="absolute -bottom-1 -right-1 h-2 w-1 rotate-[-45deg] rounded-full bg-violet-800/45" />
          </span>
          <span>Found<span className="text-violet-500">Her</span></span>
        </Link>
        <nav className="flex min-w-0 max-w-[calc(100vw-8rem)] shrink items-center gap-0 overflow-x-auto text-xs font-medium [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 sm:text-sm [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:whitespace-nowrap [&>a]:px-2 sm:[&>a]:px-4">
          <NavLink href="/discover">Discover</NavLink>
          <NavLink href="/events">Events</NavLink>
          {user ? (
            <>
              <NavLink href="/connections">My Connections</NavLink>
              <MessageNavIcon />
              <NotificationBell />
              <ProfileMenu />
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
