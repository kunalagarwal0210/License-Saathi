/**
 * Ticket 09 — read helpers for the admin panel.
 *
 * These call the service-role admin client (`getSupabaseAdmin`, itself
 * `server-only`), so this module must only ever be imported from server
 * components / server actions — never from a client component.
 */
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { LicensesRow, RulesRow } from "@/lib/supabase/types";

export async function listLicenses(): Promise<LicensesRow[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("licenses")
    .select()
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`listLicenses: ${error.message}`);
  return data ?? [];
}

export async function getLicense(id: string): Promise<LicensesRow | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("licenses").select().eq("id", id).maybeSingle();
  if (error) throw new Error(`getLicense: ${error.message}`);
  return data;
}

export type RuleWithLicenseName = RulesRow & { license_name: string | null };

export async function listRules(): Promise<RuleWithLicenseName[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("rules")
    .select("*, licenses(name)")
    .order("category", { ascending: true })
    .order("sequence", { ascending: true });
  if (error) throw new Error(`listRules: ${error.message}`);
  return (data ?? []).map((row) => {
    const { licenses, ...rest } = row as RulesRow & { licenses: { name: string } | null };
    return { ...rest, license_name: licenses?.name ?? null };
  });
}

export async function getRule(id: string): Promise<RulesRow | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("rules").select().eq("id", id).maybeSingle();
  if (error) throw new Error(`getRule: ${error.message}`);
  return data;
}

/** For the rule form's licence <select> — id + name only, ordered for scanning. */
export async function listLicenseOptions(): Promise<{ id: string; name: string }[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("licenses")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw new Error(`listLicenseOptions: ${error.message}`);
  return data ?? [];
}
