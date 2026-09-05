# Handoff — LicenseSaathi: build in progress (00–06 DONE; 07 in progress)

**Written:** 2026-09-05 (updated through ticket 06). **Done so far:** tickets 00 (design foundation), 01 (scaffold), 02 (Supabase schema), **03 (rules engine)**, **04 (verified seed data)**, **05 (landing + category picker)**, **06 (branching questionnaire)** — all finalized, reviewed, and merged to `main`. Ticket **07 (result list / Route screen)** is the Must-ship payoff and is being built now. The public flow is demoable end to end (landing → category → questionnaire → results stub) on `main`.

## ⏰ Timing — read first
- **Submission target: 6 September 2026 (tomorrow).** The Solution PRD's honest ~4-day cut is nearly spent. Prioritize the **Must-ship** path over completeness (see build cut below).
- **Must-ship** (demo is dead without it): Landing → Questionnaire → **verified ordered licence list with citations + portal links** (screens 1–3) + minimal admin CRUD to enter seed rules (screen 9). **03→04→05→06 are DONE; 07 (the detailed result list) is in progress and is the last core piece of this spine.** 09 (admin) still to do.
- **Should-ship** (companion thesis / North Star): Login + returning dashboard + checklist mark-done (screens 4–6 → tickets 10, 11, 12).
- **Cut-first, in order** if time runs out: field-note capture (15) → reminder email (14) → then trim checklist. If cut, still *pitch* the loop in the PRD (it's the vision), just don't build it.

## Next session's job
Finish **07 (result list / Route screen)** if still in flight, then **09 (admin CRUD)** to complete the Must-ship spine. After that: **08 (field-notes display + share)**, then the Should-ship companion (**10 OTP → 11 dashboard → 12 checklist**), then analytics (**13**), then cut-first (**14, 15**).

## Cross-ticket contracts locked this session (DO NOT drift)
- **Answer-key contract (from ticket 03)** — the questionnaire (06) presents these; the engine consumes them:
  - `turnover_band`: `under_12L | 12L_to_20L | 20L_to_40L | over_40L` (boundaries on the FSSAI ₹12L and GST ₹20L/₹40L lines)
  - `seating_band` (eatery): `none | under_50 | 50_plus`
  - `area_band` (retail/salon): `small | large`
  - `premises_type`: `on_premise | cloud_kitchen` (eatery) · `rented | owned` (retail/salon)
  - `alcohol`: boolean (eatery)
- **Engine ↔ DB reconciliation (ticket 04):** DB `rules.sequence` → engine `License.order`; `dependsOn: []` for every row (ordering via `order`, not a dependency graph — the engine's topo-sort degenerates to an order sort). DB `rules.condition` jsonb == engine `conditions` (array value = set-membership). No schema change was needed.
- **Routing contracts:**
  - Landing CTA → `/questionnaire/[category]` (`eatery|retail|salon`; category in the URL path).
  - Questionnaire completion → `/results/[category]?<answers as query params>` (answers in the URL: survive refresh, shareable, no login). **Ticket 07 renders this route for real.**
- **Fees (ticket 04 policy):** `govt_fee_inr` integer where clean (GST 0, FSSAI Basic 100); `null` + range-in-`description` where it varies. No schema change.

## Data trust status (ticket 04) — spot-check queue for Kunal
Verified spine (official source fetched): **Shops & Establishment** (enagar.gujarat.gov.in), **GST** (gstcouncil.gov.in), **FSSAI Basic + State** (foscos.fssai.gov.in). **Flagged (out of the verified spine, honestly labelled):** Fire NOC, Eating House / Trade / Health licences, Professional Tax, and the Gujarat liquor-prohibition row. **Root cause of most flags:** `ahmedabadcity.gov.in` (AMC) failed TLS verification from the build agent's sandbox — likely fine from a normal browser. **`docs/verified-data-review.md`** is the spot-check sheet; top priority is confirming the AMC / Fire-NOC rows (and the 50-seat Fire-NOC threshold used in 06 is one of these flagged values). Gujarat prohibition handled honestly: `alcohol:true` → a flagged row stating the real local truth (no standard venue liquor licence outside GIFT City), not a fabricated generic-India step.

## Repo & environment
- **Working dir / git repo:** `C:\Users\Asus\Desktop\builders-bible-excercises\Class Excercises\Ease of doing business solution`
- **Remote:** `https://github.com/kunalagarwal0210/License-Saathi.git`
- **TRUNK: `main`.** Branch from `origin/main`, merge back to `main` **via PR after cold review** — **never push to `main` directly**. This matches `docs/BUILD_WORKFLOW.md` §3, `docs/git-worktrees.md`, and `docs/feature-flags-and-staging.md`.
- **`gh` is authenticated** as `kunalagarwal0210` (repo scope) — you can open PRs. Merge to `main` only via PR; let Kunal approve merges (he authorizes on request).
- **Git identity:** Kunal / kunalagarwal0210@gmail.com. Commit trailers: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` + `Claude-Session: <session URL>`.
- **Worktree-per-ticket flow (works well):** `git worktree add -b <ticket-branch> .claude/worktrees/<ticket-branch> origin/main` (or the EnterWorktree tool) → `npm install` first → build → PR into `main`. Base off **origin/main**. Clean up worktree+branch (local+remote) after merge. Before every push: `git diff main..HEAD --stat` — only this feature's files should appear.
  - **Windows note:** `ExitWorktree --remove` often can't delete the worktree directory (file lock); follow with `git worktree prune` + `rm -rf .claude/worktrees/<name>` + `git branch -D <branch>` from the main checkout.
- Local-only, gitignored: `.claude/`, `.scratch/`, `.impeccable/build|mocks|review/`, `*.tsbuildinfo`.

## Source of truth (read first — do NOT duplicate)
- **`PRODUCT.md`** (project ROOT) — durable product truth (audience, verified-spine vs field-notes trust model, voice, scope).
- **`DESIGN.md`** (project ROOT) — the committed visual world "The Route". **Both live at ROOT, not `docs/`.**
- **`docs/UI_IMPLEMENTATION_SPEC.md`** — the finalized UI/frontend spec for tickets 05/06/07/09. **`docs/FIGMA_DESIGN_BRIEF.md`** — the token + per-screen-content contract.
- **`docs/verified-data-review.md`** — ticket-04 spot-check sheet (verified vs flagged rows + sources).
- `docs/BUILD_WORKFLOW.md`, `docs/git-worktrees.md`, `docs/ai-workflow-orchestration.md`, `docs/feature-flags-and-staging.md` — build/workflow references.
- `docs/Solution_PRD_LicenseSaathi.md`, `docs/Problem_Space_PRD_Micro-Licensing.docx`, `docs/Spec_LicenseSaathi.md` — PRDs + spec.
- `docs/tickets/00..15-*.md` — 16 tickets in dependency order.
- `README.md` — overview + local-dev instructions.

## Product in one line
Micro-licensing guidance for first-time small-business owners in **Ahmedabad only** (café/eatery, retail/kirana, salon). Short questionnaire → **ordered** set of licences, each with plain description, docs, govt fee, timeline, and a deep link to the official portal — human-verified, source-cited, date-stamped. Companion: save-as-checklist (phone-OTP), returning dashboard, printable pack, reminders. Data is two tiers **never mixed**: **verified spine** vs. labelled **community field-notes**. Stack: Next.js (Vercel) · Supabase (Postgres + phone-OTP) · Mixpanel.

## Status — what's DONE
- **Ticket 00 (design foundation) — DONE, approved, merged (PR #1).** `PRODUCT.md` + `DESIGN.md` at root. Name **LicenseSaathi**; voice friendly/encouraging; English MVP, built to add Gujarati without rework.
- **Ticket 01 (scaffold) — DONE, merged (PR #2).** Next.js 16 (App Router, TS) + Tailwind v4. DESIGN.md tokens in `src/app/globals.css` via `@theme`. Overpass + Hind fonts. Feature flags (`src/lib/flags.ts`). Vitest harness.
- **Ticket 02 (Supabase schema) — DONE, merged (PR #4); live dev DB proven.** `supabase/migrations/0001_initial_schema.sql` — 6 tables, 4 enums, RLS deny-by-default, two-tier invariant enforced structurally (`chk_verified_has_source`; `field_notes` separate table + `field_notes_public` view). Typed `src/lib/supabase/` (use `type`, NOT `interface`). Deferred: ticket 08 reads field-notes via `field_notes_public`.
- **Ticket 03 (rules engine) — DONE, merged (PR #9, merge `68e6cae`).** `src/lib/engine/` — pure `resolveLicenses(category, answers, rulesSource) → OrderedLicense[]`: condition matching (equality / set-membership / wildcard) + Kahn's topological sort with stable `(order, id)` tie-break; throws on cycles; no DB/UI imports. 13 TDD tests against in-memory fixtures. Defined the **answer-key contract** (above).
- **Ticket 04 (verified seed data) — DONE, merged (PR #10, merge `f20c4ab`).** `src/lib/data/verified.ts` — real Ahmedabad data (`VerifiedLicense` rows, one per category, + `verifiedRulesSource`). `scripts/seed-verified.ts` (idempotent Supabase seed; run with `npm run seed:verified` + dev env — not yet executed against live DB). `docs/verified-data-review.md` spot-check sheet. Persona tests pass the engine against real data. Verified vs flagged split + AMC TLS blocker (see Data trust status). `src/lib/supabase/types.ts` widened `RuleCondition` to allow array values (type-only).
- **Ticket 05 (landing + category picker) — DONE, Kunal-approved on running screen, merged (PR #11, merge `77035dc`).** `src/app/page.tsx` (real landing per spec §9) + `src/components/CategoryPicker.tsx` / `CategoryCard.tsx` / `CategoryIcon.tsx` + `src/lib/categories.ts` (categories + `isCategory()` + `getQuestionnaireHref()`). Selected-state token pattern established (route border + `route-tint` bg + filled check). Stub route `/questionnaire/[category]` (06 replaced it).
- **Ticket 06 (branching questionnaire) — DONE, Kunal-approved on running screen, merged (PR #12, merge `6a390a8`).** `src/lib/questionnaire.ts` (pure per-category question config + `showIf` branching + answer↔URL serialization) + `src/lib/questionnaire.test.ts` + `src/components/QuestionnaireFlow.tsx` + real `src/app/questionnaire/[category]/page.tsx`. One-question-at-a-time guided journey, dynamic progress, Back/Continue. Eatery branches (seating only if on_premise). On completion runs the engine on real data and routes to `/results/[category]?<answers>`. **Minimal results stub** at `src/app/results/[category]/page.tsx` (07 replaces it with station cards).

## Method used this session (orchestrator + workers)
- **Pro-subscription-friendly:** worker subagents run on **Sonnet** (not Opus) to fit Pro rate limits; the orchestrator (Opus 4.8) does the cold review itself rather than spawning an Opus-max reviewer. One fresh Sonnet worker subagent per ticket, TDD/build-first, `npm install` in the fresh worktree first.
- **Verification before merge:** orchestrator independently re-runs `test`/`typecheck`/`lint`/`build`, checks `git diff --name-only main..HEAD` scope, and reads the key files before opening the PR.
- **UI design gate = build-then-review on the running app:** worker builds from tokens + spec; orchestrator runs the dev server (`npm run dev -- -p <port>`), screenshots via the Chrome tools, and sends previews to Kunal with `SendUserFile`; Kunal approves the running screen, then merge. (No separate `/impeccable shape` mock gate for the deadline.)
- **Testing corner (all UI tickets):** no React Testing Library in the repo, so interaction/render is not unit-tested; instead the pure logic (categories, questionnaire, engine) is extracted into modules and unit-tested. Adding RTL is an open follow-up if wanted.

## The design system in brief ("The Route")
Deliberately OFF the government-paper cliché. **Sequenced civic wayfinding:** licensing as a numbered, signposted journey to "shop open, legal."
- **Palette:** light-first, one-job-per-color — indigo `route` (path), green `verified` (spine/✓/date), amber `note` (field-notes), red `flag` (re-verify/error). Dark = role swaps.
- **Type:** Overpass (signage) + Hind (body, language-expansion path).
- **Signature primitives:** route rail + stop nodes, **station card**, **verified seal** (green ✓ "verified on <date>" + source), **traveller-note** (amber "field notes, not law").
- **Load-bearing invariant:** verified spine and field-notes are **never mixed** — different color, container, language.

## Build frontier — where we are
`01 → {00, 02} → {03, 05, 09} → 04 → 06 → 07 → {08, 10} → {11, 13} → 12 → 14 → 15`
- **Done:** 00, 01, 02, 03, 04, 05, 06.
- **In progress:** **07 (result list / Route screen)** — the Must-ship payoff.
- **Now buildable next:** **09 (admin CRUD)** (finishes Must-ship), **08 (field-notes display + share)**, **10 (OTP auth + save)**.

## Infra status — Kunal's accounts
- **Supabase — LIVE for dev.** Dev project exists, migration applied, round-trip PASSES. Keys in local `.env.local` (gitignored). Still TODO: a **separate production** project before real launch. Ticket-04 seed script has NOT yet been run against the dev DB (the app currently reads verified data from the TS module `src/lib/data/verified.ts`, not the DB).
- **Vercel — LIVE.** Repo connected; Production branch = `main`; 3 Supabase keys set on all environments (dev project). Deployed: **https://license-saathi.vercel.app/**. Every PR gets a preview URL. After changing any env var, **redeploy** (vars bake at build time).

## How to work (Kunal's stated preferences)
- Engineering-manager posture: clarify goal, scope, flag risk early, give a recommendation at decision points. Direct and concise; lead with outcome; name assumptions/cut corners.
- **One surface at a time; each finalized and approved before the next.**
- Branch-based; worktree per ticket; PR into `main` after cold review; **never push to `main` directly**; let Kunal merge (or he authorizes).
- He follows from another device — use `SendUserFile` to put deliverables (screenshots/preview) in front of him.

## Suggested skills for the next agent (Skill tool)
- **`superpowers:brainstorming`** — before UI/creative work.
- **`superpowers:test-driven-development`** — Vitest harness set up.
- **`superpowers:writing-plans`** / **`superpowers:executing-plans`** — sequencing under time pressure.
- **`artifact-design`** — if showing designs as artifacts/mockups.

## Notes
- No secrets/PII committed. Env files gitignored; `.env.example` has names only.
- Toolchain: Node v24, npm 11. `impeccable` + `handoff` skills installed globally.
