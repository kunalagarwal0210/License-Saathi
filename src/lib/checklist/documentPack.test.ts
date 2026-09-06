import { describe, expect, it } from "vitest";
import { buildDocumentPack } from "./documentPack";

function station(name: string, requiredDocuments: string[]) {
  return { license: { name, requiredDocuments } };
}

describe("buildDocumentPack", () => {
  it("dedupes a document required by multiple licences, listing every licence that needs it", () => {
    const stations = [
      station("Shop & Establishment", ["PAN card", "Address proof"]),
      station("Fire NOC", ["Address proof", "Building plan"]),
    ];
    const pack = buildDocumentPack(stations);

    expect(pack).toEqual([
      { document: "PAN card", licenses: ["Shop & Establishment"] },
      { document: "Address proof", licenses: ["Shop & Establishment", "Fire NOC"] },
      { document: "Building plan", licenses: ["Fire NOC"] },
    ]);
  });

  it("dedupes case-insensitively, keeping the first-seen casing for display", () => {
    const stations = [
      station("GST Registration", ["pan card"]),
      station("Shop & Establishment", ["PAN Card"]),
    ];
    const pack = buildDocumentPack(stations);

    expect(pack).toEqual([
      { document: "pan card", licenses: ["GST Registration", "Shop & Establishment"] },
    ]);
  });

  it("skips empty/whitespace-only document entries", () => {
    const stations = [station("Fire NOC", ["", "   ", "Building plan"])];
    expect(buildDocumentPack(stations)).toEqual([
      { document: "Building plan", licenses: ["Fire NOC"] },
    ]);
  });

  it("returns an empty pack for licences with no required documents", () => {
    const stations = [station("GST Registration", [])];
    expect(buildDocumentPack(stations)).toEqual([]);
  });

  it("returns an empty pack for an empty route", () => {
    expect(buildDocumentPack([])).toEqual([]);
  });

  it("preserves first-seen document order across licences", () => {
    const stations = [
      station("A", ["Doc 2", "Doc 1"]),
      station("B", ["Doc 3", "Doc 1"]),
    ];
    expect(buildDocumentPack(stations).map((entry) => entry.document)).toEqual([
      "Doc 2",
      "Doc 1",
      "Doc 3",
    ]);
  });

  it("does not list the same licence twice against one document even if repeated in its own list", () => {
    const stations = [station("A", ["PAN card", "PAN card"])];
    expect(buildDocumentPack(stations)).toEqual([
      { document: "PAN card", licenses: ["A"] },
    ]);
  });
});
