/**
 * Ticket 14 — thin I/O wrapper around the Resend API. Not unit-tested (pure
 * network call); `selectReminders.ts` and `reminderEmail.ts` carry the unit
 * tests for the logic that feeds this. Deliberately raw `fetch` — no
 * `resend` npm package added, per ticket scope.
 *
 * Never throws: any failure (missing key, network error, non-2xx response)
 * comes back as `{ ok: false, error }` so a single failed send never aborts
 * the reminder batch (see `src/app/api/reminders/route.ts`).
 */
import "server-only";

export type SendReminderEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendReminderEmailResult = {
  ok: boolean;
  error?: string;
};

export async function sendReminderEmail({
  to,
  subject,
  html,
  text,
}: SendReminderEmailInput): Promise<SendReminderEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "no RESEND_API_KEY" };
  }

  const from = process.env.REMINDER_FROM ?? "LicenseSaathi <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return { ok: false, error: `Resend API error ${response.status}: ${body}` };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "unknown error" };
  }
}
