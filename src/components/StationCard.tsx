import type { VerifiedLicense } from "@/lib/data/verified";
import { formatFee, formatVerifiedDate } from "@/lib/data/routeView";
import { PortalLink } from "@/components/PortalLink";

type StationCardProps = {
  license: VerifiedLicense;
};

// One licence "stop" on the route (ticket 07). Server component — the
// scannable head (name, status, fee, timeline, trust line, portal CTA) is
// always visible; the denser detail (plain-language description + document
// checklist) lives in a native <details> so there's no client JS and it works
// server-rendered. Verified vs flagged is the ONLY status split here and it is
// backed by the data's `status`; community field-notes (amber, ticket 08) are
// a different tier and are not rendered on this screen.
export function StationCard({ license }: StationCardProps) {
  const isVerified = license.status === "verified";

  return (
    <article className="flex flex-col gap-3 rounded-card border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(22,32,44,0.04)]">
      {/* Head — name + status pill */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-signage text-lg font-bold leading-tight tracking-tight text-ink">
          {license.name}
        </h2>
        <StatusPill isVerified={isVerified} />
      </div>

      {/* Meta — fee + timeline (tabular, scannable) */}
      <dl className="flex flex-wrap gap-x-6 gap-y-1 font-signage text-[13px] font-medium tabular-nums text-ink-secondary">
        <div className="flex items-baseline gap-1.5">
          <dt className="uppercase tracking-wide text-ink-muted">Fee</dt>
          <dd className="text-ink">{formatFee(license.govtFeeInr)}</dd>
        </div>
        <div className="flex items-baseline gap-1.5">
          <dt className="uppercase tracking-wide text-ink-muted">Timeline</dt>
          <dd className="text-ink">{license.roughTimeline}</dd>
        </div>
      </dl>

      {/* Trust line — verified seal OR honest flag. Never both, never green
          for a flagged row (the load-bearing two-tier invariant). */}
      {isVerified ? (
        <VerifiedSeal
          date={license.lastVerifiedDate}
          sourceUrl={license.sourceUrl}
        />
      ) : (
        <FlagLine />
      )}

      {/* Expandable detail — description + documents. Kept collapsed so the
          route stays scannable and doesn't become a wall of text. */}
      <details className="group border-t border-hairline pt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-signage text-sm font-semibold text-route [&::-webkit-details-marker]:hidden">
          <span>What you&rsquo;ll need &amp; how it works</span>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </summary>

        <div className="flex flex-col gap-4 pt-3">
          <p className="text-sm leading-relaxed text-ink-secondary">
            {license.description}
          </p>

          {license.requiredDocuments.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="font-signage text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Documents to keep ready
              </p>
              <ul className="flex flex-col gap-1.5">
                {license.requiredDocuments.map((doc) => (
                  <li key={doc} className="flex items-start gap-2.5 text-sm text-ink">
                    <span
                      aria-hidden="true"
                      className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded border border-hairline bg-surface-sunk"
                    />
                    <span className="leading-snug">{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>

      {/* Primary action — deep link to the correct official portal. Wrapped in
          a client component (ticket 13) so clicking it fires
          `portal_link_clicked` without making this card a client component. */}
      <PortalLink
        href={license.portalDeepLink}
        licenseId={license.id}
        licenseName={license.name}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control bg-route px-4 py-2.5 font-signage text-sm font-semibold text-on-route transition-colors hover:bg-route-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        Open official portal
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path d="M6 3h7v7M13 3 6 10M11 9v4H3V5h4" />
        </svg>
      </PortalLink>
    </article>
  );
}

function StatusPill({ isVerified }: { isVerified: boolean }) {
  if (isVerified) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-verified-tint px-2.5 py-1 font-signage text-xs font-semibold text-verified">
        <CheckIcon className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-flag-tint px-2.5 py-1 font-signage text-xs font-semibold text-flag">
      <FlagIcon className="h-3.5 w-3.5" />
      Confirm locally
    </span>
  );
}

function VerifiedSeal({
  date,
  sourceUrl,
}: {
  date: string | null;
  sourceUrl: string | null;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-control bg-verified-tint px-3 py-2 font-signage text-[13px] font-medium text-verified">
      <span className="inline-flex items-center gap-1.5">
        <CheckIcon className="h-4 w-4" />
        <span>
          Verified
          {date && (
            <>
              <span aria-hidden="true" className="mx-1.5 text-verified/50">
                ·
              </span>
              {formatVerifiedDate(date)}
            </>
          )}
        </span>
      </span>
      {sourceUrl && (
        <>
          <span aria-hidden="true" className="text-verified/40">
            ·
          </span>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline decoration-verified/40 underline-offset-2 hover:decoration-verified"
          >
            Source
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-3 w-3"
            >
              <path d="M6 3h7v7M13 3 6 10M11 9v4H3V5h4" />
            </svg>
          </a>
        </>
      )}
    </div>
  );
}

function FlagLine() {
  return (
    <div className="flex items-start gap-2 rounded-control bg-flag-tint px-3 py-2 font-signage text-[13px] font-medium text-flag">
      <FlagIcon className="mt-[2px] h-4 w-4 shrink-0" />
      <span className="leading-snug">
        Not yet source-verified &mdash; confirm the exact rule and fee with the
        office before you rely on this step.
      </span>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 8.5 6.2 12 13 4" />
    </svg>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 14V2.5M4 3h7l-1.5 2.5L11 8H4" />
    </svg>
  );
}
