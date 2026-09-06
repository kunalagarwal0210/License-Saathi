"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setChecklistItemStatus } from "@/app/checklist/[id]/actions";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

type ChecklistItemToggleProps = {
  checklistId: string;
  licenseId: string;
  initialDone: boolean;
};

// Ticket 12 — the per-stop mark-done/undo control. Optimistic: the checkbox
// flips immediately, then the server action confirms in the background; on
// failure we revert and surface an inline error rather than leaving the UI
// lying about saved state. `router.refresh()` (not local state alone) is
// what makes the page header's "X of N done" progress bar move, since that
// count is computed server-side from `checklist_items`.
export function ChecklistItemToggle({
  checklistId,
  licenseId,
  initialDone,
}: ChecklistItemToggleProps) {
  const router = useRouter();
  const [done, setDone] = useState(initialDone);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !done;
    setDone(next);
    setError(null);

    startTransition(async () => {
      const result = await setChecklistItemStatus({
        checklistId,
        licenseId,
        done: next,
      });
      if (!result.ok) {
        setDone(!next); // revert
        setError(
          result.reason === "unauthenticated"
            ? "You've been signed out — sign in again to update this."
            : (result.message ?? "Couldn't save that change. Please try again.")
        );
        return;
      }
      // Ticket 13 — North Star signal. Only on the done transition (not
      // undo), matching the acceptance criterion ("marked >=1 licence done").
      if (next) {
        track(ANALYTICS_EVENTS.licenseMarkedDone, { checklistId, licenseId });
      }
      router.refresh();
    });
  }

  return (
    <div className="print-hide flex flex-col gap-1">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        onClick={handleToggle}
        disabled={isPending}
        className={`inline-flex min-h-[44px] items-center gap-2 rounded-control border px-4 font-signage text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60 ${
          done
            ? "border-verified bg-verified-tint text-verified"
            : "border-hairline bg-surface text-ink hover:border-route"
        }`}
      >
        <span
          aria-hidden="true"
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
            done ? "border-verified bg-verified text-on-route" : "border-hairline bg-surface-sunk"
          }`}
        >
          {done && (
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
            >
              <path d="M3 8.5 6.2 12 13 4" />
            </svg>
          )}
        </span>
        {done ? "Done — undo" : "Mark done"}
      </button>
      <p aria-live="polite" className="text-[13px] leading-relaxed text-flag">
        {error ?? ""}
      </p>
    </div>
  );
}
