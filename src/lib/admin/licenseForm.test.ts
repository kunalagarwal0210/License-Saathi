import { describe, expect, it } from "vitest";
import { parseLicenseForm, type LicenseFormInput } from "./licenseForm";

function baseInput(overrides: Partial<LicenseFormInput> = {}): LicenseFormInput {
  return {
    name: "Shop & Establishment Registration",
    description: "Registers the business premises with the labour department.",
    category: "eatery",
    govt_fee_inr: "1000",
    rough_timeline: "7-10 days",
    portal_deep_link: "https://example.gov.in/apply",
    required_documents: "PAN card\nAddress proof",
    source_url: "https://example.gov.in/rules",
    last_verified_date: "2026-01-01",
    status: "verified",
    ...overrides,
  };
}

describe("parseLicenseForm", () => {
  it("parses a complete valid verified form into a payload", () => {
    const result = parseLicenseForm(baseInput());
    expect(result.errors).toEqual({});
    expect(result.payload).toEqual({
      name: "Shop & Establishment Registration",
      description: "Registers the business premises with the labour department.",
      category: "eatery",
      govt_fee_inr: 1000,
      rough_timeline: "7-10 days",
      portal_deep_link: "https://example.gov.in/apply",
      required_documents: ["PAN card", "Address proof"],
      source_url: "https://example.gov.in/rules",
      last_verified_date: "2026-01-01",
      status: "verified",
    });
  });

  it("requires name, description, timeline, and portal link", () => {
    const result = parseLicenseForm(
      baseInput({ name: "  ", description: " ", rough_timeline: "", portal_deep_link: "" })
    );
    expect(result.payload).toBeUndefined();
    expect(result.errors.name).toBeDefined();
    expect(result.errors.description).toBeDefined();
    expect(result.errors.rough_timeline).toBeDefined();
    expect(result.errors.portal_deep_link).toBeDefined();
  });

  it("rejects an invalid category", () => {
    const result = parseLicenseForm(baseInput({ category: "bogus" }));
    expect(result.errors.category).toBeDefined();
  });

  it("rejects an invalid status", () => {
    const result = parseLicenseForm(baseInput({ status: "bogus" }));
    expect(result.errors.status).toBeDefined();
  });

  // -- fee parsing --
  it("parses an empty fee as null", () => {
    const result = parseLicenseForm(baseInput({ govt_fee_inr: "" }));
    expect(result.errors.govt_fee_inr).toBeUndefined();
    expect(result.payload?.govt_fee_inr).toBeNull();
  });

  it("parses a numeric fee as an integer", () => {
    const result = parseLicenseForm(baseInput({ govt_fee_inr: "0" }));
    expect(result.payload?.govt_fee_inr).toBe(0);
  });

  it("rejects a non-numeric fee", () => {
    const result = parseLicenseForm(baseInput({ govt_fee_inr: "abc" }));
    expect(result.errors.govt_fee_inr).toBeDefined();
    expect(result.payload).toBeUndefined();
  });

  // -- required_documents splitting --
  it("splits required_documents on newlines and drops blank lines", () => {
    const result = parseLicenseForm(
      baseInput({ required_documents: "PAN card\n\n  Address proof  \n" })
    );
    expect(result.payload?.required_documents).toEqual(["PAN card", "Address proof"]);
  });

  it("produces an empty array for blank required_documents", () => {
    const result = parseLicenseForm(baseInput({ required_documents: "   " }));
    expect(result.payload?.required_documents).toEqual([]);
  });

  // -- the verify-stamp rule (mirrors chk_verified_has_source) --
  it("rejects status=verified with no source_url", () => {
    const result = parseLicenseForm(baseInput({ source_url: "" }));
    expect(result.errors.source_url).toBeDefined();
    expect(result.payload).toBeUndefined();
  });

  it("rejects status=verified with a blank/whitespace source_url", () => {
    const result = parseLicenseForm(baseInput({ source_url: "   " }));
    expect(result.errors.source_url).toBeDefined();
  });

  it("rejects status=verified with no last_verified_date", () => {
    const result = parseLicenseForm(baseInput({ last_verified_date: "" }));
    expect(result.errors.last_verified_date).toBeDefined();
    expect(result.payload).toBeUndefined();
  });

  it("allows status=flagged with no source_url or last_verified_date", () => {
    const result = parseLicenseForm(
      baseInput({ status: "flagged", source_url: "", last_verified_date: "" })
    );
    expect(result.errors).toEqual({});
    expect(result.payload?.source_url).toBeNull();
    expect(result.payload?.last_verified_date).toBeNull();
    expect(result.payload?.status).toBe("flagged");
  });
});
