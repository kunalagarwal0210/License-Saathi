import { notFound } from "next/navigation";
import {
  CATEGORY_DEFINITIONS,
  isCategory,
  type Category,
} from "@/lib/categories";

type QuestionnairePageProps = {
  params: Promise<{ category: string }>;
};

// Minimal stub for the routing contract landing (05) hands off to
// questionnaire (06): `/questionnaire/[category]` where category is one of
// eatery | retail | salon. Ticket 06 replaces this placeholder with the
// real guided-journey questionnaire (docs/UI_IMPLEMENTATION_SPEC.md §10).
export default async function QuestionnairePage({
  params,
}: QuestionnairePageProps) {
  const { category } = await params;

  if (!isCategory(category)) {
    notFound();
  }

  const label = getCategoryLabel(category);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <span className="font-signage text-xs font-semibold uppercase tracking-[0.18em] text-route">
        Ahmedabad · micro-licensing
      </span>
      <h1 className="font-signage text-2xl font-bold tracking-tight text-ink">
        Questionnaire for {label}
      </h1>
      <p className="max-w-sm text-base leading-relaxed text-ink-secondary">
        Coming soon — this is where we&apos;ll ask a few quick questions
        about your {label.toLowerCase()} to work out your exact licence
        route.
      </p>
    </main>
  );
}

function getCategoryLabel(category: Category): string {
  return (
    CATEGORY_DEFINITIONS.find((definition) => definition.id === category)
      ?.label ?? category
  );
}
