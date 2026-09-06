/**
 * Ticket 16 — pure helper for the Google OAuth callback route
 * (`src/app/auth/callback/route.ts`). Validates the caller-supplied `next`
 * query param so it can only ever point somewhere inside this app, never
 * off-site (an "open redirect" — e.g. `next=https://evil.example`,
 * `next=//evil.example` (protocol-relative), or a non-string value).
 *
 * A safe value: a string starting with exactly one "/", not "//", and with
 * no backslash. Anything else falls back to `/dashboard`.
 */
const FALLBACK = "/dashboard";

export function safeNextPath(next: unknown): string {
  if (typeof next !== "string") return FALLBACK;
  if (!next.startsWith("/")) return FALLBACK;
  if (next.startsWith("//")) return FALLBACK;
  // The WHATWG URL parser normalizes "\" to "/" for http(s), so "/\evil.com"
  // (or "/\\evil.com") would resolve to the off-site authority "//evil.com".
  // Reject any backslash to close that open-redirect bypass.
  if (next.includes("\\")) return FALLBACK;
  return next;
}
