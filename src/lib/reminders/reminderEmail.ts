/**
 * Ticket 14 — pure builder for the reminder email's subject/html/text. No
 * DB, no I/O, so it's unit-tested directly (see `reminderEmail.test.ts`).
 * `src/app/api/reminders/route.ts` wires the result to `sendEmail.ts`.
 *
 * Voice matches LicenseSaathi's product voice (see PRODUCT.md/DESIGN.md):
 * friendly, encouraging, plain-language — this is a nudge from a helpful
 * guide, not a bureaucratic notice. Progress is always self-declared by the
 * user (checklist item toggles), never a claim about official/government
 * processing status — so this copy never implies otherwise.
 */

export type ReminderEmailInput = {
  category: string;
  pendingCount: number;
  checklistUrl: string;
  unsubscribeUrl: string;
};

export type ReminderEmail = {
  subject: string;
  html: string;
  text: string;
};

function stepWord(pendingCount: number): string {
  return pendingCount === 1 ? "step" : "steps";
}

export function buildReminderEmail({
  category,
  pendingCount,
  checklistUrl,
  unsubscribeUrl,
}: ReminderEmailInput): ReminderEmail {
  const word = stepWord(pendingCount);
  const subject = `You still have ${pendingCount} ${word} pending on your licensing route`;

  const bodyLine = `You still have ${pendingCount} ${word} pending on your licensing route for your ${category} business.`;
  const encouragement =
    "No rush, but a few minutes today can keep things moving — every step you check off gets you closer to being fully set up.";

  const text = [
    bodyLine,
    encouragement,
    "",
    `Pick up where you left off: ${checklistUrl}`,
    "",
    "— LicenseSaathi",
    "",
    `Stop these reminders: ${unsubscribeUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family: Hind, Arial, sans-serif; color: #1a1a1a; line-height: 1.5; max-width: 480px; margin: 0 auto;">
      <p style="font-size: 16px; margin: 0 0 12px;">${escapeHtml(bodyLine)}</p>
      <p style="font-size: 14px; color: #4a4a4a; margin: 0 0 20px;">${escapeHtml(encouragement)}</p>
      <p style="margin: 0 0 24px;">
        <a href="${escapeHtml(checklistUrl)}" style="display: inline-block; background: #3949ab; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Continue my checklist
        </a>
      </p>
      <p style="font-size: 13px; color: #8a8a8a; margin: 0;">— LicenseSaathi</p>
      <p style="font-size: 12px; color: #a0a0a0; margin: 16px 0 0;">
        <a href="${escapeHtml(unsubscribeUrl)}" style="color: #a0a0a0; text-decoration: underline;">Stop these reminders</a>
      </p>
    </div>
  `.trim();

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
