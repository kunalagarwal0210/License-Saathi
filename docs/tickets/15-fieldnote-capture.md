# 15: Field-note capture form

**What to build:** How real-world "non-happy flows" get harvested — captured post-filing via the reminder, as structured per-license data that seeds the community tier and (post-MVP) the freshness pipeline. Cut-first tier.

**Blocked by:** 00 (Design foundation), 14 (Reminder email), 08 (Field-notes display tier + share)

**Status:** ready-for-agent

**Design gate — finalize before any build below (no code until this passes):**

- [ ] Visual world and tokens inherited from `docs/DESIGN.md` (ticket 00)
- [ ] This surface designed via `/impeccable shape` and finalized against `docs/DESIGN.md`
- [ ] Design reviewed and approved by Kunal

**Build — start only after the design gate above is approved:**

- [ ] From the reminder, a per-license "anything unexpected?" structured form (which license, what happened, extra doc/step/fee)
- [ ] Submissions stored in `field_notes` with status `new`
- [ ] Captured field-notes surface in the display tier (08), labelled unofficial
- [ ] Structured (not free-text) so entries are usable as data later
