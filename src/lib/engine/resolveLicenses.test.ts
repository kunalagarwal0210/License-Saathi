/**
 * `resolveLicenses` — the deterministic rules engine (ticket 03).
 *
 * These tests assert EXTERNAL behaviour only (which licence ids come back,
 * and in what order) against the illustrative fixtures in `fixtures.ts`.
 * They are the reference pattern for future engine/logic tests: one
 * `describe` per acceptance-criterion, plain-language `it` names, assert on
 * ids not on incidental fixture structure.
 */
import { describe, expect, it } from "vitest";
import { resolveLicenses } from "./resolveLicenses";
import { cyclicRulesSource, fixtureRulesSource } from "./fixtures";
import type { Answers } from "./types";

function idsOf(licenses: { id: string }[]): string[] {
  return licenses.map((l) => l.id);
}

describe("resolveLicenses — eatery seating band vs Fire NOC", () => {
  const base: Answers = {
    turnover_band: "under_12L",
    premises_type: "on_premise",
    alcohol: false,
  };

  it("includes Fire NOC when seating is 50_plus", () => {
    const result = resolveLicenses("eatery", { ...base, seating_band: "50_plus" }, fixtureRulesSource);
    expect(idsOf(result)).toContain("fire_noc");
  });

  it("omits Fire NOC when seating is under_50", () => {
    const result = resolveLicenses("eatery", { ...base, seating_band: "under_50" }, fixtureRulesSource);
    expect(idsOf(result)).not.toContain("fire_noc");
  });
});

describe("resolveLicenses — turnover band vs GST line", () => {
  const base: Answers = {
    seating_band: "none",
    premises_type: "on_premise",
    alcohol: false,
  };

  it("omits GST registration below the services GST line (12L_to_20L)", () => {
    const result = resolveLicenses("eatery", { ...base, turnover_band: "12L_to_20L" }, fixtureRulesSource);
    expect(idsOf(result)).not.toContain("gst_registration");
  });

  it("includes GST registration at/above the services GST line (20L_to_40L)", () => {
    const result = resolveLicenses("eatery", { ...base, turnover_band: "20L_to_40L" }, fixtureRulesSource);
    expect(idsOf(result)).toContain("gst_registration");
  });
});

describe("resolveLicenses — cloud kitchen vs on-premise eatery divergence", () => {
  const base: Answers = {
    turnover_band: "under_12L",
    seating_band: "none",
    alcohol: false,
  };

  it("on_premise requires an Eating House Licence", () => {
    const result = resolveLicenses("eatery", { ...base, premises_type: "on_premise" }, fixtureRulesSource);
    expect(idsOf(result)).toContain("eating_house_license");
  });

  it("cloud_kitchen does not require an Eating House Licence", () => {
    const result = resolveLicenses("eatery", { ...base, premises_type: "cloud_kitchen" }, fixtureRulesSource);
    expect(idsOf(result)).not.toContain("eating_house_license");
  });

  it("produces different licence sets for cloud_kitchen vs on_premise", () => {
    const onPremise = idsOf(
      resolveLicenses("eatery", { ...base, premises_type: "on_premise" }, fixtureRulesSource)
    );
    const cloudKitchen = idsOf(
      resolveLicenses("eatery", { ...base, premises_type: "cloud_kitchen" }, fixtureRulesSource)
    );
    expect(onPremise).not.toEqual(cloudKitchen);
  });
});

describe("resolveLicenses — dependency ordering", () => {
  it("lists a prerequisite before the licence that depends on it", () => {
    const result = resolveLicenses(
      "eatery",
      {
        turnover_band: "under_12L",
        seating_band: "50_plus",
        premises_type: "on_premise",
        alcohol: false,
      },
      fixtureRulesSource
    );
    const ids = idsOf(result);
    const shopIndex = ids.indexOf("shop_establishment");
    const fireNocIndex = ids.indexOf("fire_noc");

    expect(shopIndex).toBeGreaterThanOrEqual(0);
    expect(fireNocIndex).toBeGreaterThan(shopIndex);
  });
});

describe("resolveLicenses — retail happy path", () => {
  it("returns the expected licence set, prerequisites first, for a small retail shop under the GST line", () => {
    const result = resolveLicenses(
      "retail",
      { turnover_band: "20L_to_40L", area_band: "small", premises_type: "rented" },
      fixtureRulesSource
    );
    const ids = idsOf(result);

    expect(ids).toEqual(["shop_establishment", "retail_trade_license"]);
  });

  it("adds GST registration and Fire NOC for a large, high-turnover retail shop", () => {
    const result = resolveLicenses(
      "retail",
      { turnover_band: "over_40L", area_band: "large", premises_type: "owned" },
      fixtureRulesSource
    );
    const ids = idsOf(result);

    expect(ids).toContain("gst_registration");
    expect(ids).toContain("fire_noc");
    expect(ids.indexOf("shop_establishment")).toBeLessThan(ids.indexOf("fire_noc"));
  });
});

describe("resolveLicenses — salon happy path", () => {
  it("returns the expected licence set for a small salon under the GST line", () => {
    const result = resolveLicenses(
      "salon",
      { turnover_band: "under_12L", area_band: "small", premises_type: "rented" },
      fixtureRulesSource
    );
    const ids = idsOf(result);

    expect(ids).toEqual(["shop_establishment", "salon_trade_license"]);
  });

  it("adds GST registration and Fire NOC for a large, high-turnover salon", () => {
    const result = resolveLicenses(
      "salon",
      { turnover_band: "20L_to_40L", area_band: "large", premises_type: "owned" },
      fixtureRulesSource
    );
    const ids = idsOf(result);

    expect(ids).toContain("gst_registration");
    expect(ids).toContain("fire_noc");
    expect(ids.indexOf("shop_establishment")).toBeLessThan(ids.indexOf("fire_noc"));
  });
});

describe("resolveLicenses — dependency cycle detection", () => {
  it("throws when the licence dependency graph has a cycle", () => {
    expect(() => resolveLicenses("eatery", {}, cyclicRulesSource)).toThrow();
  });
});
