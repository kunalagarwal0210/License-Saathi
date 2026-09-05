/**
 * Browser Supabase client — safe to import from client components.
 *
 * Uses only the public URL + anon key (NEXT_PUBLIC_-prefixed, so both are
 * baked into the client bundle and gated by RLS, not secrecy). Reads by
 * `anon` are limited to what the RLS policies in
 * `supabase/migrations/0001_initial_schema.sql` allow (public read on
 * `licenses`/`rules`/`field_notes`, owner-only on user data).
 *
 * The client is constructed lazily, inside the getter, not at module top
 * level — so importing this file never throws, and `next build` succeeds
 * with no Supabase env set. The error only surfaces if/when code actually
 * calls `getSupabaseBrowserClient()` without the env configured.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let cached: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      "getSupabaseBrowserClient: NEXT_PUBLIC_SUPABASE_URL is not set. See .env.example."
    );
  }
  if (!anonKey) {
    throw new Error(
      "getSupabaseBrowserClient: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. See .env.example."
    );
  }

  cached = createClient<Database>(url, anonKey);
  return cached;
}
