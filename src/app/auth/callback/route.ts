import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const origin = getPublicOrigin(request, requestUrl);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const emailOtpType = searchParams.get("type") as EmailOtpType | null;
  const requestedNext = searchParams.get("next") ?? "/onboarding";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/account";

  const supabase = await createClient();
  const authResult = tokenHash
    ? await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: emailOtpType ?? "email",
      })
    : code
      ? await supabase.auth.exchangeCodeForSession(code)
      : null;

  if (authResult && !authResult.error) {
    if (next === "/onboarding") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          return NextResponse.redirect(`${origin}/account`);
        }
      }
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  const errorCode = authResult?.error?.code ?? "auth";
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorCode)}`);
}

function getPublicOrigin(request: Request, requestUrl: URL) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.RENDER_EXTERNAL_URL;

  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      // Fall back to proxy headers if an environment URL was entered incorrectly.
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    return `${forwardedProtocol ?? "https"}://${forwardedHost}`;
  }

  return requestUrl.origin;
}
