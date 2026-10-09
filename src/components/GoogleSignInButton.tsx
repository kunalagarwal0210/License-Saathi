"use client";

import { useState } from "react";
import { createSupabaseBrowserAuthClient } from "@/lib/supabase/browser-auth";

type GoogleSignInButtonProps = {
  /** Relative path to return to after sign-in. Defaults to `/`. */
  next?: string;
};

// Ticket 04 — additive Google sign-in, shown beside (never instead of) the
// email-OTP form. The PKCE code comes back to `/auth/callback`, which swaps it
// for a session cookie. Provider setup is a go-live step; until then a click
// just fails at the provider and we show the inline message below.
export function GoogleSignInButton({ next = "/" }: GoogleSignInButtonProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleClick() {
    setMessage("");
    setPending(true);
    try {
      const supabase = createSupabaseBrowserAuthClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setMessage(error.message);
        setPending(false);
      }
      // On success the browser is navigating to Google; leave pending on.
    } catch {
      setMessage("Could not start Google sign-in. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-xs text-ink-secondary">or</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex min-h-[44px] items-center justify-center rounded-control border border-route px-4 font-signage text-sm font-semibold text-route transition hover:bg-route-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60"
      >
        {pending ? "Redirecting…" : "Continue with Google"}
      </button>
      <p aria-live="polite" className="text-[13px] leading-relaxed text-ink-secondary">
        {message}
      </p>
    </div>
  );
}
