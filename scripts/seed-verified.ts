/**
 * Idempotent seed script (ticket 04) — loads `verifiedLicenses` +
 * `verifiedRules` (src/lib/data/verified.ts) into the Supabase `licenses`
 * and `rules` tables via the service-role admin client
 * (src/lib/supabase/admin.ts).
 *
 * NOT run in CI and NOT required to execute as part of this ticket — it
 * needs a live Supabase project with `supabase/migrations/0001_initial_schema.sql`
 * applied, and NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY set
 * (see .env.example). It is built to typecheck (`npm run typecheck` covers
 * this file) and to be safe to run repeatedly once those are in place.
 *
 * Usage (once env is set):
 *   npx tsx scripts/seed-verified.ts
 *
 * This script needs a service-role admin client, but it runs standalone
 * under `tsx` (not inside Next's bundler), so it can't import
 * `src/lib/supabase/admin.ts` — that file starts with `import "server-only"`,
 * which throws outside Next's build pipeline. Instead this script builds its
 * own local admin client below, reading the same two env vars, loaded from
 * `.env.local` by the minimal parse at the top of this file (no `dotenv`
 * dependency in package.json, so no new dependency is added for this).
 *
 * Idempotency strategy: the DB's `licenses.id` is a server-generated uuid,
 * not the human-readable string id (`"shop_establishment_eatery"`, etc.)
 * used in verified.ts and by the rules engine. Re-running this script must
 * not create duplicate rows, so each license is upserted by its natural key
 * — (name, category) — rather than by id: an existing row with the same
 * name+category is updated in place (keeping its uuid, and therefore
 * anything that already references it, e.g. `checklist_items`); otherwise a
 * new row is inserted. Rules are simpler: every existing rule row for the
 * license ids in this seed set is deleted and reinserted fresh each run, so
 * `rules` always exactly mirrors `verified.ts`.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { verifiedLicenses, verifiedRules, type VerifiedLicense } from "../src/lib/data/verified";
import type { Database } from "../src/lib/supabase/types";
import type { LicensesInsert, LicensesRow, RulesInsert } from "../src/lib/supabase/types";

// Minimal `.env.local` loader — only sets a var if it isn't already present
// in the environment (matches dotenv's default precedence), so real env vars
// (e.g. in CI) still win.
function loadEnvLocal(): void {
  const path = resolve(__dirname, "../.env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvLocal();

// Script-local admin client — see file-header comment for why this can't
// import `src/lib/supabase/admin.ts` directly.
function getSupabaseAdmin(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error("seed-verified: NEXT_PUBLIC_SUPABASE_URL is not set. See .env.example.");
  }
  if (!serviceRoleKey) {
    throw new Error("seed-verified: SUPABASE_SERVICE_ROLE_KEY is not set. See .env.example.");
  }
  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function toLicensesInsert(license: VerifiedLicense): LicensesInsert {
  return {
    name: license.name,
    description: license.description,
    category: license.category,
    govt_fee_inr: license.govtFeeInr,
    rough_timeline: license.roughTimeline,
    portal_deep_link: license.portalDeepLink,
    required_documents: license.requiredDocuments,
    source_url: license.sourceUrl,
    last_verified_date: license.lastVerifiedDate,
    status: license.status,
  };
}

async function upsertLicense(
  admin: ReturnType<typeof getSupabaseAdmin>,
  license: VerifiedLicense
): Promise<LicensesRow> {
  const { data: existing, error: findError } = await admin
    .from("licenses")
    .select()
    .eq("name", license.name)
    .eq("category", license.category)
    .maybeSingle();

  if (findError) {
    throw new Error(`seed-verified: failed looking up "${license.id}": ${findError.message}`);
  }

  const payload = toLicensesInsert(license);

  if (existing) {
    const { data: updated, error: updateError } = await admin
      .from("licenses")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (updateError || !updated) {
      throw new Error(
        `seed-verified: failed updating "${license.id}": ${updateError?.message ?? "no row returned"}`
      );
    }
    return updated;
  }

  const { data: inserted, error: insertError } = await admin
    .from("licenses")
    .insert(payload)
    .select()
    .single();
  if (insertError || !inserted) {
    throw new Error(
      `seed-verified: failed inserting "${license.id}": ${insertError?.message ?? "no row returned"}`
    );
  }
  return inserted;
}

async function main(): Promise<void> {
  const admin = getSupabaseAdmin();

  // 1. Upsert every license by (name, category), building a string-id ->
  //    real-uuid map for the rules pass below.
  const idToUuid = new Map<string, string>();
  for (const license of verifiedLicenses) {
    const row = await upsertLicense(admin, license);
    idToUuid.set(license.id, row.id);
    console.log(`  license "${license.id}" -> ${row.id} (${license.status})`);
  }

  // 2. Replace every rule row for these licenses with a fresh set derived
  //    from verified.ts, so `rules` always exactly mirrors the dataset.
  const uuids = [...idToUuid.values()];
  const { error: deleteError } = await admin.from("rules").delete().in("license_id", uuids);
  if (deleteError) {
    throw new Error(`seed-verified: failed clearing existing rules: ${deleteError.message}`);
  }

  const ruleRows: RulesInsert[] = verifiedRules.map((rule, index) => {
    const licenseUuid = idToUuid.get(rule.licenseId);
    if (!licenseUuid) {
      throw new Error(`seed-verified: rule references unknown license id "${rule.licenseId}"`);
    }
    return {
      category: rule.category,
      condition: rule.conditions,
      license_id: licenseUuid,
      sequence: index,
    };
  });

  const { error: insertRulesError } = await admin.from("rules").insert(ruleRows);
  if (insertRulesError) {
    throw new Error(`seed-verified: failed inserting rules: ${insertRulesError.message}`);
  }

  console.log(`Seeded ${verifiedLicenses.length} licenses and ${ruleRows.length} rules.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
