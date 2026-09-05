"use server";

/**
 * Ticket 09 — admin server actions.
 *
 * Thin wrappers over the pure parse/validate functions
 * (src/lib/admin/licenseForm.ts, ruleForm.ts) + the service-role admin
 * client. All writes to `licenses`/`rules` go through here — the panel is
 * the only sanctioned way to change the verified spine, never a hand-edit
 * of the DB. Not unit-tested directly (needs a live DB); the parsing logic
 * they call IS unit-tested.
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  parseLicenseForm,
  type LicenseFormErrors,
  type LicenseFormInput,
} from "@/lib/admin/licenseForm";
import { parseRuleForm, type RuleFormErrors, type RuleFormInput } from "@/lib/admin/ruleForm";

export type LicenseActionState = {
  values: LicenseFormInput;
  errors: LicenseFormErrors;
  formError?: string;
};

export type RuleActionState = {
  values: RuleFormInput;
  errors: RuleFormErrors;
  formError?: string;
};

function extractLicenseInput(formData: FormData): LicenseFormInput {
  const get = (key: string) => String(formData.get(key) ?? "");
  return {
    name: get("name"),
    description: get("description"),
    category: get("category"),
    govt_fee_inr: get("govt_fee_inr"),
    rough_timeline: get("rough_timeline"),
    portal_deep_link: get("portal_deep_link"),
    required_documents: get("required_documents"),
    source_url: get("source_url"),
    last_verified_date: get("last_verified_date"),
    status: get("status"),
  };
}

function extractRuleInput(formData: FormData): RuleFormInput {
  const get = (key: string) => String(formData.get(key) ?? "");
  return {
    category: get("category"),
    condition: get("condition"),
    license_id: get("license_id"),
    sequence: get("sequence"),
  };
}

export async function createLicense(
  _prevState: LicenseActionState,
  formData: FormData
): Promise<LicenseActionState> {
  const values = extractLicenseInput(formData);
  const result = parseLicenseForm(values);
  if (!result.payload) {
    return { values, errors: result.errors };
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("licenses").insert(result.payload);
  if (error) {
    return { values, errors: {}, formError: error.message };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateLicense(
  id: string,
  _prevState: LicenseActionState,
  formData: FormData
): Promise<LicenseActionState> {
  const values = extractLicenseInput(formData);
  const result = parseLicenseForm(values);
  if (!result.payload) {
    return { values, errors: result.errors };
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("licenses").update(result.payload).eq("id", id);
  if (error) {
    return { values, errors: {}, formError: error.message };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteLicense(id: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("licenses").delete().eq("id", id);
  if (error) {
    throw new Error(`deleteLicense: ${error.message}`);
  }
  revalidatePath("/admin");
  redirect("/admin");
}

export async function createRule(
  _prevState: RuleActionState,
  formData: FormData
): Promise<RuleActionState> {
  const values = extractRuleInput(formData);
  const result = parseRuleForm(values);
  if (!result.payload) {
    return { values, errors: result.errors };
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("rules").insert(result.payload);
  if (error) {
    return { values, errors: {}, formError: error.message };
  }

  revalidatePath("/admin/rules");
  redirect("/admin/rules");
}

export async function updateRule(
  id: string,
  _prevState: RuleActionState,
  formData: FormData
): Promise<RuleActionState> {
  const values = extractRuleInput(formData);
  const result = parseRuleForm(values);
  if (!result.payload) {
    return { values, errors: result.errors };
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from("rules").update(result.payload).eq("id", id);
  if (error) {
    return { values, errors: {}, formError: error.message };
  }

  revalidatePath("/admin/rules");
  redirect("/admin/rules");
}

export async function deleteRule(id: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("rules").delete().eq("id", id);
  if (error) {
    throw new Error(`deleteRule: ${error.message}`);
  }
  revalidatePath("/admin/rules");
  redirect("/admin/rules");
}
