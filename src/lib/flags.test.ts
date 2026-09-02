import { afterEach, describe, expect, it } from "vitest";
import { isEnabled, type FeatureFlag } from "./flags";

const KEY: FeatureFlag = "FEATURE_ADMIN";

describe("isEnabled (ship dark)", () => {
  afterEach(() => {
    delete process.env[KEY];
  });

  it("is OFF when the env var is unset", () => {
    delete process.env[KEY];
    expect(isEnabled(KEY)).toBe(false);
  });

  it("is ON only for the exact string \"true\"", () => {
    process.env[KEY] = "true";
    expect(isEnabled(KEY)).toBe(true);
  });

  it("is OFF for any other value", () => {
    for (const value of ["1", "TRUE", "True", "yes", "", "false", "0"]) {
      process.env[KEY] = value;
      expect(isEnabled(KEY)).toBe(false);
    }
  });
});
