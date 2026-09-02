# 11: Returning dashboard

**What to build:** The good return experience that turns this from a document into a companion. A signed-in user lands on a dashboard of their saved checklist(s) with progress at a glance.

**Blocked by:** 00 (Design foundation), 10 (Phone-OTP auth + save checklist)

**Status:** ready-for-agent

**Design gate — finalize before any build below (no code until this passes):**

- [ ] Visual world and tokens inherited from `docs/DESIGN.md` (ticket 00)
- [ ] This surface designed via `/impeccable shape` and finalized against `docs/DESIGN.md`
- [ ] Design reviewed and approved by Kunal

**Build — start only after the design gate above is approved:**

- [ ] After login, user lands on a dashboard listing their saved checklist(s)
- [ ] Each checklist shows progress ("2 of 5 done") and what's pending
- [ ] Resume into a checklist's detail
- [ ] Empty state handled for a user with no saved checklists
