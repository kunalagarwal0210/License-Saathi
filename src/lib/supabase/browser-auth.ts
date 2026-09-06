/**
 * Browser, SESSION-AWARE Supabase client (ticket 10) — uses `@supabase/ssr`'s
 * `createBrowserClient`, which (unlike the plain `createClient` in
 * `client.ts`) writes the auth session into cookies rather than
 * `localStorage`. That's what lets `src/lib/supabase/server.ts` (server
 * actions, server components) see the same signed-in session over the
 * request's cookies. Only the email-OTP flow (`SaveChecklist.tsx`) needs
 * this — every other client read stays on `client.ts`, unchanged.
 *
 * Constructed lazily inside the getter, same pattern as `client.ts`, so
 * importing this file never throws and `next build` succeeds with no
 * Supabase env set.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let cached: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserAuthClient(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      "createSupabaseBrowserAuthClient: NEXT_PUBLIC_SUPABASE_URL is not set. See .env.example."
    );
  }
  if (!anonKey) {
    throw new Error(
      "createSupabaseBrowserAuthClient: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. See .env.example."
    );
  }

  cached = createBrowserClient<Database>(url, anonKey);
  return cached;
}
