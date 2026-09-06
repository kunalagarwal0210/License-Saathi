import Link from "next/link";
import { notFound } from "next/navigation";
import { isEnabled } from "@/lib/flags";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type UnsubscribePageProps = {
  params: Promise<{ token: string }>;
};

// Ticket 14 — one-click unsubscribe from reminder emails, reached from every
// reminder email's footer link. Gated behind FEATURE_REMINDERS (same flag as
// the reminder cron job — no reminders means no unsubscribe surface either).
// Uses the service-role admin client (not session-aware) because the caller
// is anonymous — the unsubscribe token itself IS the authorization. Neutral,
// idempotent confirmation regardless of whether the token matched a user,
// so this page never leaks whether a given token exists.
export const dynamic = "force-dynamic";

export default async function UnsubscribePage({ params }: UnsubscribePageProps) {
  if (!isEnabled("FEATURE_REMINDERS")) {
    notFound();
  }

  const { token } = await params;

  try {
    const admin = getSupabaseAdmin();
    await admin.from("users").update({ reminders_opt_out: true }).eq("unsubscribe_token", token);
  } catch {
    // Swallow — the confirmation below is intentionally the same either way.
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-12">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-4 text-center">
        <h1 className="font-signage text-[26px] font-bold leading-tight tracking-tight text-ink">
          You&rsquo;re unsubscribed
        </h1>
        <p className="text-sm leading-relaxed text-ink-secondary">
          You won&rsquo;t get reminder emails from LicenseSaathi.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-control bg-route px-4 font-signage text-sm font-semibold text-on-route transition hover:bg-route/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Back to LicenseSaathi
        </Link>
      </div>
    </main>
  );
}
