# 12: Checklist detail — mark-done + printable pack

**What to build:** The Should-ship companion mechanic. Inside a saved checklist the user can track each license to completion and produce a printable document pack to take to the office.

**Blocked by:** 00 (Design foundation), 11 (Returning dashboard)

**Status:** ready-for-agent

**Design gate — finalize before any build below (no code until this passes):**

- [ ] Visual world and tokens inherited from `docs/DESIGN.md` (ticket 00) — includes the printable "bring these" pack layout
- [ ] This surface designed via `/impeccable shape` and finalized against `docs/DESIGN.md`
- [ ] Design reviewed and approved by Kunal

**Build — start only after the design gate above is approved:**

- [ ] Checklist detail lists each license with pending/done state
- [ ] User can mark a license done / undo, and progress updates
- [ ] Printable "bring these" document pack per checklist (aggregated required documents)
- [ ] State persists across sessions
