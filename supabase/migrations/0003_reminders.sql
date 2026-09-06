-- Ticket 14 — reminder emails. Adds the columns the reminder cron job
-- (`/api/reminders`) and the unsubscribe page (`/unsubscribe/[token]`) need:
--   - `users.reminders_opt_out`: set true by the unsubscribe page; the cron
--     job's candidate query must exclude opted-out users.
--   - `users.unsubscribe_token`: an unguessable per-user token embedded in
--     every reminder email's footer link, so a recipient can opt out without
--     signing in.
--   - `saved_checklists.last_reminded_at`: lets the cron job space reminders
--     out (never remind the same checklist more than once every 7 days —
--     see `src/lib/reminders/selectReminders.ts`).
--
-- No RLS changes: both the reminder job and the unsubscribe page use the
-- service-role admin client (`src/lib/supabase/admin.ts`), which bypasses
-- RLS entirely — these columns need no owner-scoped policy.
--
-- Safe to paste into the Supabase SQL editor, or run via `supabase db push`.
-- Uses IF NOT EXISTS guards so re-running this file against a project that
-- already has it applied is a no-op, matching 0001/0002's style.

alter table users
  add column if not exists reminders_opt_out boolean not null default false;

alter table users
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists idx_users_unsubscribe_token on users(unsubscribe_token);

alter table saved_checklists
  add column if not exists last_reminded_at timestamptz;
