/**
 * Ticket 16 — Google OAuth callback. `GoogleSignInButton` sends the browser
 * to Google via `supabase.auth.signInWithOAuth`, redirectTo'd back here with
 * `?code=...&next=...`. This route exchanges the PKCE `code` for a session
 * (landed in cookies by `createSupabaseServerClient`, same as the email-OTP
 * flow) and redirects the user on to wherever they started from.
 *
 * Ungated (no FEATURE_SAVE_CHECKLIST check) — inert without a real OAuth
 * `code`, and gating it would only complicate the redirect chain from
 * Google. Never throws: any failure just redirects with `?auth_error=1`
 * rather than rendering a Next.js error page mid-auth.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/safeRedirect";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const safeNext = safeNextPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL(safeNext, url.origin));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const separator = safeNext.includes("?") ? "&" : "?";
      return NextResponse.redirect(new URL(`${safeNext}${separator}auth_error=1`, url.origin));
    }
    return NextResponse.redirect(new URL(safeNext, url.origin));
  } catch {
    return NextResponse.redirect(new URL("/dashboard?auth_error=1", url.origin));
  }
}
