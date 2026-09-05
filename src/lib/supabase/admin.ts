/**
 * Server-only Supabase admin client — uses the service-role key, which
 * bypasses Row-Level Security entirely.
 *
 * ⚠️ SERVER ONLY. Never import this module from client components or any
 * code that ships to the browser bundle — `SUPABASE_SERVICE_ROLE_KEY` has no
 * `NEXT_PUBLIC_` prefix specifically so Next.js keeps it out of client code.
 * The `server-only` import below turns an accidental client-bundle import
 * into a build error, rather than relying on this comment alone. Use this
 * module only from route handlers, server actions, server components, and
 * scripts (seeding, the admin panel, moderation).
 *
 * The client is constructed lazily, inside the getter, not at module top
 * level — so importing this file never throws, and `next build` succeeds
 * with no Supabase env set. The error only surfaces if/when code actually
 * calls `getSupabaseAdmin()` without the env configured.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let cached: SupabaseClient<Database> | undefined;

export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("getSupabaseAdmin: NEXT_PUBLIC_SUPABASE_URL is not set. See .env.example.");
  }
  if (!serviceRoleKey) {
    throw new Error(
      "getSupabaseAdmin: SUPABASE_SERVICE_ROLE_KEY is not set. See .env.example. " +
        "This key is server-only — never set it with a NEXT_PUBLIC_ prefix."
    );
  }

  cached = createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
