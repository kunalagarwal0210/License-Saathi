import Link from "next/link";
import { listRules } from "@/lib/admin/queries";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteRule } from "../actions";

// Ticket 09 — the rules list: category, condition, licence (by name),
// sequence. Kept minimal but real, matching the licences table's density.
export default async function AdminRulesPage() {
  const rules = await listRules();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-signage text-lg font-semibold text-ink">
          Rules <span className="tabular-nums text-ink-muted">({rules.length})</span>
        </h2>
        <Link
          href="/admin/rules/new"
          className="inline-flex min-h-[40px] items-center justify-center rounded-control bg-route px-4 py-2 font-signage text-sm font-semibold text-on-route transition-colors hover:bg-route-strong"
        >
          New rule
        </Link>
      </div>

      <div className="overflow-x-auto rounded-card border border-hairline bg-surface">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline text-left font-signage text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <th className="px-3 py-2" scope="col">Category</th>
              <th className="px-3 py-2 text-right" scope="col">Seq</th>
              <th className="px-3 py-2" scope="col">Licence</th>
              <th className="px-3 py-2" scope="col">Condition</th>
              <th className="px-3 py-2" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b border-hairline last:border-0 hover:bg-surface-sunk">
                <td className="px-3 py-2.5 text-ink-secondary">{rule.category}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-ink-secondary">{rule.sequence}</td>
                <td className="px-3 py-2.5 font-medium text-ink">
                  {rule.license_name ?? <span className="text-flag">Missing licence</span>}
                </td>
                <td className="px-3 py-2.5 font-mono text-[12px] text-ink-secondary">
                  {Object.keys(rule.condition).length === 0
                    ? "always applies"
                    : JSON.stringify(rule.condition)}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/rules/${rule.id}`}
                      className="font-signage text-sm font-semibold text-route hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteRule.bind(null, rule.id)}
                      confirmMessage="Delete this rule? This cannot be undone."
                    />
                  </div>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-ink-muted">
                  No rules yet. Add the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
