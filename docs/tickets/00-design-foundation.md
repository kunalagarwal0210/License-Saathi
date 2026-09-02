# 00: Design foundation — visual world + design system

**What to build:** The shared design language every user-facing surface inherits, established once before any page is built. This is the "make the change easy" prefactor for design: a defined visual world (mode, palette, type scale, spacing, component tokens, motion) captured as durable, committed artifacts — so each UI ticket implements against a finalized system instead of inventing one per page. Uses the `impeccable` skill.

**Blocked by:** 01 (Scaffold + Vercel deploy skeleton) — the tokens/design system live in the real app.

**Status:** design approved (Kunal, 2026-09-02) — planning artifacts done; in-app token/component implementation carries to ticket 01 (scaffold).

> **Path note:** `PRODUCT.md` and `DESIGN.md` live at the **project root** (not `docs/`) — the `impeccable` tooling (`context.mjs`, the detector, and every per-page `/impeccable shape` gate) resolves them at root. Putting them under `docs/` would break the tooling that the UI tickets depend on.

- [x] `PRODUCT.md` written via `/impeccable init` — durable product context (audience: first-time micro-business owners in Ahmedabad; the three categories; the verified-spine vs field-notes trust model).
- [x] `DESIGN.md` established via `/impeccable` new-work — the chosen visual world **"The Route" (sequenced civic wayfinding)**: mode per surface family (Persuade for landing, Operate for the app/dashboard/admin), palette (one-job-per-color code on a cool signboard ground), typography (Overpass + Hind, language-expansion-ready), spacing/rhythm/motion, and the trust-signalling treatment that visually separates the verified spine (green seal + "verified on <date>") from community field-notes (amber "field notes, not law").
- [x] Design tokens implemented in the scaffolded app (colors, type, radii; motion tokens to follow with first animated surface) and referenced by `DESIGN.md`. Done in ticket 01 — `src/app/globals.css` `@theme` + fonts in `layout.tsx`.
- [ ] Core component primitives shaped in-app (buttons/CTA, station cards, route rail, dense list rows, verified seal vs traveller-note, form controls). All nine are **specced in `DESIGN.md`**; **decision:** each primitive is built when its first consuming UI ticket needs it (at that ticket's `/impeccable shape` gate), composed from the now-live tokens — rather than built speculatively with no surface to place them.
- [x] Mobile-first: the system is defined for small screens first (primary audience is on phones).
- [x] Foundation reviewed and approved by Kunal before any UI ticket begins. **Approved 2026-09-02** (design world "The Route" + tokens/primitives spec). UI tickets may now run their `/impeccable shape` gates against `DESIGN.md`; the in-app token/component build lands with the scaffold (01).

**Note:** This ticket blocks every user-facing ticket (05, 06, 07, 08, 09, 10, 11, 12, 15). Per-page design is **not** a separate ticket — each UI ticket carries a design gate that runs `/impeccable shape <surface>` against this `DESIGN.md` before its build begins.
