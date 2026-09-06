"use client";

import { useState } from "react";
import { submitFieldNote } from "@/app/notes/[licenseId]/actions";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

type FieldNoteFormProps = {
  licenseId: string;
  licenseName: string;
};

type Step = "idle" | "submitting" | "done" | "error";

// Ticket 15 — field-note capture. Amber/community framing throughout (same
// token language as `FieldNotes.tsx`): this is a place to report what
// actually happened, not an official form, so it must never look verified
// (no green, no checkmark, no "verified"). Follows `SaveChecklist.tsx`'s
// state-machine + accessibility pattern (min-h-[44px] controls, aria-live
// status, focus rings).
export function FieldNoteForm({ licenseId, licenseName }: FieldNoteFormProps) {
  const [step, setStep] = useState<Step>("idle");
  const [whatHappened, setWhatHappened] = useState("");
  const [extraDoc, setExtraDoc] = useState("");
  const [extraFee, setExtraFee] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setMessage("");

    if (!whatHappened.trim()) {
      setMessage("Please describe what happened.");
      return;
    }

    setStep("submitting");
    try {
      const result = await submitFieldNote({
        licenseId,
        whatHappened,
        extraDoc,
        extraFee,
      });

      if (!result.ok) {
        setStep("error");
        setMessage(result.message);
        return;
      }

      track(ANALYTICS_EVENTS.fieldNoteSubmitted, { licenseId });
      setStep("done");
      setMessage(
        "Thanks — this helps the next person. It'll appear here, labelled unofficial, once it's reviewed."
      );
    } catch {
      setStep("error");
      setMessage("Could not submit your note. Please try again.");
    }
  }

  const pending = step === "submitting";

  return (
    <div className="flex flex-col gap-4 rounded-card border border-note/30 bg-note-tint px-5 py-4">
      <div className="flex items-center gap-2">
        <NoteIcon className="h-4 w-4 shrink-0 text-note" />
        <span className="font-signage text-xs font-semibold uppercase tracking-[0.14em] text-note">
          Field notes, not law
        </span>
      </div>

      <h1 className="font-signage text-lg font-bold leading-tight text-ink">
        Anything unexpected with {licenseName}?
      </h1>

      {step === "done" ? (
        <p aria-live="polite" className="text-sm leading-relaxed text-ink">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-note-what-happened" className="font-signage text-xs font-semibold text-ink">
              What happened?
            </label>
            <textarea
              id="field-note-what-happened"
              required
              rows={4}
              value={whatHappened}
              onChange={(event) => setWhatHappened(event.target.value)}
              placeholder="e.g. they asked for a document that wasn't on the list, or a step took longer than expected."
              className="min-h-[44px] rounded-control border border-hairline bg-surface px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-note"
            />
            <p className="text-[13px] leading-snug text-ink-secondary">
              e.g. they asked for a document that wasn&rsquo;t on the list, or a step took longer than
              expected.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-note-extra-doc" className="font-signage text-xs font-semibold text-ink">
              A document they asked for that wasn&rsquo;t listed
            </label>
            <input
              id="field-note-extra-doc"
              type="text"
              value={extraDoc}
              onChange={(event) => setExtraDoc(event.target.value)}
              placeholder="Optional"
              className="min-h-[44px] rounded-control border border-hairline bg-surface px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-note"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-note-extra-fee" className="font-signage text-xs font-semibold text-ink">
              A fee that wasn&rsquo;t listed (₹)
            </label>
            <input
              id="field-note-extra-fee"
              type="text"
              inputMode="numeric"
              value={extraFee}
              onChange={(event) => setExtraFee(event.target.value)}
              placeholder="Optional"
              className="min-h-[44px] rounded-control border border-hairline bg-surface px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-note"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[44px] items-center justify-center rounded-control bg-route px-4 font-signage text-sm font-semibold text-on-route transition hover:bg-route/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Share this"}
          </button>

          <p aria-live="polite" className="text-[13px] leading-relaxed text-note">
            {step === "error" ? message : ""}
          </p>
        </form>
      )}
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
