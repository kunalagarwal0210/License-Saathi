import { notFound } from "next/navigation";
import { isCategory, CATEGORY_DEFINITIONS } from "@/lib/categories";
import { searchParamsToAnswers } from "@/lib/questionnaire";
import { resolveLicenses } from "@/lib/engine/resolveLicenses";
import { verifiedRulesSource } from "@/lib/data/verified";

type ResultsPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// MINIMAL results stub (ticket 06). Reads the answers ticket 06's
// questionnaire carries in the URL (`/results/[category]?<answers>` — the
// 06 -> 07 routing contract) and runs them through the real
// `resolveLicenses` engine against the verified data source, rendering a
// plain ordered list of licence names. Ticket 07 replaces this with the
// real station-card / route-rail design — this stub only needs to be
// minimal and correct.
export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { category } = await params;
  const query = await searchParams;

  if (!isCategory(category)) {
    notFound();
  }

  const answers = searchParamsToAnswers(query);
  const licenses = resolveLicenses(category, answers, verifiedRulesSource);
  const categoryLabel =
    CATEGORY_DEFINITIONS.find((definition) => definition.id === category)?.label ?? category;

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <div className="flex w-full max-w-[560px] flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-signage text-xs font-semibold uppercase tracking-[0.18em] text-route">
            {categoryLabel} · Ahmedabad
          </span>
          <h1 className="font-signage text-2xl font-bold tracking-tight text-ink">
            Your licence route
          </h1>
          <p className="text-sm text-ink-secondary">
            Minimal stub (ticket 06) — verified/flagged station-card styling
            arrives in ticket 07.
          </p>
        </div>

        <ol className="flex flex-col gap-2">
          {licenses.map((license, index) => (
            <li
              key={license.id}
              className="flex items-center gap-3 rounded-card border border-hairline bg-surface px-4 py-3"
            >
              <span className="font-signage text-sm font-semibold tabular-nums text-ink-secondary">
                {index + 1}
              </span>
              <span className="font-signage text-base font-semibold text-ink">
                {license.name}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
