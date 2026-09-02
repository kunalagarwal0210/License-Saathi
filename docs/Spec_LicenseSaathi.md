# Spec — LicenseSaathi MVP

> Produced by the `to-spec` skill from the Solution PRD (`Solution_PRD_LicenseSaathi.md`) and the grilling session. No issue tracker configured for this project, so this is saved as a file; triage label would be `ready-for-agent`.

## Problem Statement

A first-time micro-business owner in Ahmedabad — typically taking a physical commercial space (a café, a kirana shop, a salon) — cannot easily find out which licenses and registrations their specific business needs, or in what order. Information is fragmented across central, state, and municipal authorities; no single trustworthy source is personalized to their business type, scale, and city. As a result they stall, overpay agents 10–60× the real government fee, or begin operating in fear of penalties. A general LLM answers confidently but with un-cited, un-dated, city-generic information the user cannot trust.

## Solution

A web app that asks a short branching questionnaire (business category + a few disambiguating questions) and returns the **ordered** set of licenses the business needs, each with human-verified, city-specific, source-cited, date-stamped detail: what it is, documents required, government fee, rough timeline, and a deep link to the correct official portal. A signed-in user can save the result as a trackable checklist, mark items done, and return to a dashboard showing progress. Reminders nudge them and, after they file, invite structured "non-happy flow" field-notes that (post-MVP) feed back into keeping the verified data fresh. The durable advantage over an LLM is verified, dated, cited accuracy for one city plus a companion checklist, not the interface.

## User Stories

1. As a new business owner, I want to pick my business category (eatery/café, retail/kirana, salon), so that the guidance is relevant to what I actually do.
2. As a new business owner, I want to answer a few simple questions about my business (seating, turnover band, premises type, alcohol), so that the result is specific to my situation and not a generic list.
3. As a café owner with seating, I want the system to include a Fire NOC when my seating crosses the threshold, so that I don't miss a requirement that applies to me.
4. As a low-turnover seller, I want GST to be included only when my turnover band requires it, so that I'm not told to register for something I don't need.
5. As a cloud-kitchen operator, I want the on-premise-vs-cloud distinction to change my license set, so that I'm not given dine-in requirements I don't have.
6. As a user, I want to see the licenses in the correct order with dependencies shown, so that I know what to do first.
7. As a user, I want each license to show what it is in plain language, so that I understand why I need it.
8. As a user, I want each license to list the exact documents required, so that I can prepare them before going to the office.
9. As a user, I want each license to show the real government fee, so that I know what it should actually cost.
10. As a user, I want each license to show a rough timeline, so that I can plan when I can start operating.
11. As a user, I want a deep link to the correct official portal for each license, so that I don't have to hunt for where to apply.
12. As a user, I want each verified license to show its official source and a "verified on <date>" stamp, so that I can trust it more than a generic web/AI answer.
13. As a user, I want to see community-reported "field notes" for a license clearly labelled as unofficial, so that I'm warned about real-world surprises without confusing them with official requirements.
14. As a user, I want to reach my full personalized list without creating an account, so that I get value before being asked for anything.
15. As a user, I want to share my result list, so that I can send it to a partner or post it.
16. As a user, I want to save my list as a checklist by verifying my phone via OTP, so that I can come back to it later.
17. As a returning user, I want to log in with my phone, so that I can access my saved checklist.
18. As a returning user, I want a dashboard showing my saved checklist(s) and progress ("2 of 5 done"), so that I can see what's left at a glance.
19. As a returning user, I want to mark a license as done, so that I can track my progress.
20. As a user, I want a printable "bring these" document pack for my licenses, so that I can take it to the office.
21. As a saved user, I want a reminder some days after saving, so that I don't forget to finish pending licenses.
22. As a user who has been to an office, I want to report an unexpected document/step/fee for a specific license via a short structured form, so that others are warned.
23. As an admin, I want to log into a protected panel, so that only I can change the licensing data.
24. As an admin, I want to add and edit licenses and rules through the app, so that I never edit the database directly.
25. As an admin, I want to set a verify-stamp (source + date) on a license, so that users can see it is verified and current.
26. As an admin (post-MVP), I want to review licenses flagged as "possibly changed" by the change-detection watcher, so that I can re-verify before any value changes.
27. As an admin (post-MVP), I want to review clustered community field-notes and promote or reject them, so that real-world signals can become verified rules without contaminating the spine automatically.
28. As the product team, I want key actions instrumented (flow started, questionnaire completed, list viewed, portal link clicked, checklist saved, license marked done, field-note submitted), so that we can measure the North Star and rank personas.

## Implementation Decisions

- **Rules engine is the source of truth; content is never LLM-generated.** A deterministic mapping `(category, answers) → ordered license set` returns the result. An LLM, if used at all, is only an optional front door that maps free text onto the structured questionnaire — it never produces answer content. This is the single most important architectural decision and the product's moat.
- **The rules engine is the primary test seam** — a pure function over structured input, isolated from UI and DB, so correctness of the answer is verifiable independently.
- **Data lives in Supabase (Postgres) from day 1, not a flat file**, because auth, saved checklists, field-notes, and the post-MVP freshness pipeline all require a real database.
- **Two data tiers, never mixed:** a *verified spine* (curated, each rule carrying `source_url`, `last_verified_date`, `status`) and *community field-notes* (user-submitted, clearly labelled unofficial). Field-notes never write into the verified spine automatically.
- **Schema (indicative):**
  - `licenses` — name, description, category, source_url, last_verified_date, status (verified/flagged), govt_fee, rough_timeline, portal_deep_link, required_documents.
  - `rules` — category, condition (answer-key: turnover_band, seating, area, premises_type, alcohol), resulting license ids, order/sequence.
  - `users` — phone, created_at.
  - `saved_checklists` — user_id, category, snapshot of answers, created_at.
  - `checklist_items` — checklist_id, license_id, status (pending/done).
  - `field_notes` — license_id, structured fields (what_happened, extra_doc, extra_fee), nullable reporter, status (new/reviewing/promoted/rejected), created_at.
- **Auth:** Supabase phone-OTP, requested only at "save/remind" — discovery is fully usable without login. Returning users log in with the same OTP.
- **Reminders:** self-declared progress (user marks done) + time-based email nudges. No government status API (out of scope). Email for MVP; WhatsApp is post-MVP.
- **Field-note capture happens post-filing, via the reminder** — a structured, per-license form, not an end-of-session survey.
- **Admin panel is a protected route.** MVP builds bare-bones license/rule CRUD + verify-stamp. Flag-review and field-note promotion are designed in the schema but built post-MVP (no data to act on at cold start).
- **Freshness pipeline (post-MVP, schema-ready):** a change-detection watcher re-fetches each `source_url`, diffs against the stored value, and on change *flags for human re-verification* — it never silently overwrites verified data. New-requirement detection is driven primarily by clustered community field-notes, secondarily by watching portal notice/circular pages, with periodic manual audit as backstop.
- **Stack:** Next.js on Vercel, Supabase (DB + auth), Mixpanel for analytics.
- **City/category scope:** Ahmedabad only; categories eatery/café, retail/kirana, salon; ~4–6 licenses total, each verified/cited/dated.

## Testing Decisions

- **Good tests here assert external behavior, not implementation.** For the rules engine that means: given a category and a set of answers, the returned license set and ordering are exactly what's expected — tested through the engine's public function, not its internals.
- **Primary module under test: the rules engine** (the single highest seam). Representative cases:
  - Café with seating above the Fire-NOC threshold → set includes Fire NOC; below → excludes it.
  - Turnover band above the GST threshold → set includes GST; below → excludes it.
  - Cloud kitchen vs on-premise café → correct divergence in the set.
  - Dependency ordering (e.g. a prerequisite license precedes the ones that depend on it).
  - A retail and a salon happy-path each return the expected ordered bundle.
- **Data-integrity checks** (lightweight): every license in the verified spine has a non-empty `source_url` and `last_verified_date`; every `rules` row resolves to existing license ids.
- **Prior art:** none in-repo (greenfield). Establish the rules-engine test file as the reference pattern for future logic tests. UI and DB integration are validated manually for the MVP given the 4-day timeline; they are not the seam.

## Out of Scope

- Submitting applications, integrating with government backends, handling payments/fees.
- Form-filling / autofill from a user document vault (parked future idea).
- The automated change-detection watcher, portal-notice watching, and field-note → verified-spine promotion (designed, built post-MVP).
- WhatsApp reminder channel.
- Cities other than Ahmedabad; categories beyond eatery/café, retail/kirana, salon; an exhaustive all-license database.
- Legal advice or guarantees of correctness — the tool guides, it does not certify.
- Personas 4 (informal operators regularizing) and 5 (low-digital-literacy / language barrier).
- Any LLM generation of license answer content.

## Further Notes

- **Timeline reality:** ~4 build days (2→6 Sept). Build cut is Must = questionnaire + verified ordered list + minimal admin CRUD; Should = login + returning dashboard + checklist mark-done; cut-first = field-note capture → reminder email.
- **North Star:** users who saved a checklist AND marked ≥1 license done. Event spine: flow_started → questionnaire_completed → list_viewed → portal_link_clicked → checklist_saved → license_marked_done → field_note_submitted.
- **Cold-start honesty:** the community repository is empty at launch; seed a handful of known gotchas manually. The MVP growth loop is checklist + reminders, not the crowd.
- **Moat guardrail for implementers:** if a rule has no verified official source, it must not appear in the verified spine — put it in field-notes instead.
- All figures and legal specifics must be re-verified against primary/official sources before any external use.
