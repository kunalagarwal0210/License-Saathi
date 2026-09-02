# License-Saathi

Micro-licensing guidance for India's small businesses. A first-time micro-business owner in **Ahmedabad** — a café, kirana shop, or salon — answers a short questionnaire and gets the **ordered** set of licenses and registrations their specific business needs: what each is, documents required, government fee, rough timeline, and a deep link to the correct official portal — each **human-verified, source-cited, and date-stamped**.

> Final Case Study — Government & Public Sector (Cohort 8). Author: Kunal Agarwal.

## Why not just ask an LLM?

A general model answers confidently but with un-cited, un-dated, city-generic information. License-Saathi's moat is **verified accuracy for one city** plus a **companion checklist** you can save, track, and return to — and a crowdsourced repository of real-world "non-happy flows" that exists nowhere else.

## Scope (MVP)

- **City:** Ahmedabad only.
- **Categories:** eatery/café, retail/kirana, salon.
- **Core:** deterministic rules engine `(category, answers) → ordered license set` (answer content is **never** LLM-generated).
- **Companion:** save-as-checklist (phone-OTP), returning dashboard with progress, printable "bring these" pack, reminders.
- **Data:** two tiers, never mixed — a **verified spine** (curated, cited, dated) and clearly-labelled **community field-notes**.

See `docs/` for the full thinking.

## Docs

| File | What it is |
|---|---|
| `docs/Problem_Space_PRD_Micro-Licensing.docx` | Problem-space PRD — who, what, evidence, personas. |
| `docs/Solution_PRD_LicenseSaathi.md` | Solution PRD — scope, moat, architecture, build cut. |
| `docs/Spec_LicenseSaathi.md` | Implementation spec — user stories, decisions, tests. |
| `docs/tickets/` | 16 tracer-bullet tickets in dependency order (incl. `00` design foundation). |
| `docs/BUILD_WORKFLOW.md` | How we build: branching, worktrees, cold review, stop caps, gates. |
| `docs/feature-flags-and-staging.md` · `docs/ai-workflow-orchestration.md` · `docs/git-worktrees.md` | Practice references behind the workflow. |

## Stack

Next.js (App Router, TypeScript) on Vercel · Tailwind CSS v4 · Supabase (Postgres + phone-OTP auth) · Mixpanel.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in values (point Supabase at a NON-production project)
npm run dev                  # http://localhost:3000
```

| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` · `npm run typecheck` | ESLint · `tsc --noEmit` |
| `npm test` · `npm run test:watch` | Vitest (unit) |

- **Design tokens** from `DESIGN.md` are implemented in `src/app/globals.css` as CSS custom properties, exposed to Tailwind via `@theme` (e.g. `bg-ground`, `text-route`, `text-verified`, `text-note`, `rounded-card`, `font-signage`). Fonts (Overpass + Hind) are wired in `src/app/layout.tsx`.
- **Feature flags** use `isEnabled("FEATURE_X")` (`src/lib/flags.ts`) — server-side, "ship dark" (off unless the env var is exactly `"true"`). Values live on the host, never committed. See `docs/feature-flags-and-staging.md`.
- **Env:** real values live on Vercel, scoped per environment; `.env.example` documents the required names only.

## Build order

Start at `docs/tickets/01`. Frontier: **01 → {00, 02} → {03, 05, 09} → 04 → 06 → 07 → {08, 10} → {11, 13} → 12 → 14 → 15**.

Ticket `00` (design foundation) is a prefactor: it produces `PRODUCT.md` + `DESIGN.md` and blocks every user-facing ticket. Per-page design is not its own ticket — each UI ticket (05, 06, 07, 08, 09, 10, 11, 12, 15) carries a **design gate** (`/impeccable shape` against `DESIGN.md`) that must be finalized and approved before its build begins.
