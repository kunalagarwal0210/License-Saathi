-- Admin-auth ticket 02 — DB foundation: users.is_admin + handle_new_user trigger.
--
-- FIRST-ADMIN BOOTSTRAP (run by hand in the Supabase SQL editor, after the
-- owner's first sign-in has created their users row):
--
--   update users set is_admin = true where email = '<owner-email>';
--
-- Safe to paste into the Supabase SQL editor. Uses IF NOT EXISTS / OR REPLACE /
-- DROP ... IF EXISTS guards so re-running this file is a no-op, matching
-- 0001-0003. Hand-apply: there is no CLI/connection string in this repo.

alter table users add column if not exists is_admin boolean not null default false;

-- Mirror every new auth.users row into public.users (id = auth uid, which the
-- owner RLS policies rely on). Idempotent: `on conflict do nothing` with no
-- target swallows a clash on either the id primary key or the email unique
-- constraint, so the existing owner-insert save path (0002) and this trigger
-- can never make each other throw.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists trg_auth_users_handle_new_user on auth.users;
create trigger trg_auth_users_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();
