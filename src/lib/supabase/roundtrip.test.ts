/**
 * Env-guarded round-trip proof for the Supabase schema (ticket 02
 * acceptance criterion: "trivial read/write round-trip").
 *
 * Runs for real ONLY when NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * are set — i.e. only once the human owner has created a (non-production!)
 * Supabase project and applied supabase/migrations/0001_initial_schema.sql.
 * In CI and on a fresh checkout, those env vars are absent, so this test
 * SKIPS and `npm test` stays green. See supabase/README.md for how to run
 * it for real.
 */
import { describe, expect, it } from "vitest";
import { getSupabaseAdmin } from "./admin";

const hasLiveEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!hasLiveEnv) {
  console.log(
    "roundtrip.test.ts: SKIPPED — NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set."
  );
}

describe.skipIf(!hasLiveEnv)("Supabase round-trip (live project required)", () => {
  it("inserts a licenses row, reads it back, then deletes it", async () => {
    const admin = getSupabaseAdmin();

    const throwaway = {
      name: "__roundtrip_test__",
      description: "Throwaway row inserted by roundtrip.test.ts — safe to delete.",
      category: "retail" as const,
      rough_timeline: "n/a",
      portal_deep_link: "https://example.com",
      status: "flagged" as const, // avoid the verified-must-have-source CHECK
    };

    const { data: inserted, error: insertError } = await admin
      .from("licenses")
      .insert(throwaway)
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(inserted).toBeTruthy();
    const id = inserted!.id;

    try {
      const { data: fetched, error: fetchError } = await admin
        .from("licenses")
        .select()
        .eq("id", id)
        .single();

      expect(fetchError).toBeNull();
      expect(fetched?.name).toBe(throwaway.name);
      expect(fetched?.category).toBe(throwaway.category);
    } finally {
      const { error: deleteError } = await admin.from("licenses").delete().eq("id", id);
      expect(deleteError).toBeNull();
    }
  });
});
