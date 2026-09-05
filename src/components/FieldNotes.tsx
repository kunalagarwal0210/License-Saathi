import type { FieldNotePublicRow } from "@/lib/supabase/types";
import { formatFee } from "@/lib/data/routeView";

type FieldNotesProps = {
  notes: FieldNotePublicRow[];
};

// Ticket 08 — community field-notes tier. A SEPARATE, amber, sibling
// container rendered BELOW a stop's <StationCard>, never inside it. This is
// the load-bearing two-tier invariant (UI_IMPLEMENTATION_SPEC §13): a field
// note must never be green, never carry a checkmark or the word "verified",
// and never render inside the verified station card. Callers should only
// render this component when a stop actually has notes (cold start = render
// nothing) — see the results page.
export function FieldNotes({ notes }: FieldNotesProps) {
  if (notes.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-card border border-note/30 bg-note-tint px-4 py-3">
      {/* Labelled divider — the explicit "this is not official" signal. */}
      <div className="flex items-center gap-2">
        <NoteIcon className="h-4 w-4 shrink-0 text-note" />
        <span className="font-signage text-xs font-semibold uppercase tracking-[0.14em] text-note">
          Field notes, not law
        </span>
      </div>

      <p className="text-[13px] leading-snug text-note/80">
        {notes.length === 1
          ? "1 person reported this from experience:"
          : `${notes.length} people reported this from experience:`}
      </p>

      <ul className="flex flex-col gap-3">
        {notes.map((note) => (
          <li key={note.id} className="flex flex-col gap-1 border-t border-note/20 pt-3 first:border-t-0 first:pt-0">
            <p className="text-sm leading-relaxed text-ink">{note.what_happened}</p>
            {(note.extra_doc || note.extra_fee !== null) && (
              <dl className="flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-ink-secondary">
                {note.extra_doc && (
                  <div className="flex items-baseline gap-1.5">
                    <dt className="font-semibold text-note">Extra document</dt>
                    <dd>{note.extra_doc}</dd>
                  </div>
                )}
                {note.extra_fee !== null && (
                  <div className="flex items-baseline gap-1.5">
                    <dt className="font-semibold text-note">Extra fee</dt>
                    <dd>{formatFee(note.extra_fee)}</dd>
                  </div>
                )}
              </dl>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoteIcon({ className }: { className?: string }) {
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
      <path d="M8 5.5v3.5M8 11.5h.01" />
      <path d="M7.06 2.6 1.4 12.4a1 1 0 0 0 .87 1.5h11.46a1 1 0 0 0 .87-1.5L8.94 2.6a1 1 0 0 0-1.88 0Z" />
    </svg>
  );
}
