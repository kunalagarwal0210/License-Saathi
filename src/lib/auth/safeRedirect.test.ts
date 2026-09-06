import { describe, expect, it } from "vitest";
import { safeNextPath } from "./safeRedirect";

describe("safeNextPath", () => {
  it("accepts a plain in-app path", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
  });

  it("accepts an in-app path with a query string", () => {
    expect(safeNextPath("/results/eatery?ans=1")).toBe("/results/eatery?ans=1");
  });

  it("falls back for a protocol-relative path (open redirect)", () => {
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
  });

  it("falls back for a backslash open-redirect bypass", () => {
    // "\" normalizes to "/" for http(s), so these would resolve off-site.
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard");
    expect(safeNextPath("/\\\\evil.example")).toBe("/dashboard");
    expect(safeNextPath("/path\\to")).toBe("/dashboard");
  });

  it("falls back for an absolute URL", () => {
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
  });

  it("falls back for a path with no leading slash", () => {
    expect(safeNextPath("dashboard")).toBe("/dashboard");
  });

  it("falls back for a non-string value", () => {
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath(undefined)).toBe("/dashboard");
  });

  it("falls back for an empty string", () => {
    expect(safeNextPath("")).toBe("/dashboard");
  });
});
