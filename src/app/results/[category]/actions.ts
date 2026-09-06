"use server";

/**
 * Ticket 10 — save-checklist server action, gated behind
 * FEATURE_SAVE_CHECKLIST at the call site (`SaveChecklist.tsx`/the results
 * page). Uses the SESSION-AWARE server client (`createSupabaseServerClient`,
 * not `admin.ts`) so every write happens as the signed-in user and goes
 * through the owner-only RLS policies in `0001_initial_schema.sql` /
 * `0002_auth_email.sql` — this action never bypasses RLS. Follows the
 * `src/app/admin/actions.ts` server-action style, but returns a result
 * object instead of redirecting: the client component (`SaveChecklist.tsx`)
 * drives the OTP steps and needs the outcome in place, not a navigation.
 */
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadDbRoute } from "@/lib/data/dbSource";
import { resolveLicenses } from "@/lib/engine/resolveLicenses";
import { buildChecklistItemRows } from "@/lib/checklist/saveChecklist";
import type { Answers, BusinessCategory } from "@/lib/engine/types";

export type SaveChecklistInput = {
  category: BusinessCategory;
  answers: Answers;
};

export type SaveChecklistResult =
  | { ok: true; checklistId: string }
  | { ok: false; reason: "unauthenticated" | "error"; message?: string };

export async function saveChecklist(input: SaveChecklistInput): Promise<SaveChecklistResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // No session yet — the client drives OTP sign-in first, then calls this
  // action again. Not an error: this is the expected first call for a
  // brand-new visitor who just clicked "Save my checklist".
  if (userError || !user) {
    return { ok: false, reason: "unauthenticated" };
  }

  // Upsert the caller's own profile row. Insert-only with onConflict:
  // "do nothing" — a returning user already has this row (RLS only grants
  // insert, not upsert-as-update, for id = auth.uid()).
  const { error: userUpsertError } = await supabase
    .from("users")
    .upsert({ id: user.id, email: user.email ?? null }, { onConflict: "id", ignoreDuplicates: true });
  if (userUpsertError) {
    return { ok: false, reason: "error", message: userUpsertError.message };
  }

  let orderedLicenseIds: string[];
  try {
    const { rulesSource } = await loadDbRoute();
    const ordered = resolveLicenses(input.category, input.answers, rulesSource);
    orderedLicenseIds = ordered.map((license) => license.id);
  } catch (error) {
    return {
      ok: false,
      reason: "error",
      message: error instanceof Error ? error.message : "Could not resolve licences.",
    };
  }

  const { data: checklist, error: checklistError } = await supabase
    .from("saved_checklists")
    .insert({ user_id: user.id, category: input.category, answers: input.answers })
    .select("id")
    .single();
  if (checklistError || !checklist) {
    return {
      ok: false,
      reason: "error",
      message: checklistError?.message ?? "Could not save checklist.",
    };
  }

  if (orderedLicenseIds.length > 0) {
    const itemRows = buildChecklistItemRows(checklist.id, orderedLicenseIds);
    const { error: itemsError } = await supabase.from("checklist_items").insert(itemRows);
    if (itemsError) {
      return { ok: false, reason: "error", message: itemsError.message };
    }
  }

  return { ok: true, checklistId: checklist.id };
}
