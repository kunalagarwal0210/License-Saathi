/**
 * Ticket 04 — OAuth (Google) PKCE callback. Exchanges the `code` for a session
 * (cookies are written by the server client) and redirects to a validated
 * relative `next`. Any failure falls back to `/`; never throws.
 */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/safeNext";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // fall through to the safe fallback
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
