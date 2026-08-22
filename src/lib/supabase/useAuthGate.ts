"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Returns a guard that redirects to /login (preserving the current page) if signed out, or runs the action if signed in. */
export function useAuthGate() {
  const router = useRouter();
  const pathname = usePathname();

  return async function requireAuth(onAuthenticated: () => void) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    onAuthenticated();
  };
}
