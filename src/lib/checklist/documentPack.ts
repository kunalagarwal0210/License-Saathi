/**
 * Ticket 12 — pure logic for the "bring these documents" printable pack. No
 * DB, no I/O, so it's unit-tested directly (see `documentPack.test.ts`,
 * mirroring `routeView.test.ts`'s style). `checklist/[id]/page.tsx` wires
 * this to the real route stations for that checklist.
 */

export type DocumentPackEntry = {
  /** The document as written by the first licence that named it. */
  document: string;
  /** Names of every licence on the route that requires this document, in
   * first-seen order. */
  licenses: string[];
};

type StationForDocumentPack = {
  license: {
    name: string;
    requiredDocuments: string[];
  };
};

/**
 * Aggregates every station's `requiredDocuments` into one deduped list so
 * the user can gather each physical document once instead of per-licence.
 * Dedup is case-insensitive (offices phrase the same document differently
 * across forms — "PAN card" vs "PAN Card" shouldn't produce two rows), and
 * the FIRST-seen casing/spelling wins for display, in first-seen order —
 * this keeps the pack stable and scannable rather than alphabetizing away
 * the route's own ordering.
 */
export function buildDocumentPack(stations: StationForDocumentPack[]): DocumentPackEntry[] {
  const entriesByKey = new Map<string, DocumentPackEntry>();

  for (const station of stations) {
    for (const document of station.license.requiredDocuments) {
      const key = document.trim().toLowerCase();
      if (!key) continue; // defensive: an empty/whitespace-only document name isn't a real requirement

      const existing = entriesByKey.get(key);
      if (existing) {
        if (!existing.licenses.includes(station.license.name)) {
          existing.licenses.push(station.license.name);
        }
      } else {
        entriesByKey.set(key, { document, licenses: [station.license.name] });
      }
    }
  }

  return Array.from(entriesByKey.values());
}
