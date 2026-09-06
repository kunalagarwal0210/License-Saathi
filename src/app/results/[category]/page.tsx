import Link from "next/link";
import { notFound } from "next/navigation";
import { isCategory, CATEGORY_DEFINITIONS } from "@/lib/categories";
import { searchParamsToAnswers } from "@/lib/questionnaire";
import { resolveLicenses } from "@/lib/engine/resolveLicenses";
import { verifiedRulesSource, verifiedLicensesById } from "@/lib/data/verified";
import { loadDbRoute } from "@/lib/data/dbSource";
import { buildRouteStations, summarizeRoute } from "@/lib/data/routeView";
import { getPublicFieldNotes } from "@/lib/data/fieldNotes";
import { isEnabled } from "@/lib/flags";
import type { RulesSource } from "@/lib/engine/types";
import type { VerifiedLicense } from "@/lib/data/verified";
import type { FieldNotePublicRow } from "@/lib/supabase/types";
import { StationCard } from "@/components/StationCard";
import { FieldNotes } from "@/components/FieldNotes";
import { ShareRoute } from "@/components/ShareRoute";
import { SaveChecklist } from "@/components/SaveChecklist";

type ResultsPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Ticket 07 — Results / Route screen. The Must-ship payoff: the ordered set of
// licences for this business, drawn as a vertical route rail of numbered stops,
// each a station card with plain-language detail, documents, fee, timeline,
// verified seal + source, and a deep link to the official portal.
//
// Reads the answers ticket 06 carries in the URL (`/results/[category]?<answers>`
// — the 06 -> 07 routing contract; no login), runs them through the real
// `resolveLicenses` engine against the verified data source, then maps each
// ordered result to its full detail row for rendering.
export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { category } = await params;
  const query = await searchParams;

  if (!isCategory(category)) {
    notFound();
  }

  const answers = searchParamsToAnswers(query);

  // Option A (FEATURE_RESULTS_FROM_DB): read licences/rules from Supabase —
  // real uuid ids end to end — instead of the bundled verified.ts slugs.
  // This is what field notes need (field_notes.license_id is a uuid FK); it
  // falls back to verified.ts on ANY DB error so the results page never
  // breaks for a demo. When the flag is off, behaviour is unchanged.
  let rulesSource: RulesSource = verifiedRulesSource;
  let licensesById: ReadonlyMap<string, VerifiedLicense> = verifiedLicensesById;
  if (isEnabled("FEATURE_RESULTS_FROM_DB")) {
    try {
      const dbRoute = await loadDbRoute();
      rulesSource = dbRoute.rulesSource;
      licensesById = dbRoute.licensesById;
    } catch {
      // fall back to the verified.ts defaults already assigned above
    }
  }

  const ordered = resolveLicenses(category, answers, rulesSource);
  const stations = buildRouteStations(ordered, licensesById);
  const summary = summarizeRoute(stations);

  // Ticket 08 — community field-notes tier, gated behind FEATURE_FIELD_NOTES.
  // When the flag is off, no extra fetch happens and the page renders
  // exactly as it did before this ticket.
  const fieldNotesEnabled = isEnabled("FEATURE_FIELD_NOTES");
  const fieldNotesByLicenseId = fieldNotesEnabled
    ? await getPublicFieldNotes(stations.map((station) => station.license.id))
    : new Map<string, FieldNotePublicRow[]>();

  const categoryLabel =
    CATEGORY_DEFINITIONS.find((definition) => definition.id === category)?.label ?? category;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-12">
      <div className="flex w-full max-w-[600px] flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <span className="font-signage text-xs font-semibold uppercase tracking-[0.18em] text-route">
            Setting up
          </span>
          <h1 className="font-signage text-[26px] font-bold leading-tight tracking-tight text-ink">
            {categoryLabel}, Ahmedabad
          </h1>
          <p className="font-signage text-sm font-medium tabular-nums text-ink-secondary">
            <span className="text-ink">{summary.total}</span>{" "}
            {summary.total === 1 ? "stop" : "stops"} on your route
            {summary.flagged > 0 && (
              <>
                <Separator />
                <span className="text-verified">{summary.verified} verified</span>
                <Separator />
                <span className="text-flag">{summary.flagged} to confirm</span>
              </>
            )}
          </p>
        </header>

        {/* Route rail — vertical line threading numbered stop nodes, each with
            its station card. The rail (line + numbered nodes) is the signature
            visual and stays recognizable with all card text removed. */}
        {stations.length === 0 ? (
          <EmptyRoute />
        ) : (
          <ol className="flex flex-col">
            {stations.map((station, index) => {
              const isLast = index === stations.length - 1;
              const isVerified = station.license.status === "verified";
              return (
                <li key={station.license.id} className="flex gap-4">
                  {/* Rail column: numbered node + connector to the next stop */}
                  <div
                    aria-hidden="true"
                    className="flex w-8 shrink-0 flex-col items-center"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-signage text-sm font-bold tabular-nums ${
                        isVerified
                          ? "bg-route text-on-route"
                          : "border-2 border-flag bg-surface text-flag"
                      }`}
                    >
                      {station.stopNumber}
                    </span>
                    {!isLast && <span className="w-0.5 flex-1 bg-hairline" />}
                  </div>

                  {/* Station card, plus — sibling BELOW it, never inside —
                      that stop's community field notes (ticket 08). Bottom
                      padding = the gap to the next stop. */}
                  <div className={isLast ? "flex-1" : "flex-1 pb-6"}>
                    <div className="flex flex-col gap-3">
                      <StationCard license={station.license} />
                      {fieldNotesEnabled && (
                        <FieldNotes
                          notes={fieldNotesByLicenseId.get(station.license.id) ?? []}
                        />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* Trust footnote — reinforces the two-tier model in plain words. */}
        {summary.flagged > 0 && (
          <p className="rounded-card border border-hairline bg-surface-sunk px-4 py-3 text-[13px] leading-relaxed text-ink-secondary">
            Stops marked{" "}
            <span className="font-semibold text-flag">Confirm locally</span> are
            genuine steps we couldn&rsquo;t tie to an official online source in
            time. They&rsquo;re shown honestly, not hidden &mdash; confirm the
            exact rule and fee with the office before you file.
          </p>
        )}

        {/* Change answers + share — the route's two footer actions. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <Link
            href={`/questionnaire/${category}`}
            className="inline-flex items-center gap-1.5 self-start font-signage text-sm font-semibold text-route underline decoration-route/30 underline-offset-2 hover:decoration-route"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M10 12 6 8l4-4" />
            </svg>
            Change my answers
          </Link>

          <ShareRoute />
        </div>

        {/* Ticket 10 — save checklist (email-OTP), gated behind
            FEATURE_SAVE_CHECKLIST. Discovery above is unaffected either way. */}
        {isEnabled("FEATURE_SAVE_CHECKLIST") && (
          <SaveChecklist category={category} answers={answers} />
        )}
      </div>
    </main>
  );
}

function Separator() {
  return (
    <span aria-hidden="true" className="mx-1.5 text-ink-muted">
      ·
    </span>
  );
}

function EmptyRoute() {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-hairline bg-surface px-5 py-8 text-center">
      <p className="font-signage text-base font-semibold text-ink">
        No licences matched your answers.
      </p>
      <p className="text-sm text-ink-secondary">
        That&rsquo;s unusual &mdash; try changing your answers, and if it keeps
        happening let us know.
      </p>
    </div>
  );
}
