# Handoff — LicenseSaathi: build in progress (design foundation + scaffold DONE)

**Written:** 2026-09-05. **Previous phase:** design foundation (ticket 00) + scaffold (ticket 01) — both finalized, approved, and merged.

## ⏰ Timing — read first
- **Submission target: 6 September 2026 (tomorrow).** The Solution PRD's honest ~4-day cut is nearly spent. Prioritize the **Must-ship** path over completeness (see build cut below).
- **Must-ship** (demo is dead without it): Landing → Questionnaire → **verified ordered licence list with citations + portal links** (screens 1–3) + minimal admin CRUD to enter seed rules (screen 9). That alone is a coherent, defensible product.
- **Should-ship** (companion thesis / North Star): Login + returning dashboard + checklist mark-done (screens 4–6).
- **Cut-first, in order** if time runs out: field-note capture (7) → reminder email (8) → then trim checklist. If cut, still *pitch* the loop in the PRD (it's the vision), just don't build it.

## Next session's job
Continue the tracer-bullet build, honoring the **per-page design gate** (every UI ticket runs `/impeccable shape <surface>` against `DESIGN.md`, finalized + **approved by Kunal**, before its build). Next buildable ticket on the frontier is **02 (schema)**; **05 (landing)** is the highest-value UI surface for the demo and unblocks the Must-ship path.

## Repo & environment
- **Working dir / git repo:** `C:\Users\Asus\Desktop\builders-bible-excercises\Class Excercises\Ease of doing business solution`
- **Remote:** `https://github.com/kunalagarwal0210/License-Saathi.git`
- **TRUNK: `main`.** Branch from `origin/main`, merge back to `main` **via PR after cold review** — **never push to `main` directly**. This matches `docs/BUILD_WORKFLOW.md` §3, `docs/git-worktrees.md`, and `docs/feature-flags-and-staging.md`. (Historical note: a `design-foundation` branch was used briefly and then abandoned once `main` was confirmed as the trunk — do not resurrect it.)
- **`gh` is authenticated** as `kunalagarwal0210` (repo scope) — you can open PRs. Merge to `main` only via PR; let Kunal approve merges (he has been merging on request).
- **Git identity:** Kunal / kunalagarwal0210@gmail.com. Commit trailers: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Worktree-per-ticket flow (works well):** `git worktree add -b <ticket-branch> .claude/worktrees/<ticket-branch> origin/main` → enter it → `npm install` first → build → PR into `main`. Base worktrees off **origin/main**. Clean up the worktree+branch (local+remote) after merge. Before every push: `git diff main..HEAD --stat` — only this feature's files should appear.
- Local-only, gitignored: `.claude/`, `.scratch/`, `.impeccable/build|mocks|review/`, `*.tsbuildinfo`.
- **Stale worktree to clean up:** `.claude/worktrees/ticket-01-scaffold` (branch merged) is likely still on disk — remove it: `git worktree remove` + delete branch local/remote.

## Source of truth (read first — do NOT duplicate)
- **`PRODUCT.md`** (project ROOT) — durable product truth (audience, verified-spine vs field-notes trust model, voice, scope). Written via `/impeccable init`.
- **`DESIGN.md`** (project ROOT) — the committed visual world "The Route". **Both live at ROOT, not `docs/`** — the `impeccable` tooling resolves them there; every `/impeccable shape` gate reads them.
- `docs/BUILD_WORKFLOW.md` — the umbrella build/execution model (branching, worktrees, merge gates, stop caps). Ties together the three references below. **Still open:** §6 model/role lineup table is a `TBD` placeholder.
- `docs/git-worktrees.md` — worktree rules and the empty-worktree "green tests lie" trap.
- `docs/ai-workflow-orchestration.md` — orchestrator / workers / cold-reviewer pattern; two dials (model + reasoning) per role; stop caps.
- `docs/feature-flags-and-staging.md` — env/flags/staging discipline (flip → build → prove). **RISK flagged there:** ticket 02 must ensure dev/preview use a **separate Supabase project** from production.
- `docs/Solution_PRD_LicenseSaathi.md`, `docs/Problem_Space_PRD_Micro-Licensing.docx`, `docs/Spec_LicenseSaathi.md` — PRDs + spec.
- `docs/tickets/00..15-*.md` — 16 tickets in dependency order (00 + 01 now done; each UI ticket carries a Design gate).
- `README.md` — overview + local-dev instructions.

## Product in one line
Micro-licensing guidance for first-time small-business owners in **Ahmedabad only** (café/eatery, retail/kirana, salon). Short questionnaire → **ordered** set of licences, each with plain description, docs, govt fee, timeline, and a deep link to the official portal — human-verified, source-cited, date-stamped. Companion: save-as-checklist (phone-OTP), returning dashboard, printable pack, reminders. Data is two tiers **never mixed**: **verified spine** vs. labelled **community field-notes**. Stack: Next.js (Vercel) · Supabase (Postgres + phone-OTP) · Mixpanel.

## Status — what's DONE
- **Ticket 00 (design foundation) — DONE, approved (Kunal, 2026-09-02), merged (PR #1).**
  - `PRODUCT.md` + `DESIGN.md` at root. Name recorded as **LicenseSaathi**; voice **friendly/encouraging**; **English MVP, built to add a 2nd language (Gujarati) without rework**.
- **Ticket 01 (scaffold) — code DONE, verified, merged (PR #2).**
  - **Next.js 16 (App Router, TS) + Tailwind v4.** `build`/`typecheck`/`lint`/`test` all pass; dev server serves `/` (200).
  - DESIGN.md **tokens implemented** in `src/app/globals.css` via Tailwind `@theme` (`bg-ground`, `text-route`/`verified`/`note`, `rounded-card`, `font-signage`, light+dark). Fonts **Overpass + Hind** wired in `layout.tsx` (Hind = latin-only for now; Devanagari/Gujarati subset added with the language feature).
  - **Feature flags:** `isEnabled('FEATURE_X')` server-side helper (`src/lib/flags.ts`), ship-dark default-off, typed to known `FEATURE_*`, **unit-tested**. **Vitest** harness added (TDD).
  - `.env.example` documents env var NAMES only. Branded **placeholder** page only (real Landing = ticket 05).

## The design system in brief ("The Route")
Chosen via the `impeccable` direction roll (deliberately OFF the government-paper cliché). **Sequenced civic wayfinding:** licensing as a numbered, signposted journey to "shop open, legal."
- **Palette:** light-first, cool signboard ground, **one-job-per-color** code — indigo `--route` (primary/path), green `--verified` (spine/✓/done), amber `--note` (field-notes), red `--flag` (re-verify/error). Dark = role swaps.
- **Type:** Overpass (signage register) + Hind (body, Indian-foundry, language-expansion path).
- **Signature primitives (specced in DESIGN.md, built per-surface at each shape gate):** route rail + stop nodes, **station card** (a verified licence), **verified seal** (green ✓ "verified on <date>" + source link), **traveller-note** (amber "field notes, not law").
- **Load-bearing invariant:** verified spine and field-notes are **never mixed** — different color, container, language. Design's #1 job on every surface that shows both.

## Build frontier — where we are
`01 → {00, 02} → {03, 05, 09} → 04 → 06 → 07 → {08, 10} → {11, 13} → 12 → 14 → 15`
- **Done:** 01, 00.
- **Now buildable:** **02 (schema)**, **03 (rules engine)**, **05 (landing)**, **09 (admin)**. For the demo, **05 (landing)** + the 02→03→06→07 result path is the Must-ship spine. 02/03 are non-UI (no design gate); 05/09 are UI (design gate first).

## OUTSTANDING — Vercel (Kunal's action, not yet confirmed done)
Ticket 01's remaining boxes need Kunal's Vercel account and were **in progress at last session (not confirmed live)**:
1. Import `kunalagarwal0210/License-Saathi` at vercel.com/new (auto-detects Next.js; wires **preview URLs** per PR).
2. **Production Branch = `main`** (Vercel's default for a connected repo — leave it as `main`). Each PR against `main` gets its own preview URL for the design-gate review.
3. Set env vars per environment (names in `.env.example`; **non-prod Supabase** for Preview/Dev). Placeholder needs none yet.
> Next session: ask Kunal whether Vercel is live and get the preview URL — each UI ticket's design gate is meant to be reviewed on its **preview URL** (per feature-flags doc). If Vercel isn't up, UI review falls back to local `npm run dev` screenshots.

## Design-gate model (do NOT re-litigate — committed)
- Each UI ticket (05, 06, 07, 08, 09, 10, 11, 12, 15) carries a top-of-ticket **Design gate**: `/impeccable shape <surface>` against `DESIGN.md`, finalized + **approved by Kunal**, before any build checkbox. Per-page design is NOT its own ticket.
- Non-UI tickets (02, 03, 04, 13) have no gate. Ticket 14 (reminder email) left out of the hard gate for now.
- **Decision recorded:** the 9 component primitives are built when their first consuming UI ticket needs them (composed from the live tokens), not speculatively.

## How to work (Kunal's stated preferences)
- Engineering-manager posture: clarify goal, scope, flag risk early, give a recommendation at decision points (not an exhaustive list). Direct and concise; lead with outcome; name assumptions/cut corners.
- **One surface at a time; each finalized and approved before the next.** No building a UI surface until its design is locked.
- Branch-based; worktree per ticket; PR into `main` after cold review; **never push to `main` directly**; let Kunal merge (or he authorizes).
- He follows from another device — use `SendUserFile` to put deliverables (DESIGN.md, screenshots, preview) in front of him.

## Suggested skills for the next agent (Skill tool)
- **`superpowers:brainstorming`** — before any UI design/creative work.
- **`impeccable`** — drives every per-page design gate (`/impeccable shape <surface>`). Run `node <skill-base>/scripts/context.mjs` once per session (cwd = project root, where PRODUCT.md/DESIGN.md live).
- **`superpowers:test-driven-development`** — Vitest harness is set up; use it for the rules engine (ticket 03) especially.
- **`superpowers:writing-plans`** / **`superpowers:executing-plans`** — for sequencing the remaining build under time pressure.
- **`artifact-design`** — if showing designs as artifacts/mockups.

## Notes
- No secrets/PII committed. Env files gitignored; `.env.example` has names only.
- Toolchain: Node v24, npm 11. `impeccable` + `handoff` skills installed globally.
