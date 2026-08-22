"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg px-4 py-2 text-stone-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-100 hover:text-violet-900 hover:ring-1 hover:ring-violet-200 hover:shadow-[0_6px_16px_rgba(109,40,217,0.22)]"
    >
      Log out
    </button>
  );
}
