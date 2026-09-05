"use client";

import { useState } from "react";

// Ticket 08 — share action for the results/route screen. A navigation/action
// affordance (route-indigo styling, not a note or verified signal). Uses the
// Web Share API when available (mobile), otherwise copies the current URL to
// the clipboard and shows a brief confirmation.
export function ShareRoute() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // User cancelled the native share sheet, or it failed — fall through
        // to clipboard copy so the action still does something useful.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (permissions/insecure context) — nothing more we
      // can do without a fallback UI; fail silently rather than crash.
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-control px-1 font-signage text-sm font-semibold text-route underline decoration-route/30 underline-offset-2 hover:decoration-route focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <ShareIcon className="h-4 w-4" />
        Share this route
      </button>
      <span aria-live="polite" className="text-xs font-medium text-ink-muted">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}

function ShareIcon({ className }: { className?: string }) {
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
      <path d="M11.5 5.5a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5ZM4.5 9.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5ZM11.5 14a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" />
      <path d="m6.05 8.8 4.4 2.65M10.45 4.55l-4.4 2.65" />
    </svg>
  );
}
