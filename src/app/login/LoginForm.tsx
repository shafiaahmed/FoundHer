"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "error";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/onboarding";

  const [email, setEmail] = useState("");
  const [attested, setAttested] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!attested) return;
    setStatus("sending");
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          data: {
            attested_woman: true,
            attested_at: new Date().toISOString(),
          },
        },
      });

      if (error) {
        setStatus("error");
        setErrorMessage(
          error.code === "over_email_send_rate_limit"
            ? "Too many sign-in emails have been requested. Please wait before trying again."
            : error.code === "over_request_rate_limit"
              ? "Too many sign-in attempts were made. Please wait a few minutes and try again."
              : error.code === "email_address_not_authorized"
                ? "Supabase is not configured to send login emails to this address."
                : "We couldn't send your sign-in link. Please try again."
        );
        return;
      }

      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMessage("We couldn't reach the login service. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        {status === "sent" ? (
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-violet-50 text-xl">
              ✉️
            </div>
            <h1 className="mt-4 text-xl font-semibold text-stone-900">Check your email</h1>
            <p className="mt-2 text-sm text-stone-600">
              We sent a sign-in link to <span className="font-medium">{email}</span>. Click it to
              continue.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-stone-900">Log in to FoundHer</h1>
            <p className="mt-1.5 text-sm text-stone-600">
              Enter your email and we&apos;ll send you a magic link &mdash; no password needed.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@university.edu"
                className="input"
              />

              <label className="flex items-start gap-2.5 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={attested}
                  onChange={(event) => setAttested(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 text-violet-600 focus:ring-violet-400"
                />
                <span>
                  FoundHer is a space for women in tech. By continuing, I confirm I identify as a
                  woman.
                </span>
              </label>

              <button
                type="submit"
                disabled={status === "sending" || !attested}
                className="w-full rounded-full bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Sending link..." : "Send magic link"}
              </button>
              {status === "error" && (
                <p className="text-sm text-rose-600">
                  {errorMessage}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
