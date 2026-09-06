import { describe, expect, it } from "vitest";
import { summarizeChecklistItems } from "./dashboard";

describe("summarizeChecklistItems", () => {
  it("counts an all-pending checklist", () => {
    const summary = summarizeChecklistItems([
      { status: "pending", licenses: { name: "Shop Establishment" } },
      { status: "pending", licenses: { name: "GST Registration" } },
    ]);
    expect(summary).toEqual({
      done: 0,
      total: 2,
      pendingNames: ["Shop Establishment", "GST Registration"],
    });
  });

  it("counts a mix of done and pending items", () => {
    const summary = summarizeChecklistItems([
      { status: "done", licenses: { name: "Shop Establishment" } },
      { status: "pending", licenses: { name: "GST Registration" } },
      { status: "pending", licenses: { name: "Fire NOC" } },
    ]);
    expect(summary).toEqual({
      done: 1,
      total: 3,
      pendingNames: ["GST Registration", "Fire NOC"],
    });
  });

  it("counts an all-done checklist", () => {
    const summary = summarizeChecklistItems([
      { status: "done", licenses: { name: "Shop Establishment" } },
      { status: "done", licenses: { name: "GST Registration" } },
    ]);
    expect(summary).toEqual({ done: 2, total: 2, pendingNames: [] });
  });

  it("returns all-zero counts for an empty checklist", () => {
    expect(summarizeChecklistItems([])).toEqual({
      done: 0,
      total: 0,
      pendingNames: [],
    });
  });

  it("falls back to a placeholder label when the joined licence name is null", () => {
    const summary = summarizeChecklistItems([
      { status: "pending", licenses: null },
    ]);
    expect(summary).toEqual({
      done: 0,
      total: 1,
      pendingNames: ["Untitled licence"],
    });
  });
});
