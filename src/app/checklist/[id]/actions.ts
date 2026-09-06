"use server";

/**
 * Ticket 12 — mark-done/undo server action for the checklist detail page.
 * Same session-aware pattern as `results/[category]/actions.ts`'s
 * `saveChecklist`: uses `createSupabaseServerClient()` (never `admin.ts`), so
 * every write happens as the signed-in user and goes through the owner-only
 * RLS policies — a caller trying to toggle someone else's checklist_items row
 * is simply denied by RLS (the parent `saved_checklists.user_id` check),
 * not by application logic here.
 */
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SetChecklistItemStatusInput = {
  checklistId: string;
  licenseId: string;
  done: boolean;
};

export type SetChecklistItemStatusResult =
  | { ok: true }
  | { ok: false; reason: "unauthenticated" | "error"; message?: string };

export async function setChecklistItemStatus(
  input: SetChecklistItemStatusInput
): Promise<SetChecklistItemStatusResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, reason: "unauthenticated" };
  }

  // Upsert (not update) on the (checklist_id, license_id) unique constraint:
  // a station can have no `checklist_items` row yet (shouldn't happen given
  // `saveChecklist` inserts one per resolved licence, but this keeps toggling
  // robust rather than silently no-op-ing on a missing row).
  const { error: upsertError } = await supabase.from("checklist_items").upsert(
    {
      checklist_id: input.checklistId,
      license_id: input.licenseId,
      status: input.done ? "done" : "pending",
    },
    { onConflict: "checklist_id,license_id" }
  );

  if (upsertError) {
    return { ok: false, reason: "error", message: upsertError.message };
  }

  revalidatePath(`/checklist/${input.checklistId}`);
  return { ok: true };
}
