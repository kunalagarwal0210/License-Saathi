import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { evaluateAdminAccess, type AdminAccess } from "./evaluateAdminAccess";

/**
 * Resolves the caller's admin access from the server-validated session.
 * Uses getUser() (validates with the auth server), then reads the caller's
 * own `users` row under RLS. A missing row or query error is "forbidden".
 */
export async function requireAdmin(): Promise<AdminAccess> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user ?? null;
  if (!user) return evaluateAdminAccess(null, null);

  const { data: row, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return "forbidden";
  return evaluateAdminAccess({ id: user.id }, row);
}
