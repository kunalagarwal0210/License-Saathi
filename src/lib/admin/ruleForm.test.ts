import { describe, expect, it } from "vitest";
import { parseRuleForm, type RuleFormInput } from "./ruleForm";

function baseInput(overrides: Partial<RuleFormInput> = {}): RuleFormInput {
  return {
    category: "eatery",
    condition: '{"turnover_band":"over_40L"}',
    license_id: "11111111-1111-1111-1111-111111111111",
    sequence: "3",
    ...overrides,
  };
}

describe("parseRuleForm", () => {
  it("parses a complete valid form into a payload", () => {
    const result = parseRuleForm(baseInput());
    expect(result.errors).toEqual({});
    expect(result.payload).toEqual({
      category: "eatery",
      condition: { turnover_band: "over_40L" },
      license_id: "11111111-1111-1111-1111-111111111111",
      sequence: 3,
    });
  });

  it("treats an empty condition as always-applies ({})", () => {
    const result = parseRuleForm(baseInput({ condition: "" }));
    expect(result.errors.condition).toBeUndefined();
    expect(result.payload?.condition).toEqual({});
  });

  it("accepts an explicit {} condition", () => {
    const result = parseRuleForm(baseInput({ condition: "{}" }));
    expect(result.payload?.condition).toEqual({});
  });

  it("rejects invalid JSON", () => {
    const result = parseRuleForm(baseInput({ condition: "{not json" }));
    expect(result.errors.condition).toBeDefined();
    expect(result.payload).toBeUndefined();
  });

  it("rejects a JSON array or primitive as the condition", () => {
    expect(parseRuleForm(baseInput({ condition: "[1,2]" })).errors.condition).toBeDefined();
    expect(parseRuleForm(baseInput({ condition: "5" })).errors.condition).toBeDefined();
    expect(parseRuleForm(baseInput({ condition: "null" })).errors.condition).toBeDefined();
  });

  it("rejects an invalid category", () => {
    const result = parseRuleForm(baseInput({ category: "bogus" }));
    expect(result.errors.category).toBeDefined();
  });

  it("requires a license_id", () => {
    const result = parseRuleForm(baseInput({ license_id: "  " }));
    expect(result.errors.license_id).toBeDefined();
  });

  it("requires an integer sequence", () => {
    expect(parseRuleForm(baseInput({ sequence: "" })).errors.sequence).toBeDefined();
    expect(parseRuleForm(baseInput({ sequence: "abc" })).errors.sequence).toBeDefined();
    expect(parseRuleForm(baseInput({ sequence: "1.5" })).errors.sequence).toBeDefined();
  });

  it("parses sequence 0 and negative sequence correctly", () => {
    expect(parseRuleForm(baseInput({ sequence: "0" })).payload?.sequence).toBe(0);
    expect(parseRuleForm(baseInput({ sequence: "-1" })).payload?.sequence).toBe(-1);
  });
});
