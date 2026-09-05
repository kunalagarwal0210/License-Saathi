# Handoff — LicenseSaathi: build in progress (00 design + 01 scaffold + 02 schema DONE)

**Written:** 2026-09-05 (updated). **Done so far:** ticket 00 (design foundation), 01 (scaffold), and 02 (Supabase schema) — all finalized, reviewed, and merged to `main`. Ticket 02's live database is created, migrated, and proven (round-trip test passes).

## ⏰ Timing — read first
- **Submission target: 6 September 2026 (tomorrow).** The Solution PRD's honest ~4-day cut is nearly spent. Prioritize the **Must-ship** path over completeness (see build cut below).
- **Must-ship** (demo is dead without it): Landing → Questionnaire → **verified ordered licence list with citations + portal links** (screens 1–3) + minimal admin CRUD to enter seed rules (screen 9). That alone is a coherent, defensible product.
- **Should-ship** (companion thesis / North Star): Login + returning dashboard + checklist mark-done (screens 4–6).
- **Cut-first, in order** if time runs out: field-note capture (7) → reminder email (8) → then trim checklist. If cut, still *pitch* the loop in the PRD (it's the vision), just don't build it.

## Next session's job
Build **03 (rules engine)** next — it is the core logic (deterministic `(category, answers) → ordered licence set`), non-UI, no design gate, TDD-first (Vitest is set up). It unblocks the questionnaire (06) and result list (07).

**Ticket 03 must define the questionnaire answer-keys** (turnover_band, seating, area, premises_type, alcohol) — these are the contract the questionnaire UI (06) presents. Do NOT copy the prototype's turnover bands from the UI spec; 03 defines the real ones from Ahmedabad/verified rules.

**UI design is finalized** in `docs/UI_IMPLEMENTATION_SPEC.md` (from Figma Make + Lovable; consistent with DESIGN.md tokens + trust rules). The UI tickets (05, 06, 07, 09) build from it. `docs/FIGMA_DESIGN_BRIEF.md` is the token/contract companion. Two flags for later: the spec's questionnaire wording (Lovable) is good copy but the answer-keys come from 03; licence fee may be a range vs. our single-integer `govt_fee_inr` — reconcile in ticket 04 (possibly a schema tweak). Not yet received: the `LicenseSaathi App Design.zip` Figma export (screens); the spec's tokens/anatomy are enough to build from.

**Design-approach update (committed this session):** the design *system* is already done (DESIGN.md + tokens in code). For the deadline, per-screen design is NOT run through a separate `/impeccable shape` mock gate; instead screens are built from the tokens and finalized **visually on the running app** (screenshots / preview), which Kunal approves. Kunal's Figma screens feed this.

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
- **`docs/UI_IMPLEMENTATION_SPEC.md`** — the finalized UI/frontend spec for tickets 05/06/07/09 (Figma + Lovable; matches DESIGN.md). **`docs/FIGMA_DESIGN_BRIEF.md`** — the token + per-screen-content contract that keeps design and code in sync.
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
- **Ticket 02 (Supabase schema) — code DONE, reviewed, merged (PR #4); live DB proven.**
  - `supabase/migrations/0001_initial_schema.sql` — 6 tables (`licenses`, `rules`, `users`, `saved_checklists`, `checklist_items`, `field_notes`), 4 enums, FKs/cascades, `updated_at` trigger, RLS on every table (deny-by-default).
  - **Two-tier invariant enforced structurally:** `chk_verified_has_source` CHECK blocks a `verified` licence with no `source_url` + `last_verified_date`; `field_notes` is a separate table that cannot carry a verified stamp. Reporter PII is served only via the `field_notes_public` view (omits `reporter_contact`, `security_invoker=off`); the raw `field_notes` table has no anon SELECT. Anon field-note inserts are forced to `status='new'`.
  - `src/lib/supabase/` — typed client (`client.ts`, `admin.ts` with a hard `import 'server-only'` guard), handwritten `Database` types (use `type`, NOT `interface` — supabase-js@2.115 generic resolution breaks with `interface`), env-guarded round-trip test. Lazy init (build needs no env).
  - **Live DB:** a Supabase **dev** project is created, the migration is applied, and the round-trip test PASSES against it. (A separate production project is deferred until real deploy.)
  - Deferred minors for later tickets: ticket 08 reads field-notes via `field_notes_public` (not `.insert().select()` on the base table); ticket 04 seeder must supply `source_url` + `last_verified_date` (or set `flagged`).
- **Model lineup pinned (PR #5):** `BUILD_WORKFLOW.md` §6 + `ai-workflow-orchestration.md` §3 now name Opus 4.8 orchestrator / Sonnet workers (Opus for hard tickets) / Opus cold reviewer @ max. This is the method used from ticket 02 on (orchestrator + subagent-driven-development: fresh worker subagent per ticket, cold-review subagent before merge).

## The design system in brief ("The Route")
Chosen via the `impeccable` direction roll (deliberately OFF the government-paper cliché). **Sequenced civic wayfinding:** licensing as a numbered, signposted journey to "shop open, legal."
- **Palette:** light-first, cool signboard ground, **one-job-per-color** code — indigo `--route` (primary/path), green `--verified` (spine/✓/done), amber `--note` (field-notes), red `--flag` (re-verify/error). Dark = role swaps.
- **Type:** Overpass (signage register) + Hind (body, Indian-foundry, language-expansion path).
- **Signature primitives (specced in DESIGN.md, built per-surface at each shape gate):** route rail + stop nodes, **station card** (a verified licence), **verified seal** (green ✓ "verified on <date>" + source link), **traveller-note** (amber "field notes, not law").
- **Load-bearing invariant:** verified spine and field-notes are **never mixed** — different color, container, language. Design's #1 job on every surface that shows both.

## Build frontier — where we are
`01 → {00, 02} → {03, 05, 09} → 04 → 06 → 07 → {08, 10} → {11, 13} → 12 → 14 → 15`
- **Done:** 00, 01, 02.
- **Now buildable:** **03 (rules engine)**, **05 (landing)**, **09 (admin)**. For the demo, the **03→06→07** result path + **05 (landing)** is the Must-ship spine. 03 is non-UI (no design gate); 05/09 are UI (build from Figma screens + live tokens).

## Infra status — Kunal's accounts
- **Supabase — LIVE for dev.** A dev project exists, the migration is applied, and the round-trip PASSES. Keys are in local `.env.local` (gitignored). Still TODO: a **separate production** Supabase project before any real public launch (then swap the Vercel Production keys).
- **Vercel — LIVE.** Repo connected; Production branch = `main`; the 3 Supabase keys are set on **all** environments (dev project, for now). Deployed site: **https://license-saathi.vercel.app/** (HTTP 200, placeholder page). Every PR now gets its own preview URL. Rule: after changing any env var, **redeploy** (vars bake at build time).

## Design-gate model (UPDATED this session for the deadline)
- The design **system** is done (DESIGN.md + tokens in `globals.css`). That big decision is locked.
- **Per-screen design is now build-then-review, not mock-first.** For the deadline we do NOT run a separate `/impeccable shape` mock gate per UI ticket. Instead: Kunal designs the screen in **Figma** against `docs/FIGMA_DESIGN_BRIEF.md` (which pins the exact tokens + per-screen content so there is no rework), the worker builds it from the live tokens, and Kunal approves the **running screen** (screenshot/preview). The old ticket text still says `/impeccable shape` — treat this handoff as the current rule.
- Non-UI tickets (02, 03, 04, 13) have no design step. Ticket 14 (reminder email) has no hard gate.
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
