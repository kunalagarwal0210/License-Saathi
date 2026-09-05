/**
 * Ticket 07 — pure view-model logic for the results/route screen.
 *
 * Bridges the engine's ordered, minimal `OrderedLicense[]` (id/name/order
 * only) to the rich `VerifiedLicense` detail the route rail / station cards
 * render (fee, documents, verification status, portal link, …). Kept free
 * of React/Next imports so the id→detail mapping and formatting helpers can
 * be unit-tested directly, matching the pattern in `questionnaire.ts`.
 */
import type { OrderedLicense } from "../engine/types";
import type { VerifiedLicense } from "./verified";

export type RouteStation = {
  /** 1-based stop number in route order — drives the rail's numbered nodes. */
  stopNumber: number;
  license: VerifiedLicense;
};

/**
 * Maps the engine's ordered result to full licence detail via the id
 * lookup, preserving engine order. An id with no matching detail row is
 * dropped rather than rendered half-empty — this should never happen given
 * `verifiedRulesSource` is derived from `verifiedLicenses` itself, but a
 * future/alternate `RulesSource` (e.g. Supabase-backed) could return an id
 * this lookup doesn't know about, and silently skipping is safer than
 * crashing the results page over one bad row.
 */
export function buildRouteStations(
  orderedLicenses: OrderedLicense[],
  licensesById: ReadonlyMap<string, VerifiedLicense>
): RouteStation[] {
  const stations: RouteStation[] = [];
  let stopNumber = 0;
  for (const ordered of orderedLicenses) {
    const detail = licensesById.get(ordered.id);
    if (!detail) continue;
    stopNumber += 1;
    stations.push({ stopNumber, license: detail });
  }
  return stations;
}

export type RouteSummary = {
  /** Total stops on the route. */
  total: number;
  /** Stops backed by an official source (green seal). */
  verified: number;
  /** Spine stops we could not source-confirm (honest flag, not the count of
   * community field-notes — those are a separate tier, ticket 08). */
  flagged: number;
};

/**
 * Rolls the stations up into the counts the header shows. We deliberately do
 * NOT compute an "X of N cleared" figure here: "cleared" is per-user checklist
 * progress (tickets 10–12, needs login) and does not exist at this screen, so
 * inventing it would violate the "no backend-unsupported states" rule.
 */
export function summarizeRoute(stations: RouteStation[]): RouteSummary {
  let verified = 0;
  for (const station of stations) {
    if (station.license.status === "verified") verified += 1;
  }
  return {
    total: stations.length,
    verified,
    flagged: stations.length - verified,
  };
}

/**
 * Formats `govtFeeInr` for display. `null` means the fee genuinely varies
 * or wasn't confirmed as a single figure (see `VerifiedLicense.govtFeeInr`
 * doc comment) — never invent a number, show "Varies" instead. `0` is a
 * real, confirmed "no fee" (e.g. GST registration), shown as "Free".
 */
export function formatFee(govtFeeInr: number | null): string {
  if (govtFeeInr === null) return "Varies";
  if (govtFeeInr === 0) return "Free";
  return `₹${govtFeeInr.toLocaleString("en-IN")}`;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/**
 * Formats an ISO "YYYY-MM-DD" `lastVerifiedDate` into a short human-readable
 * date (e.g. "5 Sep 2026") for the `Verified · <date>` seal. Parses the ISO
 * parts directly rather than going through `Date`/`Intl`: it stays timezone
 * safe (no off-by-one-day shift) and, more importantly, deterministic across
 * Node/ICU versions — current ICU CLDR renders "Sept" for September under
 * `toLocaleDateString`, which we don't want.
 */
export function formatVerifiedDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}
