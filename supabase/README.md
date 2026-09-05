# Supabase — schema & setup (Ticket 02)

This directory holds LicenseSaathi's schema-as-code. Creating the actual
Supabase project, setting env values, and running the live round-trip are
the human owner's action, not something done in this repo automatically.

## ⚠️ Dev/preview vs. production isolation

Use a **separate Supabase project for non-production** (local dev + Vercel
Preview) from the one production points at. Never point a local `.env.local`
or a Preview deployment at the production database — see
`docs/feature-flags-and-staging.md` §1 ("The Core Risk"). If you're not sure
which project your local env is pointed at, treat it as production and don't
write test data to it.

## Applying the migration

Pick one:

**Option A — SQL editor (fastest for a fresh project)**
1. Open the Supabase dashboard for your (non-production) project → SQL Editor.
2. Paste the contents of `migrations/0001_initial_schema.sql` and run it.

**Option B — Supabase CLI**
```
supabase link --project-ref <your-project-ref>
supabase db push
```

The migration is written to be safe to re-run against a project that already
has it applied (enum creation is wrapped to ignore "already exists", tables
use `IF NOT EXISTS`, policies/triggers are dropped and recreated). It is not
a full migration-history system — for schema changes after this one, add a
new `NNNN_description.sql` file rather than editing this one in place.

## Running the round-trip test

Once your project exists and the migration is applied, set the two env vars
and run the test suite:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
npm test
```

`src/lib/supabase/roundtrip.test.ts` will insert a throwaway `licenses` row,
read it back, assert equality, and delete it. With those env vars unset (the
default on a fresh checkout and in CI), the test prints a one-line skip
reason and `npm test` stays green.

## Schema notes

- Two data tiers are structurally separated and never mixed: the **verified
  spine** (`licenses` + `rules`, CHECK-enforced source stamp on verified
  rows) and **community field-notes** (`field_notes`, a separate table with
  no verified flag or source column).
- All tables have RLS enabled, deny-by-default. `licenses`/`rules` are
  public-read; `field_notes` is public-read + public-insert (moderation is
  service-role only); `users`/`saved_checklists`/`checklist_items` are
  owner-only via `auth.uid()`, ready for ticket 10's auth flow.
- The service-role key (`SUPABASE_SERVICE_ROLE_KEY`) bypasses RLS — used by
  seeding (ticket 04) and the admin panel (ticket 09), never in client code.
