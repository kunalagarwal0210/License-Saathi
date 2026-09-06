/**
 * Server-only, SESSION-AWARE Supabase client (ticket 10) — reads/writes the
 * auth cookies via `@supabase/ssr`, unlike `client.ts` (plain anon client,
 * no session) and `admin.ts` (service-role, bypasses RLS entirely). Use this
 * one from server actions and server components that need to know "who is
 * the logged-in user" and act as them under RLS (e.g. inserting the
 * caller's own `users`/`saved_checklists` rows — see
 * `src/app/results/[category]/actions.ts`).
 *
 * `server-only` turns an accidental client-bundle import into a build error.
 * Constructed fresh per call (not cached at module scope like `client.ts`/
 * `admin.ts`) because it's bound to the current request's cookies via
 * `next/headers` — caching an instance across requests would leak one
 * user's session into another's.
 */
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      "createSupabaseServerClient: NEXT_PUBLIC_SUPABASE_URL is not set. See .env.example."
    );
  }
  if (!anonKey) {
    throw new Error(
      "createSupabaseServerClient: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. See .env.example."
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component (not a Server Action / Route
          // Handler) — cookies can't be set there. Harmless as long as the
          // session-refresh middleware is also running (it is).
        }
      },
    },
  });
}
