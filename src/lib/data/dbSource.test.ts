import { describe, expect, it } from "vitest";
import type { LicensesRow, RulesRow } from "../supabase/types";
import { mapDbRoute } from "./dbSource";

function license(overrides: Partial<LicensesRow> = {}): LicensesRow {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Shops & Establishment Registration",
    description: "Mandatory registration.",
    category: "eatery",
    govt_fee_inr: 1000,
    rough_timeline: "7-15 working days",
    portal_deep_link: "https://enagar.gujarat.gov.in/",
    required_documents: ["PAN card"],
    source_url: "https://enagar.gujarat.gov.in/",
    last_verified_date: "2026-09-05",
    status: "verified",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function rule(overrides: Partial<RulesRow> = {}): RulesRow {
  return {
    id: "22222222-2222-2222-2222-222222222222",
    category: "eatery",
    condition: {},
    license_id: "11111111-1111-1111-1111-111111111111",
    sequence: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("mapDbRoute", () => {
  it("keys licensesById by the DB uuid, not any human-readable slug", () => {
    const row = license();
    const { licensesById } = mapDbRoute([row], [rule({ license_id: row.id })]);
    expect(licensesById.has(row.id)).toBe(true);
    expect(licensesById.get(row.id)?.name).toBe(row.name);
  });

  it("derives License.order and VerifiedLicense.order from the matching rule's sequence", () => {
    const row = license({ id: "a", name: "A" });
    const { rulesSource, licensesById } = mapDbRoute([row], [rule({ license_id: "a", sequence: 3 })]);
    expect(rulesSource.licenses[0]).toEqual({ id: "a", name: "A", dependsOn: [], order: 3 });
    expect(licensesById.get("a")?.order).toBe(3);
  });

  it("passes rule conditions through unchanged onto Rule.conditions", () => {
    const row = license({ id: "a" });
    const condition = { turnover_band: ["under_12L", "12L_to_20L"] };
    const { rulesSource } = mapDbRoute([row], [rule({ license_id: "a", condition })]);
    expect(rulesSource.rules[0].conditions).toEqual(condition);
    expect(rulesSource.rules[0].grantsLicenseId).toBe("a");
    expect(rulesSource.rules[0].category).toBe("eatery");
  });

  it("maps status and fee (including free/0 and varies/null) without inventing values", () => {
    const free = license({ id: "a", govt_fee_inr: 0, status: "verified" });
    const varies = license({ id: "b", govt_fee_inr: null, status: "flagged" });
    const { licensesById } = mapDbRoute(
      [free, varies],
      [rule({ license_id: "a" }), rule({ license_id: "b" })]
    );
    expect(licensesById.get("a")).toMatchObject({ govtFeeInr: 0, status: "verified" });
    expect(licensesById.get("b")).toMatchObject({ govtFeeInr: null, status: "flagged" });
  });

  it("maps null sourceUrl / lastVerifiedDate through unchanged (flagged rows)", () => {
    const row = license({ id: "a", source_url: null, last_verified_date: null, status: "flagged" });
    const { licensesById } = mapDbRoute([row], [rule({ license_id: "a" })]);
    expect(licensesById.get("a")).toMatchObject({ sourceUrl: null, lastVerifiedDate: null });
  });

  it("gives a license with no matching rule a large fallback order instead of crashing", () => {
    const row = license({ id: "orphan" });
    const { rulesSource, licensesById } = mapDbRoute([row], []);
    expect(rulesSource.licenses[0].order).toBe(Number.MAX_SAFE_INTEGER);
    expect(licensesById.get("orphan")?.order).toBe(Number.MAX_SAFE_INTEGER);
  });

  it("returns empty rulesSource/licensesById for no rows", () => {
    const { rulesSource, licensesById } = mapDbRoute([], []);
    expect(rulesSource).toEqual({ rules: [], licenses: [] });
    expect(licensesById.size).toBe(0);
  });
});
