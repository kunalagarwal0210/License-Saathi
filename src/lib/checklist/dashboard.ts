/**
 * Ticket 11 — pure summary logic for the returning dashboard. No DB, no I/O,
 * so it's unit-tested directly (see `dashboard.test.ts`, mirroring
 * `routeView.test.ts`'s style). `src/app/dashboard/page.tsx` wires this to
 * the real Supabase nested-select result.
 */

/**
 * The shape of one `checklist_items` row as returned by the dashboard's
 * nested select (`checklist_items(status, license_id, licenses(name))`).
 * Supabase's PostgREST embedding returns the joined `licenses` row as a
 * single object for a to-one FK, but can hand back `null` if the licence
 * row is missing (or the embed just didn't resolve) — never assume it's
 * present.
 */
export type ChecklistItemForSummary = {
  status: string;
  licenses: { name: string } | null;
};

export type ChecklistSummary = {
  /** Count of items with status "done". */
  done: number;
  /** Total items on this checklist. */
  total: number;
  /** Licence names for every item not marked "done", in item order. */
  pendingNames: string[];
};

/**
 * Rolls one checklist's items up into the "X of N done" + pending-names
 * figures the dashboard card shows. Anything other than exactly "done"
 * counts as pending (defensive against future statuses, not just
 * "pending") — this mirrors the acceptance criterion ("2 of 5 done") rather
 * than hard-coding today's two-state enum.
 */
export function summarizeChecklistItems(
  items: ChecklistItemForSummary[]
): ChecklistSummary {
  let done = 0;
  const pendingNames: string[] = [];

  for (const item of items) {
    if (item.status === "done") {
      done += 1;
    } else {
      // A null/missing joined licence shouldn't crash the summary or produce
      // "undefined" in the UI — fall back to a neutral placeholder label.
      pendingNames.push(item.licenses?.name ?? "Untitled licence");
    }
  }

  return { done, total: items.length, pendingNames };
}
