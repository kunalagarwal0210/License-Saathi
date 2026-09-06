/**
 * Ticket 14 — pure decision logic for who gets a reminder email. No DB, no
 * I/O, so it's unit-tested directly (see `selectReminders.test.ts`, mirroring
 * `documentPack.ts`'s style). `src/app/api/reminders/route.ts` builds the
 * `ReminderCandidate[]` from Supabase and wires the resulting
 * `PlannedReminder[]` to `reminderEmail.ts` + `sendEmail.ts`.
 */

const MIN_CHECKLIST_AGE_DAYS = 3;
const MIN_DAYS_BETWEEN_REMINDERS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export type ReminderCandidate = {
  checklistId: string;
  category: string;
  userId: string;
  email: string | null;
  remindersOptOut: boolean;
  unsubscribeToken: string;
  createdAt: string;
  lastRemindedAt: string | null;
  pendingCount: number;
};

export type PlannedReminder = {
  checklistId: string;
  userId: string;
  email: string;
  category: string;
  pendingCount: number;
  unsubscribeToken: string;
};

/**
 * Decides which candidates should receive a reminder email right now.
 * A candidate qualifies only when it passes ALL of:
 *   - has at least one pending checklist item
 *   - has a real (non-empty) email on file
 *   - has not opted out of reminders
 *   - the checklist is at least `MIN_CHECKLIST_AGE_DAYS` old
 *   - never reminded, or last reminded at least `MIN_DAYS_BETWEEN_REMINDERS`
 *     days ago
 */
export function selectReminders(
  candidates: ReminderCandidate[],
  now: Date
): PlannedReminder[] {
  const planned: PlannedReminder[] = [];

  for (const candidate of candidates) {
    if (candidate.pendingCount <= 0) continue;
    if (!candidate.email) continue;
    if (candidate.remindersOptOut) continue;

    const ageMs = now.getTime() - new Date(candidate.createdAt).getTime();
    if (ageMs < MIN_CHECKLIST_AGE_DAYS * DAY_MS) continue;

    if (candidate.lastRemindedAt !== null) {
      const sinceLastReminderMs = now.getTime() - new Date(candidate.lastRemindedAt).getTime();
      if (sinceLastReminderMs < MIN_DAYS_BETWEEN_REMINDERS * DAY_MS) continue;
    }

    planned.push({
      checklistId: candidate.checklistId,
      userId: candidate.userId,
      email: candidate.email,
      category: candidate.category,
      pendingCount: candidate.pendingCount,
      unsubscribeToken: candidate.unsubscribeToken,
    });
  }

  return planned;
}
