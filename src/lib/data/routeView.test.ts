import { describe, expect, it } from "vitest";
import { resolveLicenses } from "../engine/resolveLicenses";
import type { Answers } from "../engine/types";
import type { VerifiedLicense } from "./verified";
import { verifiedLicensesById, verifiedRulesSource } from "./verified";
import type { RouteStation } from "./routeView";
import {
  buildRouteStations,
  formatFee,
  formatVerifiedDate,
  summarizeRoute,
} from "./routeView";

describe("buildRouteStations", () => {
  it("maps engine order to full VerifiedLicense detail, numbering stops from 1", () => {
    const answers: Answers = {
      turnover_band: "under_12L",
      seating_band: "none",
      premises_type: "cloud_kitchen",
      alcohol: false,
    };
    const ordered = resolveLicenses("eatery", answers, verifiedRulesSource);
    const stations = buildRouteStations(ordered, verifiedLicensesById);

    expect(stations.length).toBe(ordered.length);
    stations.forEach((station, index) => {
      expect(station.stopNumber).toBe(index + 1);
      expect(station.license.id).toBe(ordered[index].id);
    });
  });

  it("preserves the engine's ordering (does not re-sort by anything else)", () => {
    const answers: Answers = { turnover_band: "under_12L", area_band: "small", premises_type: "rented" };
    const ordered = resolveLicenses("retail", answers, verifiedRulesSource);
    const stations = buildRouteStations(ordered, verifiedLicensesById);

    expect(stations.map((s) => s.license.id)).toEqual(ordered.map((l) => l.id));
  });

  it("skips an id with no matching detail row instead of crashing", () => {
    const ordered = [{ id: "not_a_real_license", name: "Ghost", dependsOn: [], order: 1 }];
    const stations = buildRouteStations(ordered, verifiedLicensesById);
    expect(stations).toEqual([]);
  });

  it("returns an empty list for an empty engine result", () => {
    expect(buildRouteStations([], verifiedLicensesById)).toEqual([]);
  });
});

describe("summarizeRoute", () => {
  const station = (id: string, status: "verified" | "flagged"): RouteStation => ({
    stopNumber: 1,
    license: { ...(verifiedLicensesById.get(id) as VerifiedLicense), status },
  });

  it("counts total, verified, and flagged stops", () => {
    const stations = [
      station("shop_establishment_eatery", "verified"),
      station("fire_noc_eatery", "flagged"),
      station("gst_eatery", "verified"),
    ];
    expect(summarizeRoute(stations)).toEqual({ total: 3, verified: 2, flagged: 1 });
  });

  it("returns all-zero counts for an empty route", () => {
    expect(summarizeRoute([])).toEqual({ total: 0, verified: 0, flagged: 0 });
  });
});

describe("formatFee", () => {
  it("renders null as Varies (never invents a number)", () => {
    expect(formatFee(null)).toBe("Varies");
  });

  it("renders 0 as Free", () => {
    expect(formatFee(0)).toBe("Free");
  });

  it("renders a positive integer with the rupee sign and Indian digit grouping", () => {
    expect(formatFee(100)).toBe("₹100");
    expect(formatFee(12345)).toBe("₹12,345");
  });
});

describe("formatVerifiedDate", () => {
  it("formats an ISO date as a short human-readable date", () => {
    expect(formatVerifiedDate("2026-09-05")).toBe("5 Sep 2026");
  });

  it("is stable across a year boundary", () => {
    expect(formatVerifiedDate("2026-01-01")).toBe("1 Jan 2026");
    expect(formatVerifiedDate("2026-12-31")).toBe("31 Dec 2026");
  });
});
