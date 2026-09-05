/**
 * Ticket 08 — community field-notes data access.
 *
 * Field notes are the SECOND, unofficial tier (see docs/DESIGN.md and
 * UI_IMPLEMENTATION_SPEC.md §13): amber, clearly labelled, and NEVER mixed
 * with the green verified spine. This module only ever reads the
 * `field_notes_public` view (never the raw `field_notes` table, which has no
 * public SELECT policy and carries PII in `reporter_contact` — see
 * supabase/migrations/0001_initial_schema.sql).
 */
import { getSupabaseBrowserClient } from "../supabase/client";
import type { FieldNotePublicRow } from "../supabase/types";

/**
 * Groups rows by `license_id`, preserving each license's incoming row order.
 * Pure — no DB, no I/O — so it's unit-tested directly (see
 * `fieldNotes.test.ts`, mirroring `routeView.test.ts`'s style).
 */
export function groupFieldNotesByLicenseId(
  rows: FieldNotePublicRow[]
): Map<string, FieldNotePublicRow[]> {
  const grouped = new Map<string, FieldNotePublicRow[]>();
  for (const row of rows) {
    const existing = grouped.get(row.license_id);
    if (existing) {
      existing.push(row);
    } else {
      grouped.set(row.license_id, [row]);
    }
  }
  return grouped;
}

/**
 * Fetches publicly-promoted field notes for the given license ids and groups
 * them by license id. Only `status: "promoted"` notes are ever shown
 * publicly — `new`/`reviewing`/`rejected` notes stay admin-only.
 *
 * Never throws: the results page must render even if Supabase env is
 * missing, the DB is unseeded, or the network fails — any error here just
 * means no field notes are shown (empty Map), not a broken page.
 */
export async function getPublicFieldNotes(
  licenseIds: string[]
): Promise<Map<string, FieldNotePublicRow[]>> {
  if (licenseIds.length === 0) return new Map();

  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("field_notes_public")
      .select()
      .eq("status", "promoted")
      .in("license_id", licenseIds)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return groupFieldNotesByLicenseId(data ?? []);
  } catch {
    return new Map();
  }
}
