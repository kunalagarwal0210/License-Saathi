# 00: Design foundation — visual world + design system

**What to build:** The shared design language every user-facing surface inherits, established once before any page is built. This is the "make the change easy" prefactor for design: a defined visual world (mode, palette, type scale, spacing, component tokens, motion) captured as durable, committed artifacts — so each UI ticket implements against a finalized system instead of inventing one per page. Uses the `impeccable` skill.

**Blocked by:** 01 (Scaffold + Vercel deploy skeleton) — the tokens/design system live in the real app.

**Status:** ready-for-agent

- [ ] `docs/PRODUCT.md` written via `/impeccable init` — durable product context (audience: first-time micro-business owners in Ahmedabad; the three categories; the verified-spine vs field-notes trust model).
- [ ] `docs/DESIGN.md` established via `/impeccable` new-work/`document` — the chosen visual world: mode per surface family (Persuade for landing, Operate for the app/dashboard/admin), palette, typography, spacing/rhythm, and the trust-signalling treatment that visually separates the verified spine from community field-notes.
- [ ] Design tokens implemented in the scaffolded app (colors, type, spacing, radii, motion) and referenced by `DESIGN.md`.
- [ ] Core component primitives shaped (buttons/CTA, cards, list rows, badges/stamps for "verified on <date>" vs "field notes, not law", form controls) — enough for the UI tickets to compose against.
- [ ] Mobile-first: the system is defined for small screens first (primary audience is on phones).
- [ ] Foundation reviewed and approved by Kunal before any UI ticket begins.

**Note:** This ticket blocks every user-facing ticket (05, 06, 07, 08, 09, 10, 11, 12, 15). Per-page design is **not** a separate ticket — each UI ticket carries a design gate that runs `/impeccable shape <surface>` against this `DESIGN.md` before its build begins.
