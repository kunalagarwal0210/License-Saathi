"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORY_DEFINITIONS,
  getQuestionnaireHref,
  type Category,
} from "@/lib/categories";
import { CategoryCard } from "@/components/CategoryCard";

// Owns the landing page's "What are you opening?" selection state and the
// primary CTA that carries the choice into the questionnaire route
// (`/questionnaire/[category]`). Client component: selection is interactive,
// but the surrounding page shell (identity/value-prop copy) stays a server
// component.
export function CategoryPicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<Category | null>(null);

  function handleFindLicenses() {
    if (!selected) return;
    router.push(getQuestionnaireHref(selected));
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-signage text-sm font-semibold uppercase tracking-[0.08em] text-ink-secondary">
          What are you opening?
        </legend>
        {CATEGORY_DEFINITIONS.map((definition) => (
          <CategoryCard
            key={definition.id}
            definition={definition}
            selected={selected === definition.id}
            onSelect={setSelected}
          />
        ))}
      </fieldset>

      <button
        type="button"
        disabled={!selected}
        onClick={handleFindLicenses}
        className="min-h-[48px] w-full rounded-control bg-route px-6 py-3 font-signage text-base font-semibold text-on-route shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-route-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-ground disabled:cursor-not-allowed disabled:bg-surface-sunk disabled:text-ink-muted disabled:shadow-none"
      >
        Find my licenses
      </button>
    </div>
  );
}
