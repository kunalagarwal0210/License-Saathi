"use server";

/**
 * Ticket 15 — field-note capture server action.
 *
 * Uses the SESSION-AWARE anon client (`createSupabaseServerClient`, never
 * `admin.ts`), same as `checklist/[id]/actions.ts` / `results/[category]/
 * actions.ts` — but here there is no signed-in user requirement at all: the
 * `field_notes_insert_public` RLS policy (0001_initial_schema.sql) lets
 * anon/authenticated INSERT as long as `status = 'new'`, which is exactly
 * the DB default we rely on by never setting `status` ourselves. This is
 * the first (and only) write path into `field_notes` from the app — the
 * promotion to `status='promoted'` is admin/out of scope here.
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseFieldNoteForm } from "@/lib/fieldNotes/captureForm";

export type SubmitFieldNoteInput = {
  licenseId: string;
  whatHappened: string;
  extraDoc?: string | null;
  extraFee?: string | null;
};

export type SubmitFieldNoteResult = { ok: true } | { ok: false; message: string };

const GENERIC_ERROR_MESSAGE = "Could not submit your note. Please try again.";

export async function submitFieldNote(
  input: SubmitFieldNoteInput
): Promise<SubmitFieldNoteResult> {
  const parsed = parseFieldNoteForm({
    whatHappened: input.whatHappened,
    extraDoc: input.extraDoc,
    extraFee: input.extraFee,
  });

  if (!parsed.ok) {
    const message = parsed.errors.whatHappened ?? parsed.errors.extraFee ?? GENERIC_ERROR_MESSAGE;
    return { ok: false, message };
  }

  try {
    const supabase = await createSupabaseServerClient();

    // Do NOT set `status` — the DB default ('new') and the
    // `field_notes_insert_public` RLS check both require 'new', so leaving
    // it out is both correct and required for the insert to succeed.
    const { error } = await supabase.from("field_notes").insert({
      license_id: input.licenseId,
      what_happened: parsed.value.what_happened,
      extra_doc: parsed.value.extra_doc,
      extra_fee: parsed.value.extra_fee,
    });

    if (error) {
      return { ok: false, message: GENERIC_ERROR_MESSAGE };
    }

    return { ok: true };
  } catch {
    return { ok: false, message: GENERIC_ERROR_MESSAGE };
  }
}
