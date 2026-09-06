/**
 * Ticket 10 — session-refresh middleware, the standard `@supabase/ssr`
 * pattern. This ONLY keeps the Supabase auth cookie fresh on every request;
 * it does not redirect or gate any route. Discovery (questionnaire, results)
 * stays fully login-free by design — see docs/tickets/10-otp-auth-save.md.
 * Do not add route guards here without a separate, deliberate decision.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/types";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // No Supabase env configured (e.g. some preview environments) — don't
  // block every request on a client we can't construct; just pass through.
  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refreshes the session cookie (and rewrites it via setAll above) if the
  // access token is expired. Required reading, per @supabase/ssr docs, even
  // though the result isn't used for any redirect decision here.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - common static asset extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
