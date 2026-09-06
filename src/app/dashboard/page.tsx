import Link from "next/link";
import { notFound } from "next/navigation";
import { isEnabled } from "@/lib/flags";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { CATEGORY_DEFINITIONS } from "@/lib/categories";
import { formatVerifiedDate } from "@/lib/data/routeView";
import { summarizeChecklistItems } from "@/lib/checklist/dashboard";
import type { BusinessCategory } from "@/lib/engine/types";
import { DashboardSignIn } from "@/components/DashboardSignIn";

// Same reasoning as `src/app/admin/layout.tsx`: this route reads the caller's
// own session + DB rows on every request, so it must never be statically
// prerendered/cached.
export const dynamic = "force-dynamic";

// Ticket 11 — the returning dashboard. Gated behind FEATURE_SAVE_CHECKLIST
// (the same flag as save + resume, ticket 10): saving a checklist is
// pointless without somewhere to come back to it, so they ship as one
// feature. 404s (not a redirect) when the flag is off, matching the /admin
// gate pattern.
export default async function DashboardPage() {
  if (!isEnabled("FEATURE_SAVE_CHECKLIST")) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-12">
        <div className="flex w-full max-w-[600px] flex-col gap-6">
          <DashboardHeader />
          <DashboardSignIn />
        </div>
      </main>
    );
  }

  const { data: checklists, error } = await supabase
    .from("saved_checklists")
    .select("id, category, answers, created_at, checklist_items(status, license_id, licenses(name))")
    .order("created_at", { ascending: false });

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-12">
      <div className="flex w-full max-w-[600px] flex-col gap-6">
        <DashboardHeader />

        {error && (
          <p className="rounded-card border border-hairline bg-surface-sunk px-5 py-4 text-sm text-ink-secondary">
            Couldn&rsquo;t load your saved routes right now. Please try
            refreshing the page.
          </p>
        )}

        {!error && checklists && checklists.length === 0 && <EmptyState />}

        {!error && checklists && checklists.length > 0 && (
          <ol className="flex flex-col gap-4">
            {checklists.map((checklist) => (
              <li key={checklist.id}>
                <ChecklistCard
                  checklistId={checklist.id}
                  category={checklist.category}
                  createdAt={checklist.created_at}
                  items={checklist.checklist_items ?? []}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}

function DashboardHeader() {
  return (
    <header className="flex flex-col gap-2">
      <span className="font-signage text-xs font-semibold uppercase tracking-[0.18em] text-route">
        Your account
      </span>
      <h1 className="font-signage text-[26px] font-bold leading-tight tracking-tight text-ink">
        Your saved routes
      </h1>
      <p className="text-sm text-ink-secondary">
        Every checklist you&rsquo;ve saved, with progress at a glance.
      </p>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-card border border-hairline bg-surface px-5 py-8 text-left">
      <p className="font-signage text-base font-semibold text-ink">
        No saved routes yet.
      </p>
      <p className="text-sm text-ink-secondary">
        Answer a few questions about your business and save the checklist to
        track it here.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-[44px] items-center justify-center rounded-control bg-route px-4 font-signage text-sm font-semibold text-on-route transition hover:bg-route/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        Start a route
      </Link>
    </div>
  );
}

type ChecklistCardProps = {
  checklistId: string;
  category: BusinessCategory;
  createdAt: string;
  items: { status: string; license_id: string; licenses: { name: string } | null }[];
};

function ChecklistCard({ checklistId, category, createdAt, items }: ChecklistCardProps) {
  const categoryLabel =
    CATEGORY_DEFINITIONS.find((definition) => definition.id === category)?.label ?? category;
  const summary = summarizeChecklistItems(items);
  const percentDone = summary.total === 0 ? 0 : Math.round((summary.done / summary.total) * 100);
  // Ticket 12 — Resume now opens the real checklist detail (mark-done +
  // document pack) instead of the ticket 11 stopgap back to /results.
  const resumeHref = `/checklist/${checklistId}`;

  const PENDING_PREVIEW_COUNT = 3;
  const pendingPreview = summary.pendingNames.slice(0, PENDING_PREVIEW_COUNT);
  const pendingRemainder = summary.pendingNames.length - pendingPreview.length;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-hairline bg-surface px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-signage text-base font-bold text-ink">{categoryLabel}</h2>
        <span className="text-xs text-ink-muted">
          Saved {formatVerifiedDate(createdAt.slice(0, 10))}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="font-signage text-sm font-semibold tabular-nums text-ink">
          {summary.done} of {summary.total} done
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

      {summary.pendingNames.length > 0 ? (
        <p className="text-[13px] leading-relaxed text-ink-secondary">
          Still pending: {pendingPreview.join(", ")}
          {pendingRemainder > 0 && ` +${pendingRemainder} more`}
        </p>
      ) : (
        <p className="text-[13px] font-semibold leading-relaxed text-verified">
          All stops cleared.
        </p>
      )}

      <Link
        href={resumeHref}
        className="inline-flex min-h-[44px] w-fit items-center justify-center rounded-control bg-route px-4 font-signage text-sm font-semibold text-on-route transition hover:bg-route/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        Resume
      </Link>
    </div>
  );
}

