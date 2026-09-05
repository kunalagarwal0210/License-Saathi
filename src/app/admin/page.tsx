import Link from "next/link";
import { listLicenses } from "@/lib/admin/queries";
import { formatFee, formatVerifiedDate } from "@/lib/data/routeView";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteLicense } from "./actions";

// Ticket 09 — the licence list: a dense, scannable table (Operate mode).
// Server component reading straight off the service-role client; every
// write happens through the New/Edit forms, never here.
export default async function AdminLicensesPage() {
  const licenses = await listLicenses();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-signage text-lg font-semibold text-ink">
          Licences <span className="tabular-nums text-ink-muted">({licenses.length})</span>
        </h2>
        <Link
          href="/admin/licenses/new"
          className="inline-flex min-h-[40px] items-center justify-center rounded-control bg-route px-4 py-2 font-signage text-sm font-semibold text-on-route transition-colors hover:bg-route-strong"
        >
          New licence
        </Link>
      </div>

      <div className="overflow-x-auto rounded-card border border-hairline bg-surface">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline text-left font-signage text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <th className="w-9 px-3 py-2" scope="col">
                <span className="sr-only">Status</span>
              </th>
              <th className="px-3 py-2" scope="col">Name</th>
              <th className="px-3 py-2" scope="col">Category</th>
              <th className="px-3 py-2 text-right" scope="col">Fee</th>
              <th className="px-3 py-2" scope="col">Timeline</th>
              <th className="px-3 py-2" scope="col">Verified</th>
              <th className="px-3 py-2" scope="col">Source</th>
              <th className="px-3 py-2" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {licenses.map((license) => {
              const isVerified = license.status === "verified";
              return (
                <tr
                  key={license.id}
                  className="border-b border-hairline last:border-0 hover:bg-surface-sunk"
                >
                  <td className="px-3 py-2.5">
                    <span
                      aria-hidden="true"
                      title={isVerified ? "Verified" : "Flagged"}
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        isVerified ? "bg-verified" : "bg-flag"
                      }`}
                    />
                    <span className="sr-only">{isVerified ? "Verified" : "Flagged"}</span>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-ink">{license.name}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">{license.category}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-ink-secondary">
                    {formatFee(license.govt_fee_inr)}
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">{license.rough_timeline}</td>
                  <td className="px-3 py-2.5 tabular-nums text-ink-secondary">
                    {license.last_verified_date
                      ? formatVerifiedDate(license.last_verified_date)
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    {license.source_url ? (
                      <a
                        href={license.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-route underline underline-offset-2 hover:text-route-strong"
                      >
                        Source
                      </a>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/licenses/${license.id}`}
                        className="font-signage text-sm font-semibold text-route hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteLicense.bind(null, license.id)}
                        confirmMessage={`Delete "${license.name}"? This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {licenses.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-ink-muted">
                  No licences yet. Add the first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
