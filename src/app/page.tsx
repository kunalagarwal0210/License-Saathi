import { CategoryPicker } from "@/components/CategoryPicker";

// Landing screen (ticket 05) — the front door of the flow.
// Hierarchy per docs/UI_IMPLEMENTATION_SPEC.md §9:
//   identity -> value proposition -> short explanation ->
//   "What are you opening?" -> category cards -> primary CTA.
// Server component shell; the interactive picker + CTA live in
// <CategoryPicker> (client component).
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12">
      <div className="flex w-full max-w-[640px] flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <span className="font-signage text-xs font-semibold uppercase tracking-[0.18em] text-route">
            Ahmedabad · micro-licensing
          </span>
          <h1 className="font-signage text-4xl font-bold tracking-tight text-ink">
            LicenseSaathi
          </h1>
          <p className="max-w-sm font-signage text-lg font-semibold leading-snug text-ink">
            Know exactly which licenses your shop needs — in order, each one
            verified.
          </p>
          <p className="max-w-sm text-base leading-relaxed text-ink-secondary">
            Answer a few quick questions about your business. We&apos;ll show
            you the route: which licenses apply, why, and where to get them —
            sourced from official Ahmedabad rules.
          </p>
        </div>

        <div className="w-full text-left">
          <CategoryPicker />
        </div>
      </div>
    </main>
  );
}
