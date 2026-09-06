-- Ticket 10 — email-OTP auth. Relax users for email sign-in; allow an
-- authenticated user to create their own profile row (id = auth.uid()).
--
-- Deviation from the ticket text ("phone-OTP"): the human owner decided to
-- use Supabase's email-OTP flow instead, since the project has no SMS
-- provider configured. `users.phone` is kept (now nullable) rather than
-- dropped, so existing rows/policies are undisturbed; `email` is the new
-- identity column email-OTP sign-in actually populates.
--
-- Safe to paste into the Supabase SQL editor, or run via `supabase db push`.
-- Uses IF EXISTS / IF NOT EXISTS guards so re-running this file against a
-- project that already has it applied is a no-op, matching 0001's style.

alter table users alter column phone drop not null;
alter table users add column if not exists email text unique;

-- 0001 gave `users` owner_select + owner_update only (no insert policy) —
-- deliberately, since ticket 02 shipped before any auth flow existed. Now
-- that email-OTP (ticket 10) lets a Supabase auth user create their OWN
-- profile row on first save, add the matching owner-insert policy.
drop policy if exists users_owner_insert on users;
create policy users_owner_insert on users
  for insert to authenticated with check (id = auth.uid());
