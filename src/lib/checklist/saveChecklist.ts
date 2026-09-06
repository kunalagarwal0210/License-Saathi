/**
 * Ticket 10 — pure logic for the "save checklist" flow. No DB, no I/O, so
 * it's unit-tested directly (see `saveChecklist.test.ts`, mirroring
 * `routeView.test.ts`'s style); `src/app/results/[category]/actions.ts`
 * wires this to the real Supabase insert.
 */
import type { ChecklistItemsInsert } from "../supabase/types";

/**
 * Maps an ordered list of resolved licence uuids to the `checklist_items`
 * rows to insert for one `saved_checklists.id`, one per licence, each
 * starting life as `status: 'pending'`. Preserves the engine's order
 * (callers rely on insertion order matching the route order) — order isn't
 * persisted as a column, but nothing here re-sorts or dedupes.
 */
export function buildChecklistItemRows(
  checklistId: string,
  orderedLicenseIds: readonly string[]
): ChecklistItemsInsert[] {
  return orderedLicenseIds.map((licenseId) => ({
    checklist_id: checklistId,
    license_id: licenseId,
    status: "pending",
  }));
}

/** Minimal, deliberately permissive email shape check — Supabase Auth is the
 * real validator; this only stops obviously-empty/garbage input from
 * reaching the network call and gives instant feedback in the UI. */
export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/** A Supabase email-OTP code is a 6-digit numeric string. */
export function isValidOtp(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}
