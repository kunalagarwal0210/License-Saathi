import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  CATEGORY_DEFINITIONS,
  getQuestionnaireHref,
  isCategory,
} from "./categories";

describe("categories", () => {
  it("defines exactly the three routing-contract categories", () => {
    expect(CATEGORIES).toEqual(["eatery", "retail", "salon"]);
  });

  it("has a definition for every category", () => {
    expect(CATEGORY_DEFINITIONS.map((c) => c.id)).toEqual([...CATEGORIES]);
  });

  it("recognises valid categories", () => {
    for (const category of CATEGORIES) {
      expect(isCategory(category)).toBe(true);
    }
  });

  it("rejects unknown categories", () => {
    expect(isCategory("bakery")).toBe(false);
    expect(isCategory("")).toBe(false);
  });

  it("builds the questionnaire href from a category", () => {
    expect(getQuestionnaireHref("eatery")).toBe("/questionnaire/eatery");
    expect(getQuestionnaireHref("retail")).toBe("/questionnaire/retail");
    expect(getQuestionnaireHref("salon")).toBe("/questionnaire/salon");
  });
});
