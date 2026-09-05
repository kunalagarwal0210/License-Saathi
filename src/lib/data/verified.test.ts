/**
 * `resolveLicenses` against the REAL verified dataset (ticket 04).
 *
 * Complements `src/lib/engine/resolveLicenses.test.ts` (which asserts the
 * engine's external behaviour against the illustrative `fixtures.ts`). These
 * tests instead exercise real Ahmedabad personas against `verifiedRulesSource`
 * — proving the actual data users will see behaves as expected, not just
 * that the engine's dependency/matching machinery works in the abstract.
 */
import { describe, expect, it } from "vitest";
import { resolveLicenses } from "../engine/resolveLicenses";
import type { Answers } from "../engine/types";
import { verifiedLicenses, verifiedRulesSource } from "./verified";

function idsOf(licenses: { id: string }[]): string[] {
  return licenses.map((l) => l.id);
}

describe("verified dataset — internal consistency", () => {
  it("has no duplicate license ids", () => {
    const ids = verifiedLicenses.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every rule's licenseId resolves to a license in the dataset", () => {
    const licenseIds = new Set(verifiedLicenses.map((l) => l.id));
    for (const rule of verifiedRulesSource.rules) {
      expect(licenseIds.has(rule.grantsLicenseId)).toBe(true);
    }
  });

  it("every verified-status license carries a source_url and last_verified_date", () => {
    for (const license of verifiedLicenses) {
      if (license.status === "verified") {
        expect(license.sourceUrl, `${license.id} is verified but has no sourceUrl`).toBeTruthy();
        expect(
          license.lastVerifiedDate,
          `${license.id} is verified but has no lastVerifiedDate`
        ).toBeTruthy();
      }
    }
  });

  it("every license (verified or flagged) carries a non-empty portalDeepLink", () => {
    for (const license of verifiedLicenses) {
      expect(license.portalDeepLink.length, `${license.id} has no portalDeepLink`).toBeGreaterThan(0);
    }
  });
});

describe("verified dataset — 60-seat on-premise eatery over ₹40L", () => {
  const answers: Answers = {
    turnover_band: "over_40L",
    seating_band: "50_plus",
    premises_type: "on_premise",
    alcohol: false,
  };

  it("includes Fire NOC, GST registration, and FSSAI State Licence (not Basic)", () => {
    const ids = idsOf(resolveLicenses("eatery", answers, verifiedRulesSource));

    expect(ids).toContain("fire_noc_eatery");
    expect(ids).toContain("gst_eatery");
    expect(ids).toContain("fssai_state");
    expect(ids).not.toContain("fssai_basic");
  });

  it("includes Shops & Establishment registration and the on-premise trade licence", () => {
    const ids = idsOf(resolveLicenses("eatery", answers, verifiedRulesSource));

    expect(ids).toContain("shop_establishment_eatery");
    expect(ids).toContain("trade_license_eatery");
  });

  it("omits the liquor-permit row when alcohol is false", () => {
    const ids = idsOf(resolveLicenses("eatery", answers, verifiedRulesSource));
    expect(ids).not.toContain("liquor_permit_eatery");
  });
});

describe("verified dataset — same eatery persona but alcohol:true", () => {
  it("surfaces the Gujarat-prohibition flagged row instead of a generic liquor licence", () => {
    const answers: Answers = {
      turnover_band: "over_40L",
      seating_band: "50_plus",
      premises_type: "on_premise",
      alcohol: true,
    };
    const result = resolveLicenses("eatery", answers, verifiedRulesSource);
    const ids = idsOf(result);

    expect(ids).toContain("liquor_permit_eatery");
    const liquorRow = verifiedLicenses.find((l) => l.id === "liquor_permit_eatery");
    expect(liquorRow?.status).toBe("flagged");
    expect(liquorRow?.description).toMatch(/prohibition/i);
  });
});

describe("verified dataset — small cloud-kitchen eatery under ₹12L", () => {
  it("returns a minimal set: Shops & Establishment, FSSAI Basic, professional tax — no Fire NOC or on-premise trade licence", () => {
    const answers: Answers = {
      turnover_band: "under_12L",
      seating_band: "none",
      premises_type: "cloud_kitchen",
      alcohol: false,
    };
    const ids = idsOf(resolveLicenses("eatery", answers, verifiedRulesSource));

    expect(ids).toEqual(
      expect.arrayContaining(["shop_establishment_eatery", "fssai_basic", "prof_tax_eatery"])
    );
    expect(ids).not.toContain("fire_noc_eatery");
    expect(ids).not.toContain("trade_license_eatery");
    expect(ids).not.toContain("gst_eatery");
    expect(ids).not.toContain("fssai_state");
  });
});

describe("verified dataset — small kirana under the goods GST line", () => {
  it("returns the minimal retail set with no GST registration and no Fire NOC", () => {
    const answers: Answers = {
      turnover_band: "20L_to_40L",
      area_band: "small",
      premises_type: "rented",
    };
    const ids = idsOf(resolveLicenses("retail", answers, verifiedRulesSource));

    expect(ids).toEqual(
      expect.arrayContaining(["shop_establishment_retail", "trade_license_retail", "prof_tax_retail"])
    );
    expect(ids).not.toContain("gst_retail");
    expect(ids).not.toContain("fire_noc_retail");
  });
});

describe("verified dataset — large kirana over ₹40L", () => {
  it("adds GST registration and Fire NOC", () => {
    const answers: Answers = {
      turnover_band: "over_40L",
      area_band: "large",
      premises_type: "owned",
    };
    const ids = idsOf(resolveLicenses("retail", answers, verifiedRulesSource));

    expect(ids).toContain("gst_retail");
    expect(ids).toContain("fire_noc_retail");
  });
});

describe("verified dataset — salon happy path", () => {
  it("small salon under the services GST line gets the minimal set", () => {
    const answers: Answers = {
      turnover_band: "under_12L",
      area_band: "small",
      premises_type: "rented",
    };
    const ids = idsOf(resolveLicenses("salon", answers, verifiedRulesSource));

    expect(ids).toEqual(
      expect.arrayContaining([
        "shop_establishment_salon",
        "health_trade_license_salon",
        "prof_tax_salon",
      ])
    );
    expect(ids).not.toContain("gst_salon");
    expect(ids).not.toContain("fire_noc_salon");
  });

  it("large salon over the services GST line gets GST registration and Fire NOC", () => {
    const answers: Answers = {
      turnover_band: "20L_to_40L",
      area_band: "large",
      premises_type: "owned",
    };
    const ids = idsOf(resolveLicenses("salon", answers, verifiedRulesSource));

    expect(ids).toContain("gst_salon");
    expect(ids).toContain("fire_noc_salon");
  });
});

describe("verified dataset — category isolation", () => {
  it("never returns another category's license ids", () => {
    const eateryIds = idsOf(
      resolveLicenses(
        "eatery",
        { turnover_band: "over_40L", seating_band: "50_plus", premises_type: "on_premise", alcohol: true },
        verifiedRulesSource
      )
    );
    expect(eateryIds).not.toContain("gst_retail");
    expect(eateryIds).not.toContain("gst_salon");
    expect(eateryIds).not.toContain("health_trade_license_salon");
  });
});
