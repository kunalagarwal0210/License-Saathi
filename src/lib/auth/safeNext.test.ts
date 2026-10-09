import { describe, expect, it } from "vitest";
import { safeNext } from "./safeNext";

describe("safeNext", () => {
  it("defaults to / for null and empty", () => {
    expect(safeNext(null)).toBe("/");
    expect(safeNext("")).toBe("/");
  });
  it("keeps relative paths", () => {
    expect(safeNext("/dashboard")).toBe("/dashboard");
    expect(safeNext("/admin")).toBe("/admin");
    expect(safeNext("/a//b")).toBe("/a//b");
  });
  it("rejects protocol-relative and backslash tricks", () => {
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("/\\evil")).toBe("/");
  });
  it("rejects absolute and non-slash URLs", () => {
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext("evil.com")).toBe("/");
    expect(safeNext("javascript:alert(1)")).toBe("/");
  });
});
