import { describe, expect, it } from "vitest";
import type { FieldNotePublicRow } from "../supabase/types";
import { groupFieldNotesByLicenseId } from "./fieldNotes";

function note(overrides: Partial<FieldNotePublicRow>): FieldNotePublicRow {
  return {
    id: "note-id",
    license_id: "license-id",
    what_happened: "Officer asked for an extra photocopy of the lease.",
    extra_doc: null,
    extra_fee: null,
    status: "promoted",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("groupFieldNotesByLicenseId", () => {
  it("returns an empty Map for empty input", () => {
    expect(groupFieldNotesByLicenseId([])).toEqual(new Map());
  });

  it("groups a single license's notes under its id", () => {
    const rows = [note({ id: "n1", license_id: "gst_eatery" })];
    const grouped = groupFieldNotesByLicenseId(rows);
    expect(grouped.size).toBe(1);
    expect(grouped.get("gst_eatery")).toEqual(rows);
  });

  it("groups notes for multiple licenses into separate entries", () => {
    const rows = [
      note({ id: "n1", license_id: "gst_eatery" }),
      note({ id: "n2", license_id: "fire_noc_eatery" }),
      note({ id: "n3", license_id: "gst_eatery" }),
    ];
    const grouped = groupFieldNotesByLicenseId(rows);
    expect(grouped.size).toBe(2);
    expect(grouped.get("gst_eatery")?.map((r) => r.id)).toEqual(["n1", "n3"]);
    expect(grouped.get("fire_noc_eatery")?.map((r) => r.id)).toEqual(["n2"]);
  });

  it("preserves input order within each license's group", () => {
    const rows = [
      note({ id: "first", license_id: "l1", created_at: "2026-01-01T00:00:00Z" }),
      note({ id: "second", license_id: "l1", created_at: "2026-02-01T00:00:00Z" }),
      note({ id: "third", license_id: "l1", created_at: "2026-03-01T00:00:00Z" }),
    ];
    const grouped = groupFieldNotesByLicenseId(rows);
    expect(grouped.get("l1")?.map((r) => r.id)).toEqual(["first", "second", "third"]);
  });

  it("returns an empty Map entry lookup (undefined) for an id with no notes", () => {
    const grouped = groupFieldNotesByLicenseId([note({ license_id: "l1" })]);
    expect(grouped.get("no_such_license")).toBeUndefined();
  });
});
