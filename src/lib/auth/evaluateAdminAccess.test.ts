import { describe, expect, it } from "vitest";
import { evaluateAdminAccess } from "./evaluateAdminAccess";

describe("evaluateAdminAccess", () => {
  const user = { id: "u1" };
  const cases: Array<[string, { id: string } | null, { is_admin: boolean } | null, string]> = [
    ["no user, no profile", null, null, "anonymous"],
    ["no user, admin profile (ignored)", null, { is_admin: true }, "anonymous"],
    ["user, null profile", user, null, "forbidden"],
    ["user, is_admin false", user, { is_admin: false }, "forbidden"],
    ["user, is_admin true", user, { is_admin: true }, "ok"],
  ];
  it.each(cases)("%s -> %s", (_n, u, p, expected) => {
    expect(evaluateAdminAccess(u, p)).toBe(expected);
  });
});
