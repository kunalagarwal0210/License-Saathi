import "server-only";

/**
 * DB-backed engine data source (Option A) — reads `licenses` + `rules`
 * straight from Supabase instead of the bundled `verified.ts` TS module, so
 * the engine's `RulesSource`/`License` ids are real DB uuids end to end.
 * This is what fixes the results-page bug where the field-notes query got
 * fed `verified.ts` slug ids (e.g. "shop_establishment_eatery") against
 * `field_notes.license_id`, a uuid FK — `.in("license_id", [slugs])` failed
 * with `invalid input syntax for type uuid`, so field notes never rendered.
 *
 * Gated behind `FEATURE_RESULTS_FROM_DB` (src/lib/flags.ts) — this module is
 * only ever called from the results page, server-side, hence `server-only`
 * above (mirrors `src/lib/supabase/admin.ts`, though this reads via the
 * ANON client below, not the admin one: `licenses`/`rules` have public
 * SELECT RLS, same as `fieldNotes.ts`'s read of `field_notes_public`).
 *
 * Throws on DB error rather than swallowing it — the results page decides
 * whether/how to fall back (to `verified.ts`, for demo stability).
 */
import { getSupabaseBrowserClient } from "../supabase/client";
import type { License, Rule, RuleCondition, RulesSource } from "../engine/types";
import type { VerifiedLicense } from "./verified";
import type { LicensesRow, RulesRow } from "../supabase/types";

/**
 * Pure row -> engine-shape mapping (ticket brief task 4) — no DB, no I/O, so
 * it's unit-tested directly (see `dbSource.test.ts`, mirroring
 * `routeView.test.ts` / `fieldNotes.test.ts`'s style). `loadDbRoute` below is
 * just this function wired to a live fetch.
 */
export function mapDbRoute(
  licenseRows: LicensesRow[],
  ruleRows: RulesRow[]
): { rulesSource: RulesSource; licensesById: ReadonlyMap<string, VerifiedLicense> } {
  // Every seeded license is granted by exactly one rule (1:1, locked
  // contract) — build license id -> that rule's `sequence` up front so both
  // `licenses` below and `licensesById` can look order up the same way.
  const sequenceByLicenseId = new Map<string, number>();
  for (const rule of ruleRows) {
    sequenceByLicenseId.set(rule.license_id, rule.sequence);
  }

  // A license with no matching rule has no defined position — fall back to
  // a large order so it sorts last rather than crashing (shouldn't happen
  // for seeded data, but this mapper must not assume the DB is perfect).
  const NO_RULE_ORDER = Number.MAX_SAFE_INTEGER;
  const orderFor = (licenseId: string): number =>
    sequenceByLicenseId.get(licenseId) ?? NO_RULE_ORDER;

  const licenses: License[] = licenseRows.map((row) => ({
    id: row.id,
    name: row.name,
    dependsOn: [],
    order: orderFor(row.id),
  }));

  const rules: Rule[] = ruleRows.map((row) => ({
    category: row.category,
    // `rules.condition` (supabase RuleCondition, a loose JSON shape) and the
    // engine's `RuleCondition` (Partial<Record<AnswerKey, ...>>) are the
    // same object shape by the locked seed contract — cast rather than
    // reshape.
    conditions: row.condition as RuleCondition,
    grantsLicenseId: row.license_id,
  }));

  const licensesById = new Map<string, VerifiedLicense>(
    licenseRows.map((row): [string, VerifiedLicense] => [
      row.id,
      {
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description,
        govtFeeInr: row.govt_fee_inr,
        roughTimeline: row.rough_timeline,
        portalDeepLink: row.portal_deep_link,
        requiredDocuments: row.required_documents,
        sourceUrl: row.source_url,
        lastVerifiedDate: row.last_verified_date,
        status: row.status,
        order: orderFor(row.id),
      },
    ])
  );

  return { rulesSource: { rules, licenses }, licensesById };
}

/**
 * Fetches `licenses` + `rules` via the anon client (public SELECT RLS on
 * both tables — see migration) and maps them to the engine's data-source
 * seam. Throws on any DB error; the results page handles the fallback.
 */
export async function loadDbRoute(): Promise<{
  rulesSource: RulesSource;
  licensesById: ReadonlyMap<string, VerifiedLicense>;
}> {
  const supabase = getSupabaseBrowserClient();

  const [{ data: licenseRows, error: licensesError }, { data: ruleRows, error: rulesError }] =
    await Promise.all([supabase.from("licenses").select(), supabase.from("rules").select()]);

  if (licensesError) throw licensesError;
  if (rulesError) throw rulesError;

  return mapDbRoute(licenseRows ?? [], ruleRows ?? []);
}
