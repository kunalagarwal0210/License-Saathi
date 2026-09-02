/**
 * Feature flags — "ship dark" by default.
 *
 * A flag is ON only when its environment variable is exactly the string
 * "true". Anything else (unset, "false", "1", "TRUE", …) is OFF, so newly
 * merged code stays invisible until the flag is deliberately flipped on the
 * host. Flags live on Vercel, scoped per environment (Production / Preview /
 * Development) — never committed. See docs/feature-flags-and-staging.md.
 *
 * These are SERVER-SIDE flags (no NEXT_PUBLIC_ prefix): read them in server
 * components, route handlers, and middleware to gate a feature (e.g. return a
 * 404 while dark). A flag that must gate client code needs a NEXT_PUBLIC_ var
 * instead. Prefer one dedicated flag per feature.
 */
export type FeatureFlag =
  | "FEATURE_SAVE_CHECKLIST" // Phone-OTP + save checklist (ticket 10)
  | "FEATURE_ADMIN" // Admin CRUD panel (ticket 09)
  | "FEATURE_FIELD_NOTES" // Community field-notes display (ticket 08)
  | "FEATURE_REMINDERS"; // Reminder email + field-note capture (14, 15)

export function isEnabled(flag: FeatureFlag): boolean {
  return process.env[flag] === "true";
}
