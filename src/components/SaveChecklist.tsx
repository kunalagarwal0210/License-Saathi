"use client";

import { useState } from "react";
import { createSupabaseBrowserAuthClient } from "@/lib/supabase/browser-auth";
import { isValidEmail, isValidOtp } from "@/lib/checklist/saveChecklist";
import { saveChecklist } from "@/app/results/[category]/actions";
import type { Answers, BusinessCategory } from "@/lib/engine/types";

type SaveChecklistProps = {
  category: BusinessCategory;
  answers: Answers;
};

type Step = "idle" | "email" | "code" | "saving" | "done" | "error";

// Ticket 10 — value-first auth. Discovery/results stay fully login-free;
// this is the ONLY place a login is ever asked for, framed as unlocking a
// benefit ("save your route"), not a wall. Email-OTP (not phone — no SMS
// provider; see docs/tickets/10-otp-auth-save.md for the deviation) via
// Supabase Auth, session landed in cookies by `browser-auth.ts` so the
// `saveChecklist` server action (session-aware) can see the same user.
export function SaveChecklist({ category, answers }: SaveChecklistProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string>("");
  const [pending, setPending] = useState(false);

  async function handleSaveClick() {
    setOpen(true);
    setMessage("");

    // Already signed in from an earlier save on this device — skip straight
    // to saving rather than asking for the email again.
    setPending(true);
    try {
      const supabase = createSupabaseBrowserAuthClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await persistChecklist();
      } else {
        setStep("email");
      }
    } catch {
      setStep("email");
    } finally {
      setPending(false);
    }
  }

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
      await persistChecklist();
    } catch {
      setMessage("Something went wrong verifying the code. Please try again.");
      setPending(false);
    }
  }

  async function persistChecklist() {
    setStep("saving");
    setMessage("");
    try {
      const result = await saveChecklist({ category, answers });
      if (!result.ok) {
        if (result.reason === "unauthenticated") {
          // Session didn't actually land (shouldn't happen after verifyOtp,
          // but fail safely) — send the user back to the email step.
          setStep("email");
          setMessage("Please verify your email to save your checklist.");
        } else {
          setStep("error");
          setMessage(result.message ?? "Could not save your checklist. Please try again.");
        }
        return;
      }
      setStep("done");
      setMessage("Saved — we'll keep your checklist so you can track it.");
    } catch {
      setStep("error");
      setMessage("Could not save your checklist. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleSaveClick}
        disabled={pending}
        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-control bg-route px-4 font-signage text-sm font-semibold text-on-route transition hover:bg-route/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60"
      >
        <SaveIcon className="h-4 w-4" />
        Save my checklist
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-card border border-hairline bg-route-tint px-5 py-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-signage text-sm font-bold text-ink">Save your route</h2>
        <p className="text-[13px] leading-relaxed text-ink-secondary">
          We&rsquo;ll keep this checklist so you can come back and track each
          step. Just a quick email code — no password.
        </p>
      </div>

      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
          <label htmlFor="save-checklist-email" className="font-signage text-xs font-semibold text-ink">
            Email address
          </label>
          <input
            id="save-checklist-email"
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
          <label htmlFor="save-checklist-code" className="font-signage text-xs font-semibold text-ink">
            6-digit code
          </label>
          <input
            id="save-checklist-code"
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
            {pending ? "Verifying…" : "Verify and save"}
          </button>
        </form>
      )}

      {step === "saving" && (
        <p className="text-sm font-medium text-ink-secondary">Saving your checklist…</p>
      )}

      {step === "done" && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-verified">
          <CheckIcon className="h-4 w-4" />
          {message}
        </p>
      )}

      <p aria-live="polite" className="text-[13px] leading-relaxed text-ink-secondary">
        {step !== "done" ? message : ""}
      </p>
    </div>
  );
}

function SaveIcon({ className }: { className?: string }) {
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
      <path d="M3 3h8l2 2v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M5 3v3h5V3M5 9.5h6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <path d="m3 8.5 3 3 7-7" />
    </svg>
  );
}
