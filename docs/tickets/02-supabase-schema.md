# 02: Supabase schema + connection

**What to build:** A Supabase project connected to the app, with the full data model migrated. The app can read from and write to the database. Two data tiers are structurally separated so community field-notes can never contaminate the verified spine.

**Blocked by:** 01 (Scaffold + Vercel deploy skeleton)

**Status:** ready-for-agent

- [ ] Supabase project created and connected to the app via env vars
- [ ] **Dev/preview isolated from production data:** a separate Supabase project (or Supabase branch) for Development/Preview, so local and preview writes never touch the production verified-spine or user data (see `docs/feature-flags-and-staging.md` §1). Confirm which DB each environment points at.
- [ ] Tables migrated: `licenses`, `rules`, `users`, `saved_checklists`, `checklist_items`, `field_notes`
- [ ] `licenses` carries `source_url`, `last_verified_date`, `status` (verified/flagged); `field_notes` carries `status` (new/reviewing/promoted/rejected)
- [ ] A trivial read/write round-trip is demonstrated from the app
