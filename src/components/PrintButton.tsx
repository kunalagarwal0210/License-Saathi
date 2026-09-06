"use client";

// Ticket 12 — triggers the browser print dialog for the "bring these
// documents" pack. `@media print` rules in globals.css do the actual
// layout work (hiding controls, showing only the pack); this button just
// hides itself when printing (`print-hide`) so it doesn't show up on paper.
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print-hide inline-flex min-h-[44px] items-center gap-1.5 rounded-control border border-hairline bg-surface px-4 font-signage text-sm font-semibold text-ink transition hover:border-route hover:text-route focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <PrintIcon className="h-4 w-4" />
      Print document pack
    </button>
  );
}

function PrintIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 6V2h8v4M4 12h8v3H4v-3ZM2 6h12v5h-2v-2H4v2H2V6Z" />
    </svg>
  );
}
