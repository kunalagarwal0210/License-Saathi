"use client";

import type { CategoryDefinition } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";

type CategoryCardProps = {
  definition: CategoryDefinition;
  selected: boolean;
  onSelect: (category: CategoryDefinition["id"]) => void;
};

// One tap target in the "What are you opening?" picker. A real button
// (keyboard-operable, aria-pressed) rather than a radio input — the spec
// explicitly asks for an elevated card, not a plain radio button.
export function CategoryCard({
  definition,
  selected,
  onSelect,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={selected}
      onClick={() => onSelect(definition.id)}
      className={`flex min-h-[48px] w-full items-center gap-4 rounded-card border px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-ground ${
        selected
          ? "border-route bg-route-tint"
          : "border-hairline bg-surface hover:border-route/40"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${
          selected
            ? "bg-route text-on-route"
            : "bg-surface-sunk text-ink-secondary"
        }`}
      >
        <CategoryIcon category={definition.id} className="h-6 w-6" />
      </span>

      <span className="flex-1">
        <span className="block font-signage text-base font-semibold text-ink">
          {definition.label}
        </span>
        <span className="block text-sm leading-snug text-ink-secondary">
          {definition.description}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-route bg-route text-on-route" : "border-hairline"
        }`}
      >
        {selected && (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5"
          >
            <path d="M3 8.5 6.2 12 13 4" />
          </svg>
        )}
      </span>
    </button>
  );
}
