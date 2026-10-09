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

-- Guard users.is_admin against self-promotion. The users_owner_update policy
-- in 0001 is column-agnostic (using/with check on id = auth.uid() only), so
-- without this trigger any signed-in user could self-grant admin with a direct
-- PostgREST PATCH /rest/v1/users?id=eq.<own id> {"is_admin": true} using the
-- public anon key. For the anon/authenticated roles the old value is pinned
-- silently. The service-role key (auth.role() = 'service_role') and the
-- Supabase SQL editor (no JWT, auth.role() is null) are not guarded, so the
-- first-admin bootstrap above keeps working.
create or replace function public.guard_users_is_admin()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and coalesce(auth.role(), '') in ('anon', 'authenticated') then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_users_guard_is_admin on public.users;
create trigger trg_users_guard_is_admin
  before update on public.users
  for each row execute function public.guard_users_is_admin();
