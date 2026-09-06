"use client";

import { useState } from "react";
import { createSupabaseBrowserAuthClient } from "@/lib/supabase/browser-auth";

type GoogleSignInButtonProps = {
  /**
   * Where the user lands after the round-trip through Google and back
   * through `/auth/callback`. Defaults to the current path+search so a
   * caller with no opinion (e.g. `SaveChecklist`, invoked from a results
   * page) returns the user to the same page they started on.
   */
  next?: string;
  label?: string;
};

// Ticket 16 — additive second sign-in option next to the existing email-OTP
// flow (`SaveChecklist.tsx`, `DashboardSignIn.tsx`). Same session-in-cookies
// client as OTP (`browser-auth.ts`) so the PKCE code verifier it writes is
// readable by the server when `/auth/callback` exchanges the code — a plain
// `client.ts` client would not share that cookie jar.
export function GoogleSignInButton({ next, label = "Continue with Google" }: GoogleSignInButtonProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    setMessage("");
    setPending(true);
    try {
      const supabase = createSupabaseBrowserAuthClient();
      const target = next ?? window.location.pathname + window.location.search;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`,
        },
      });
      if (error) {
        setMessage(error.message || "Could not start Google sign-in. Please try again.");
        setPending(false);
        return;
      }
      // On success the browser is about to navigate away to Google, so
      // `pending` stays true — there's no "success" state to render here.
    } catch {
      setMessage("Could not start Google sign-in. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-control border border-hairline bg-surface px-4 font-signage text-sm font-semibold text-ink transition hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60"
      >
        <GoogleMark className="h-4 w-4" />
        {pending ? "Redirecting…" : label}
      </button>
      <p aria-live="polite" className="text-[13px] leading-relaxed text-ink-secondary">
        {message}
      </p>
    </div>
  );
}

/** Small "or" divider for callers to place between the email form and this
 * button — kept out of the button itself so callers control the layout. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-hairline" />
      <span className="font-signage text-xs font-semibold uppercase text-ink-muted">or</span>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}
