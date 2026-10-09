export type AdminAccess = "anonymous" | "forbidden" | "ok";

/**
 * Pure admin-gate decision. No IO. Provider-agnostic: only `is_admin` counts.
 * - no authenticated user          -> "anonymous"
 * - user but no row / not an admin -> "forbidden"
 * - user with is_admin === true    -> "ok"
 */
export function evaluateAdminAccess(
  authUser: { id: string } | null,
  profileRow: { is_admin: boolean } | null
): AdminAccess {
  if (!authUser) return "anonymous";
  if (!profileRow || profileRow.is_admin !== true) return "forbidden";
  return "ok";
}
