# 09: Bare-bones admin CRUD + verify-stamp

**What to build:** A protected internal panel to manage the licensing data through the app — never by editing the database directly. This is the operational home of the verified spine. Runs as a parallel track to the discovery flow.

**Blocked by:** 02 (Supabase schema + connection)

**Status:** ready-for-agent

- [ ] Protected route (only admin can access)
- [ ] Add/edit/list licenses and rules
- [ ] Set the verify-stamp (source URL + verified date) on a license
- [ ] No raw DB editing required to maintain the spine
- [ ] Flag-review and field-note promotion explicitly out of MVP scope (schema-ready, built later)
