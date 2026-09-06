"use client";

import type { ReactNode } from "react";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

type PortalLinkProps = {
  href: string;
  licenseId: string;
  licenseName: string;
  className?: string;
  children: ReactNode;
};

// Thin client wrapper around StationCard's "Open official portal" anchor so
// the anchor itself can stay a plain external link (same target/rel as
// before) while still firing `portal_link_clicked` — the funnel step that
// shows the user actually acted on a recommendation, not just viewed it.
export function PortalLink({ href, licenseId, licenseName, className, children }: PortalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track(ANALYTICS_EVENTS.portalLinkClicked, { licenseId, licenseName })}
    >
      {children}
    </a>
  );
}
