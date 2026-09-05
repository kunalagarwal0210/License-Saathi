-- LicenseSaathi — initial schema (Ticket 02)
--
-- Two data tiers, structurally separated and never mixed:
--   - Verified spine: `licenses` + `rules`. A `status='verified'` license MUST
--     carry a real source_url + last_verified_date (enforced by CHECK below).
--   - Community field-notes: `field_notes`, a separate table. It can never
--     carry a "verified" flag or a source stamp — do not add field-note
--     content as a column on `licenses`.
--
-- Safe to paste into the Supabase SQL editor, or run via `supabase db push`.
-- Uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS guards so re-running
-- this file against a project that already has it applied is a no-op rather
-- than an error. It is NOT a true no-op migration system (see supabase/README.md).

-- ── Enums ────────────────────────────────────────────────────────────────

do $$ begin
  create type business_category as enum ('eatery', 'retail', 'salon');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type license_status as enum ('verified', 'flagged');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type field_note_status as enum ('new', 'reviewing', 'promoted', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type checklist_item_status as enum ('pending', 'done');
exception when duplicate_object then null;
end $$;

-- ── Tables ───────────────────────────────────────────────────────────────

-- Verified spine: one row per license/permit.
create table if not exists licenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  category business_category not null,
  govt_fee_inr integer, -- nullable; whole rupees
  rough_timeline text not null,
  portal_deep_link text not null,
  required_documents text[] not null default '{}',
  source_url text,
  last_verified_date date,
  status license_status not null default 'verified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_verified_has_source check (
    status <> 'verified'
    or (source_url is not null and btrim(source_url) <> '' and last_verified_date is not null)
  )
);

-- Verified spine: which licenses apply, and under what conditions.
--
-- `condition` is an answer-key predicate the rules engine (ticket 03)
-- evaluates against the user's questionnaire answers, e.g.:
--   {"turnover_band": "above_40L"}
--   {"seating": "gte_50"}
--   {"premises_type": "cloud_kitchen"}
--   {"alcohol": true}
--   {}                                -- always applies
create table if not exists rules (
  id uuid primary key default gen_random_uuid(),
  category business_category not null,
  condition jsonb not null,
  license_id uuid not null references licenses(id) on delete cascade,
  sequence integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rules_category on rules(category);

-- App profile. `id` may later mirror the Supabase auth uid (ticket 10).
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists saved_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  category business_category not null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references saved_checklists(id) on delete cascade,
  license_id uuid not null references licenses(id) on delete cascade,
  status checklist_item_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (checklist_id, license_id)
);

-- Community field-notes — structurally separate from the verified spine.
-- No "verified" flag, no source_url/last_verified_date column: field-notes
-- can never masquerade as verified data.
create table if not exists field_notes (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references licenses(id) on delete cascade,
  what_happened text not null,
  extra_doc text,
  extra_fee integer,
  reporter_contact text,
  status field_note_status not null default 'new',
  created_at timestamptz not null default now()
);

-- ── updated_at trigger ───────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_licenses_set_updated_at on licenses;
create trigger trg_licenses_set_updated_at
  before update on licenses
  for each row execute function set_updated_at();

drop trigger if exists trg_rules_set_updated_at on rules;
create trigger trg_rules_set_updated_at
  before update on rules
  for each row execute function set_updated_at();

-- ── Row-Level Security ───────────────────────────────────────────────────
-- Deny-by-default: RLS is enabled on every table, then narrow policies are
-- added below. The service-role key (server/admin only) bypasses RLS
-- entirely — that is intended, and is how seeding (ticket 04) and the admin
-- panel (ticket 09) write to the verified spine and moderate field-notes.

alter table licenses enable row level security;
alter table rules enable row level security;
alter table users enable row level security;
alter table saved_checklists enable row level security;
alter table checklist_items enable row level security;
alter table field_notes enable row level security;

-- licenses / rules: public read-only. No anon/auth write.
drop policy if exists licenses_select_public on licenses;
create policy licenses_select_public on licenses
  for select to anon, authenticated using (true);

drop policy if exists rules_select_public on rules;
create policy rules_select_public on rules
  for select to anon, authenticated using (true);

-- field_notes: community can submit; no anon/auth update/delete/select on
-- the raw table (moderation is service-role only, and reporter_contact is
-- PII that must never be exposed to public readers — see field_notes_public
-- view below, which is the only public read path).
drop policy if exists field_notes_insert_public on field_notes;
create policy field_notes_insert_public on field_notes
  for insert to anon, authenticated with check (status = 'new');

drop policy if exists field_notes_select_public on field_notes;

-- users / saved_checklists / checklist_items: owner-only via auth.uid().
-- Schema-ready for ticket 10 auth; deny-by-default is the safe MVP posture
-- (no anon/auth policies exist yet beyond these owner checks).
drop policy if exists users_owner_select on users;
create policy users_owner_select on users
  for select to authenticated using (id = auth.uid());

drop policy if exists users_owner_update on users;
create policy users_owner_update on users
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists saved_checklists_owner_all on saved_checklists;
create policy saved_checklists_owner_all on saved_checklists
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists checklist_items_owner_all on checklist_items;
create policy checklist_items_owner_all on checklist_items
  for all to authenticated
  using (
    exists (
      select 1 from saved_checklists sc
      where sc.id = checklist_items.checklist_id
        and sc.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from saved_checklists sc
      where sc.id = checklist_items.checklist_id
        and sc.user_id = auth.uid()
    )
  );

-- ── Public field-notes view (no PII) ────────────────────────────────────
-- field_notes.reporter_contact is PII (phone/email) and must never be
-- exposed to public readers. The base table has no anon/authenticated
-- SELECT policy at all (see field_notes RLS above), so reporter_contact is
-- never directly reachable. This view is the deliberately curated, PII-free
-- public projection: security_invoker = off (the default, stated explicitly
-- here) means it runs as its OWNER, bypassing the base table's RLS, so it
-- returns rows to anon/authenticated instead of the zero rows you'd get if
-- the view enforced the base table's (policy-less) RLS against the caller.
-- This is the standard Postgres "safe public view" pattern: the view's own
-- column list is the access control. Community/UI reads (ticket 08) must
-- query this view, never the base field_notes table directly.
create or replace view field_notes_public
  with (security_invoker = off) as
  select
    id,
    license_id,
    what_happened,
    extra_doc,
    extra_fee,
    status,
    created_at
  from field_notes;

grant select on field_notes_public to anon, authenticated;
