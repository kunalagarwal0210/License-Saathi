/**
 * `src/lib/questionnaire.ts` — the pure question-set + branching + URL
 * serialization logic behind the ticket-06 questionnaire.
 *
 * Assertions target the actual acceptance criteria: the right question set
 * per category (only keys the engine branches on), the eatery seating
 * branch, and that a completed answer set round-trips through the
 * results-URL contract and resolves to the expected licences for a few
 * personas.
 */
import { describe, expect, it } from "vitest";
import {
  answersToSearchParams,
  applySkippedDefaults,
  getQuestionSet,
  getResultsHref,
  getVisibleQuestions,
  searchParamsToAnswers,
} from "./questionnaire";
import { resolveLicenses } from "./engine/resolveLicenses";
import { verifiedRulesSource } from "./data/verified";
import type { Answers } from "./engine/types";

function idsOf(licenses: { id: string }[]): string[] {
  return licenses.map((l) => l.id);
}

describe("getQuestionSet — question keys match what the engine actually branches on", () => {
  it("asks eatery: premises_type, seating_band, turnover_band, alcohol", () => {
    expect(getQuestionSet("eatery").map((q) => q.key)).toEqual([
      "premises_type",
      "seating_band",
      "turnover_band",
      "alcohol",
    ]);
  });

  it("asks retail: turnover_band, area_band only", () => {
    expect(getQuestionSet("retail").map((q) => q.key)).toEqual([
      "turnover_band",
      "area_band",
    ]);
  });

  it("asks salon: turnover_band, area_band only", () => {
    expect(getQuestionSet("salon").map((q) => q.key)).toEqual([
      "turnover_band",
      "area_band",
    ]);
  });
});

describe("eatery seating branch", () => {
  it("shows the seating question when premises_type is on_premise", () => {
    const visible = getVisibleQuestions("eatery", { premises_type: "on_premise" });
    expect(visible.map((q) => q.key)).toContain("seating_band");
  });

  it("skips the seating question when premises_type is cloud_kitchen", () => {
    const visible = getVisibleQuestions("eatery", { premises_type: "cloud_kitchen" });
    expect(visible.map((q) => q.key)).not.toContain("seating_band");
  });

  it("hides the seating question before premises_type has an answer (flow always asks it first)", () => {
    const visible = getVisibleQuestions("eatery", {});
    expect(visible.map((q) => q.key)).not.toContain("seating_band");
  });

  it("defaults seating_band to 'none' for a cloud kitchen once finalized", () => {
    const finalized = applySkippedDefaults("eatery", {
      premises_type: "cloud_kitchen",
      turnover_band: "under_12L",
      alcohol: false,
    });
    expect(finalized.seating_band).toBe("none");
  });

  it("never overwrites a real seating answer when on_premise", () => {
    const finalized = applySkippedDefaults("eatery", {
      premises_type: "on_premise",
      seating_band: "50_plus",
      turnover_band: "under_12L",
      alcohol: false,
    });
    expect(finalized.seating_band).toBe("50_plus");
  });
});

describe("answers <-> results-URL round trip", () => {
  it("serializes and parses a full eatery answer set losslessly", () => {
    const answers: Answers = {
      premises_type: "on_premise",
      seating_band: "50_plus",
      turnover_band: "over_40L",
      alcohol: true,
    };
    const params = answersToSearchParams(answers);
    const parsed = searchParamsToAnswers(params);
    expect(parsed).toEqual(answers);
  });

  it("builds a /results/[category] href carrying the answers as query params", () => {
    const href = getResultsHref("eatery", {
      premises_type: "on_premise",
      seating_band: "50_plus",
      turnover_band: "over_40L",
      alcohol: true,
    });
    expect(href).toBe(
      "/results/eatery?premises_type=on_premise&seating_band=50_plus&turnover_band=over_40L&alcohol=true"
    );
  });

  it("ignores unknown/malformed query values rather than throwing", () => {
    const parsed = searchParamsToAnswers({
      turnover_band: "not_a_real_band",
      area_band: "large",
      unrelated_key: "whatever",
    });
    expect(parsed).toEqual({ area_band: "large" });
  });
});

describe("end-to-end personas — completed answers resolve to the expected licences", () => {
  it("café, 50+ seats, over ₹40L, on-premise, serves alcohol", () => {
    const answers = applySkippedDefaults("eatery", {
      premises_type: "on_premise",
      seating_band: "50_plus",
      turnover_band: "over_40L",
      alcohol: true,
    });
    const result = resolveLicenses("eatery", answers, verifiedRulesSource);
    expect(idsOf(result)).toEqual(
      expect.arrayContaining([
        "shop_establishment_eatery",
        "fssai_state",
        "gst_eatery",
        "fire_noc_eatery",
        "trade_license_eatery",
        "prof_tax_eatery",
        "liquor_permit_eatery",
      ])
    );
    expect(idsOf(result)).not.toContain("fssai_basic");
  });

  it("kirana, small floor space, under the GST goods line", () => {
    const answers: Answers = { turnover_band: "12L_to_20L", area_band: "small" };
    const result = resolveLicenses("retail", answers, verifiedRulesSource);
    expect(idsOf(result)).toEqual(
      expect.arrayContaining([
        "shop_establishment_retail",
        "trade_license_retail",
        "prof_tax_retail",
      ])
    );
    expect(idsOf(result)).not.toContain("gst_retail");
    expect(idsOf(result)).not.toContain("fire_noc_retail");
  });

  it("salon, large floor space, over ₹40L", () => {
    const answers: Answers = { turnover_band: "over_40L", area_band: "large" };
    const result = resolveLicenses("salon", answers, verifiedRulesSource);
    expect(idsOf(result)).toEqual(
      expect.arrayContaining([
        "shop_establishment_salon",
        "health_trade_license_salon",
        "prof_tax_salon",
        "gst_salon",
        "fire_noc_salon",
      ])
    );
  });
});
