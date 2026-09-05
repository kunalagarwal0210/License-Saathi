import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isEnabled } from "@/lib/flags";

// Admin reads/writes live DB state through the service-role client and must
// never be statically prerendered or cached — `next build` would otherwise
// try to hit Supabase at build time (and no build-time DB is guaranteed to
// exist). Applies to every route under /admin (segment config inherits down
// the tree unless a child overrides it).
export const dynamic = "force-dynamic";

// Ticket 09 — the ONLY gate for every /admin route. Server-side, flag-only
// (no password for this ticket): with FEATURE_ADMIN off, every admin
// route/sub-route 404s because every request under /admin renders this
// layout first. Operate-mode shell: a plain header + nav, no chrome beyond
// what scanning the spine needs.
export default function AdminLayout({ children }: { children: ReactNode }) {
  if (!isEnabled("FEATURE_ADMIN")) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <p className="font-signage text-xs font-semibold uppercase tracking-wide text-ink-muted">
            LicenseSaathi
          </p>
          <h1 className="font-signage text-xl font-bold text-ink">Admin</h1>
        </div>
        <nav className="flex gap-1 font-signage text-sm font-semibold">
          <Link
            href="/admin"
            className="rounded-control px-3 py-2 text-ink-secondary transition-colors hover:bg-surface-sunk hover:text-ink"
          >
            Licences
          </Link>
          <Link
            href="/admin/rules"
            className="rounded-control px-3 py-2 text-ink-secondary transition-colors hover:bg-surface-sunk hover:text-ink"
          >
            Rules
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
