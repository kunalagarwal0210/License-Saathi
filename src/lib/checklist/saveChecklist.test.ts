import { describe, expect, it } from "vitest";
import { buildChecklistItemRows, isValidEmail, isValidOtp } from "./saveChecklist";

describe("buildChecklistItemRows", () => {
  it("maps each ordered licence id to a pending checklist_items row, preserving order", () => {
    const rows = buildChecklistItemRows("checklist-1", ["lic-a", "lic-b", "lic-c"]);
    expect(rows).toEqual([
      { checklist_id: "checklist-1", license_id: "lic-a", status: "pending" },
      { checklist_id: "checklist-1", license_id: "lic-b", status: "pending" },
      { checklist_id: "checklist-1", license_id: "lic-c", status: "pending" },
    ]);
  });

  it("returns an empty array for an empty licence list", () => {
    expect(buildChecklistItemRows("checklist-1", [])).toEqual([]);
  });

  it("does not dedupe or reorder its input", () => {
    const rows = buildChecklistItemRows("checklist-2", ["lic-b", "lic-a", "lic-b"]);
    expect(rows.map((row) => row.license_id)).toEqual(["lic-b", "lic-a", "lic-b"]);
  });
});

describe("isValidEmail", () => {
  it("accepts a plausible email", () => {
    expect(isValidEmail("owner@example.com")).toBe(true);
  });

  it("rejects missing @ or domain", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing-domain@")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  it("trims surrounding whitespace before checking", () => {
    expect(isValidEmail("  owner@example.com  ")).toBe(true);
  });
});

describe("isValidOtp", () => {
  it("accepts a 6-digit code", () => {
    expect(isValidOtp("123456")).toBe(true);
  });

  it("rejects anything not exactly 6 digits", () => {
    expect(isValidOtp("12345")).toBe(false);
    expect(isValidOtp("1234567")).toBe(false);
    expect(isValidOtp("12a456")).toBe(false);
    expect(isValidOtp("")).toBe(false);
  });
});
