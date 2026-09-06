import Link from "next/link";
import { notFound } from "next/navigation";
import { isEnabled } from "@/lib/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CATEGORY_DEFINITIONS, isCategory } from "@/lib/categories";
import { searchParamsToAnswers } from "@/lib/questionnaire";
import { resolveLicenses } from "@/lib/engine/resolveLicenses";
import { loadDbRoute } from "@/lib/data/dbSource";
import { buildRouteStations } from "@/lib/data/routeView";
import { buildDocumentPack } from "@/lib/checklist/documentPack";
import { DashboardSignIn } from "@/components/DashboardSignIn";
import { StationCard } from "@/components/StationCard";
import { ChecklistItemToggle } from "@/components/ChecklistItemToggle";
import { PrintButton } from "@/components/PrintButton";
import { AnalyticsIdentify } from "@/components/AnalyticsIdentify";

type ChecklistDetailPageProps = {
  params: Promise<{ id: string }>;
};

// Ticket 12 — checklist detail: per-licence mark-done/undo state, and a
// printable "bring these documents" pack. Gated behind FEATURE_SAVE_CHECKLIST
// (same flag as save + resume, tickets 10/11) — a saved checklist is useless
// without a place to track it. Session-aware reads/writes only (never
// `admin.ts`): owner-only RLS makes another user's checklist id 404 here
// exactly as it does on the dashboard.
export const dynamic = "force-dynamic";

export default async function ChecklistDetailPage({ params }: ChecklistDetailPageProps) {
  if (!isEnabled("FEATURE_SAVE_CHECKLIST")) {
    notFound();
  }

  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-12">
        <div className="flex w-full max-w-[600px] flex-col gap-6">
          <DashboardSignIn />
        </div>
      </main>
    );
  }

  const { data: checklist, error } = await supabase
    .from("saved_checklists")
    .select("id, category, answers, checklist_items(license_id, status)")
    .eq("id", id)
    .maybeSingle();

  // RLS scopes `saved_checklists` to the caller's own rows, so a missing row
  // here means either it doesn't exist or it belongs to someone else — both
  // cases 404 rather than leaking which one.
  if (error || !checklist || !isCategory(checklist.category)) {
    notFound();
  }

  const category = checklist.category;
  const answers = searchParamsToAnswers(answersFromJsonb(checklist.answers as Record<string, unknown>));

  let stations: ReturnType<typeof buildRouteStations> = [];
  try {
    const { rulesSource, licensesById } = await loadDbRoute();
    const ordered = resolveLicenses(category, answers, rulesSource);
    stations = buildRouteStations(ordered, licensesById);
  } catch {
    // Route data genuinely unavailable — render with no stations rather than
    // crashing; the header/pack below degrade to empty, honestly.
    stations = [];
  }

  const statusByLicenseId = new Map<string, string>(
    (checklist.checklist_items ?? []).map((item) => [item.license_id, item.status])
  );

  const total = stations.length;
  const done = stations.filter(
    (station) => statusByLicenseId.get(station.license.id) === "done"
  ).length;
  const percentDone = total === 0 ? 0 : Math.round((done / total) * 100);

  const categoryLabel =
    CATEGORY_DEFINITIONS.find((definition) => definition.id === category)?.label ?? category;

  const documentPack = buildDocumentPack(stations);

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-12">
      <div className="flex w-full max-w-[600px] flex-col gap-8">
        {/* Ticket 13 — ties `license_marked_done` on this page to the same
            Mixpanel identity set at save-checklist time. */}
        <AnalyticsIdentify userId={user.id} />
        {/* Header */}
        <header className="flex flex-col gap-3">
          <div className="print-hide flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-1.5 font-signage text-xs font-semibold uppercase tracking-[0.18em] text-route"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-3.5 w-3.5"
              >
                <path d="M10 12 6 8l4-4" />
              </svg>
              Your saved routes
            </Link>
          </div>
          <h1 className="font-signage text-[26px] font-bold leading-tight tracking-tight text-ink">
            {categoryLabel}
          </h1>

          <div className="print-hide flex flex-col gap-1.5">
            <p className="font-signage text-sm font-semibold tabular-nums text-ink">
              {done} of {total} done
            </p>
            <div
              role="progressbar"
              aria-valuenow={percentDone}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunk"
            >
              <div
                className="h-full rounded-full bg-route transition-[width]"
                style={{ width: `${percentDone}%` }}
              />
            </div>
          </div>
        </header>

        {/* Route rail — same numbered-stop structure as the results screen
            (ticket 07), with a mark-done control alongside each station's
            existing detail card. */}
        {stations.length === 0 ? (
          <p className="print-hide rounded-card border border-hairline bg-surface-sunk px-5 py-4 text-sm text-ink-secondary">
            Couldn&rsquo;t load this route&rsquo;s licences right now. Please try
            refreshing the page.
          </p>
        ) : (
          <ol className="print-hide flex flex-col">
            {stations.map((station, index) => {
              const isLast = index === stations.length - 1;
              const isDone = statusByLicenseId.get(station.license.id) === "done";
              return (
                <li key={station.license.id} className="flex gap-4">
                  <div
                    aria-hidden="true"
                    className="flex w-8 shrink-0 flex-col items-center"
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-signage text-sm font-bold tabular-nums ${
                        isDone
                          ? "bg-verified text-on-route"
                          : "bg-route text-on-route"
                      }`}
                    >
                      {station.stopNumber}
                    </span>
                    {!isLast && <span className="w-0.5 flex-1 bg-hairline" />}
                  </div>

                  <div className={isLast ? "flex-1" : "flex-1 pb-6"}>
                    <div className="flex flex-col gap-3">
                      <StationCard license={station.license} />
                      <ChecklistItemToggle
                        checklistId={checklist.id}
                        licenseId={station.license.id}
                        initialDone={isDone}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* Printable "bring these documents" pack — deduped across every
            licence on this route. Stays on-screen too (not print-only) so
            the user can review it before printing. */}
        <section className="flex flex-col gap-3 rounded-card border border-hairline bg-surface px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-signage text-base font-bold text-ink">
              Bring these documents
            </h2>
            <PrintButton />
          </div>

          {documentPack.length === 0 ? (
            <p className="text-sm text-ink-secondary">
              No documents listed for this route yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {documentPack.map((entry) => (
                <li key={entry.document} className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-ink">{entry.document}</p>
                  <p className="text-[13px] text-ink-secondary">
                    Needed for: {entry.licenses.join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

/**
 * The `answers` jsonb column always holds exactly what `saveChecklist`
 * inserted (see `src/app/results/[category]/actions.ts`). Round-tripping it
 * through `searchParamsToAnswers`'s allow-list — same approach as
 * `dashboard/page.tsx`'s `answersFromJsonb` — means a corrupted/hand-edited
 * row degrades to "fewer answers" instead of crashing route resolution.
 */
function answersFromJsonb(raw: Record<string, unknown>): Record<string, string> {
  const asParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value !== undefined && value !== null) {
      asParams[key] = String(value);
    }
  }
  return asParams;
}
