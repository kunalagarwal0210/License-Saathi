# 01: Scaffold + Vercel deploy skeleton

**What to build:** A running Next.js application deployed live on Vercel, showing a blank/placeholder page. This is the foundation "make the change easy" prefactor — nothing user-facing yet, but every later ticket builds on a real, deployed app.

**Blocked by:** None (can start immediately)

**Status:** code done — all local deliverables built and verified; the Vercel steps below need Kunal's account.

- [x] Next.js app created and runs locally — Next 16 (App Router, TS) + Tailwind v4. `npm run build`, `typecheck`, `lint`, and `test` all pass; dev server serves `/` (200) with the DESIGN.md fonts/tokens loaded.
- [ ] Project deploys to Vercel and the placeholder page is reachable at a public URL — **needs Kunal's Vercel account** (see handoff below).
- [ ] Repo connected to Vercel so every PR/branch auto-gets a **preview URL** (staging on real infra) — **needs Kunal** (one-time GitHub↔Vercel import).
- [~] Environment variables scoped per environment (Production / Preview / Development) — **`.env.example` committed** with required names (Supabase/Mixpanel) and no values; **setting them on Vercel needs Kunal**.
- [x] Feature-flag convention in place: `isEnabled('FEATURE_X')` (`src/lib/flags.ts`) reading `process.env`, "ship dark" default-off, unit-tested. Known flags typed from `docs/feature-flags-and-staging.md`.
- [x] Repo committed with a clear baseline.

**Also done (unblocks ticket 00):** DESIGN.md tokens implemented in-app (`src/app/globals.css` `@theme`), fonts wired (`layout.tsx`), Vitest test harness established for the TDD workflow. A branded **placeholder** page only (the real Landing is ticket 05, behind its own design gate).

### Vercel handoff (Kunal — needs your account)
1. **Import the repo** at <https://vercel.com/new> → select `kunalagarwal0210/License-Saathi`. Framework auto-detects as Next.js. This also wires **auto preview URLs** on every PR/branch.
2. **Set env vars** (Project → Settings → Environment Variables) for **Production / Preview / Development** — the names in `.env.example` (Supabase values come from ticket 02; use a **non-production** Supabase project for Preview/Development per `docs/feature-flags-and-staging.md`).
3. **Deploy** — the placeholder goes live at the project URL. Or from the repo root: `! vercel` (link) then `! vercel --prod`.

See `docs/feature-flags-and-staging.md` for the env/flags/staging discipline every later ticket follows (flip → build → prove).
