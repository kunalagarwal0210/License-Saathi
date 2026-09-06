/**
 * Ticket 14 — reminder email cron endpoint. Invoked daily by Vercel Cron
 * (see `vercel.json`, GET, no request body). Gated behind FEATURE_REMINDERS
 * (404 while dark) and a `CRON_SECRET` bearer check (Vercel sends this
 * header automatically once CRON_SECRET is set — see
 * https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs).
 *
 * Uses the service-role admin client (bypasses RLS) since this reads/writes
 * across every user's checklists, not a single signed-in caller's own rows.
 */
import "server-only";
import { isEnabled } from "@/lib/flags";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { selectReminders, type ReminderCandidate } from "@/lib/reminders/selectReminders";
import { buildReminderEmail } from "@/lib/reminders/reminderEmail";
import { sendReminderEmail } from "@/lib/reminders/sendEmail";

export const dynamic = "force-dynamic";

// Raw shape of one row from the joined select below — kept loose (not the
// generated Database row types) because supabase-js's embedded-resource
// typing for a `!inner` join + a one-to-many nested select doesn't resolve
// cleanly through the handwritten `Database` type; validated at runtime by
// how `toCandidates` narrows it below.
type JoinedRow = {
  id: string;
  category: string;
  created_at: string;
  last_reminded_at: string | null;
  users: {
    id: string;
    email: string | null;
    reminders_opt_out: boolean;
    unsubscribe_token: string;
  } | null;
  checklist_items: { status: string }[] | null;
};

export async function GET(request: Request) {
  if (!isEnabled("FEATURE_REMINDERS")) {
    return new Response(null, { status: 404 });
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response(null, { status: 401 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("saved_checklists")
    .select(
      "id, category, created_at, last_reminded_at, users:user_id!inner(id,email,reminders_opt_out,unsubscribe_token), checklist_items(status)"
    );

  if (error || !data) {
    return Response.json({ ok: false, error: error?.message ?? "query failed" }, { status: 500 });
  }

  const candidates = toCandidates(data as unknown as JoinedRow[]);
  const planned = selectReminders(candidates, new Date());

  let sent = 0;
  for (const reminder of planned) {
    try {
      const checklistUrl = `${origin}/checklist/${reminder.checklistId}`;
      const unsubscribeUrl = `${origin}/unsubscribe/${reminder.unsubscribeToken}`;
      const email = buildReminderEmail({
        category: reminder.category,
        pendingCount: reminder.pendingCount,
        checklistUrl,
        unsubscribeUrl,
      });

      const result = await sendReminderEmail({
        to: reminder.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      if (result.ok) {
        sent += 1;
        await admin
          .from("saved_checklists")
          .update({ last_reminded_at: new Date().toISOString() })
          .eq("id", reminder.checklistId);
      }
    } catch {
      // Never let one failed reminder abort the rest of the batch.
    }
  }

  return Response.json({ ok: true, planned: planned.length, sent });
}

function toCandidates(rows: JoinedRow[]): ReminderCandidate[] {
  const candidates: ReminderCandidate[] = [];

  for (const row of rows) {
    const user = row.users;
    if (!user) continue; // `!inner` join guarantees this in practice; guard for TS/runtime safety

    const pendingCount = (row.checklist_items ?? []).filter(
      (item) => item.status === "pending"
    ).length;

    candidates.push({
      checklistId: row.id,
      category: row.category,
      userId: user.id,
      email: user.email,
      remindersOptOut: user.reminders_opt_out,
      unsubscribeToken: user.unsubscribe_token,
      createdAt: row.created_at,
      lastRemindedAt: row.last_reminded_at,
      pendingCount,
    });
  }

  return candidates;
}
