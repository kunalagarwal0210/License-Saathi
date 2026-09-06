/**
 * Ticket 15 — pure form parsing/validation for the field-note capture form.
 *
 * Kept free of React/Next/Supabase-client imports so it can be unit-tested
 * directly, mirroring `src/lib/admin/licenseForm.ts`. The server action that
 * actually writes to Supabase (`src/app/notes/[licenseId]/actions.ts`) is a
 * thin wrapper around `parseFieldNoteForm` + `createSupabaseServerClient()`.
 *
 * A field-note is community/unofficial input (see `FieldNotes.tsx`), not a
 * verified record — validation here only guards shape/size, never truth.
 */

const WHAT_HAPPENED_MAX_LENGTH = 2000;
const EXTRA_DOC_MAX_LENGTH = 300;

export type FieldNoteFormInput = {
  whatHappened: string;
  extraDoc?: string | null;
  extraFee?: string | null;
};

export type FieldNoteFormValue = {
  what_happened: string;
  extra_doc: string | null;
  extra_fee: number | null;
};

export type FieldNoteFormErrors = {
  whatHappened?: string;
  extraFee?: string;
};

export type ParseFieldNoteFormResult =
  | { ok: true; value: FieldNoteFormValue }
  | { ok: false; errors: FieldNoteFormErrors };

/** `""`/whitespace/undefined/null -> null, otherwise a non-negative integer -> number, anything else -> error. */
function parseFee(raw: string | null | undefined): { value: number | null } | { error: string } {
  const trimmed = (raw ?? "").trim();
  if (trimmed === "") return { value: null };
  if (!/^\d+$/.test(trimmed)) {
    return { error: "Fee must be a whole, non-negative number (in ₹), or left blank." };
  }
  return { value: Number(trimmed) };
}

export function parseFieldNoteForm(input: FieldNoteFormInput): ParseFieldNoteFormResult {
  const errors: FieldNoteFormErrors = {};

  const whatHappened = input.whatHappened.trim();
  if (!whatHappened) {
    errors.whatHappened = "Please describe what happened.";
  } else if (whatHappened.length > WHAT_HAPPENED_MAX_LENGTH) {
    errors.whatHappened = `Please keep this under ${WHAT_HAPPENED_MAX_LENGTH} characters.`;
  }

  // extraDoc has no dedicated error key in the result shape (only
  // whatHappened/extraFee do) — an over-length value is clamped rather than
  // rejected, since it's optional supporting context, not the core report.
  const extraDocRaw = (input.extraDoc ?? "").trim();
  const extraDoc: string | null =
    extraDocRaw === "" ? null : extraDocRaw.slice(0, EXTRA_DOC_MAX_LENGTH);

  const feeResult = parseFee(input.extraFee);
  if ("error" in feeResult) {
    errors.extraFee = feeResult.error;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      what_happened: whatHappened,
      extra_doc: extraDoc,
      extra_fee: "value" in feeResult ? feeResult.value : null,
    },
  };
}
