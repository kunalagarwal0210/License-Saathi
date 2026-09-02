# 08: Field-notes display tier + share

**What to build:** The clearly-labelled second tier of community "field notes" on each license, plus the ability to share the result — warning users about real-world surprises without confusing them with official requirements, and giving the list a shareable top-of-funnel.

**Blocked by:** 00 (Design foundation), 07 (Result list page)

**Status:** ready-for-agent

**Design gate — finalize before any build below (no code until this passes):**

- [ ] Visual world and tokens inherited from `docs/DESIGN.md` (ticket 00)
- [ ] This surface designed via `/impeccable shape` and finalized against `docs/DESIGN.md`
- [ ] Design reviewed and approved by Kunal

**Build — start only after the design gate above is approved:**

- [ ] Community field-notes rendered per license, visually distinct and labelled unofficial ("field notes, not law")
- [ ] Verified spine and field-notes are never visually conflated
- [ ] Share action for the result list (link/copy)
- [ ] Gracefully handles licenses with zero field-notes (cold start)
