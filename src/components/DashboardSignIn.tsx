"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserAuthClient } from "@/lib/supabase/browser-auth";
import { isValidEmail, isValidOtp } from "@/lib/checklist/saveChecklist";

type Step = "email" | "code" | "error";

// Ticket 11 — the same email-OTP mechanics as `SaveChecklist.tsx` (same
// Supabase Auth flow, same session-in-cookies client), but with no save step:
// a returning user just needs a session so the dashboard server component
// can find their `saved_checklists` rows. On success we `router.refresh()`
// rather than navigate, so `dashboard/page.tsx` re-runs with the new session
// and swaps this component out for the checklist list itself.
export function DashboardSignIn() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string>("");
  const [pending, setPending] = useState(false);

  async function handleEmailSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setMessage("");

    if (!isValidEmail(email)) {
      setMessage("Enter a valid email address.");
      return;
    }

    setPending(true);
    try {
      const supabase = createSupabaseBrowserAuthClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) {
        setStep("error");
        setMessage(error.message);
        return;
      }
      setStep("code");
      setMessage(`We emailed a 6-digit code to ${email.trim()}.`);
    } catch {
      setStep("error");
      setMessage("Something went wrong sending the code. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleCodeSubmit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setMessage("");

    if (!isValidOtp(code)) {
      setMessage("Enter the 6-digit code from your email.");
      return;
    }

    setPending(true);
    try {
      const supabase = createSupabaseBrowserAuthClient();
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (error) {
        setMessage(error.message || "That code didn't work. Check it and try again.");
        setPending(false);
        return;
      }
      router.refresh();
    } catch {
      setMessage("Something went wrong verifying the code. Please try again.");
      setPending(false);
    }
  }

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-3 rounded-card border border-hairline bg-route-tint px-5 py-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-signage text-sm font-bold text-ink">
          Sign in to see your saved routes
        </h2>
        <p className="text-[13px] leading-relaxed text-ink-secondary">
          Same quick email code you used to save a checklist &mdash; no
          password.
        </p>
      </div>

      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
          <label htmlFor="dashboard-signin-email" className="font-signage text-xs font-semibold text-ink">
            Email address
          </label>
          <input
            id="dashboard-signin-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="min-h-[44px] rounded-control border border-hairline bg-surface px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-route"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[44px] items-center justify-center rounded-control bg-route px-4 font-signage text-sm font-semibold text-on-route transition hover:bg-route/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60"
          >
            {pending ? "Sending code…" : "Email me a code"}
          </button>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={handleCodeSubmit} className="flex flex-col gap-2">
          <label htmlFor="dashboard-signin-code" className="font-signage text-xs font-semibold text-ink">
            6-digit code
          </label>
          <input
            id="dashboard-signin-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="123456"
            className="min-h-[44px] rounded-control border border-hairline bg-surface px-3 text-sm tracking-[0.3em] text-ink outline-none focus-visible:ring-2 focus-visible:ring-route"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[44px] items-center justify-center rounded-control bg-route px-4 font-signage text-sm font-semibold text-on-route transition hover:bg-route/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60"
          >
            {pending ? "Verifying…" : "Verify and sign in"}
          </button>
        </form>
      )}

      {step === "error" && (
        <button
          type="button"
          onClick={() => {
            setCode("");
            setMessage("");
            setStep("email");
          }}
          disabled={pending}
          className="inline-flex min-h-[44px] items-center justify-center rounded-control border border-route px-4 font-signage text-sm font-semibold text-route transition hover:bg-route-tint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60"
        >
          Try again
        </button>
      )}

      <p aria-live="polite" className="text-[13px] leading-relaxed text-ink-secondary">
        {message}
      </p>
    </div>
  );
}
