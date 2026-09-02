# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

<!-- Mobile-first web. Primary audience is on phones. Not a native app. -->

## Stack

Decided (from Solution PRD §9, per case-study Playbook): **Next.js on Vercel · Supabase (Postgres + phone-OTP auth) · Mixpanel.** Rules live as structured data in Supabase from day 1 (not a flat file) because OTP auth, saved checklists, field-notes, and the future change-detection/promotion pipeline all need a real DB.

## Users

**Primary design target: P2 — the first-time physical-shop retailer in Ahmedabad** opening a small eatery/café, kirana/retail shop, or salon. They face the highest licence *count* (trade/health licence + Shops & Establishment + GST + signage, plus Fire NOC for eateries), spend the most on agents/intermediaries, and are genuinely confused about *which set and in what order*. Their pain is city- and zoning-specific, so a general LLM serves them poorly.

Situation: at the start of setting up a business, anxious about penalties, unsure what is required, at risk of overpaying middlemen or operating in fear. The job: **find out exactly which licences/registrations this specific business needs, in what order, and how to actually file each one.**

Secondary: **P3 — digitally-native small operators**, easiest to reach and instrument first, so early testing skews to them even though the product is *built for P2's problem*. Personas P4 (informal operators regularizing) and P5 (low digital literacy / language barrier) are explicitly out of scope for this MVP.

## Product Purpose

Give a first-time micro-business owner a **curated, city-specific, human-verified rules layer**: a short questionnaire returns the **ordered** set of licences/registrations that apply to their exact business, and hand-holds them into each official portal until filing-fear drops.

The interface is not the product — **verified accuracy for one city is the product.** Success = a user changed a real-world outcome: they saved a checklist and marked at least one licence "done" (the North Star). Not vanity engagement.

## Positioning

**Not an AI that answers licensing questions, and not abstract "discovery."** By 2026 any LLM will confidently answer "what licences do I need for a café in Ahmedabad" — so if our output *is* that answer, we have nothing. The durable, non-copyable advantages:

1. **Verified, city-specific, current ground truth** — real Ahmedabad fees, document lists, portal deep-links, and dependencies, each carrying an **official source citation** and a **"verified on <date>" stamp** shown in the UI. An LLM gives national-average mush and hallucinates specifics; it cannot show a dated official citation.
2. **A companion, not a document** — a returning user with a saved, trackable checklist ("2 of 5 done") and reminders, not a one-time answer they read and close.
3. **A crowdsourced repository of non-happy flows** — real-world rejections, surprise documents, off-book demands — that exists nowhere else and that an LLM can never have.

**Moat discipline:** answer content is *never* LLM-generated. If a rule has no verified official source, it does not appear in the verified spine. An LLM, if ever used, is only an optional natural-language front door onto the questionnaire — it never produces answer content.

## Operating Context

- **Scope box:** one city (Ahmedabad, Gujarat); three business categories (small eatery/café · kirana/retail shop · salon), chosen because they share the P2 licence bundle so the rules data overlaps and stays small.
- **Core mechanic:** category pick → short branching questionnaire (3–5 disambiguating questions, e.g. seating capacity → Fire NOC, turnover band → GST, premises area → signage tier) → answers key into a hand-verified rules table returning the ordered licence set with dependencies.
- **Per licence shown:** what it is · documents needed · government fee · rough timeline · correct sequence/dependencies · deep link to the correct official portal · a printable "bring these" document pack.
- **Value-first, auth-on-save:** anyone runs discovery and sees the full ordered list with **zero login** (also the shareable funnel). Phone-OTP is requested only at "save my checklist / remind me."
- **Companion loop:** save checklist (OTP) → time-based reminder email → user returns / reports a non-happy flow (structured field-note) → notes cluster → human verifies → promoted to the verified spine.
- **User surfaces (7 + 1 email):** 1 Landing · 2 Questionnaire · 3 Result (ordered licence list — the payoff) · 4 Login/sign-up (phone-OTP) · 5 Returning-user dashboard ("My Licenses", progress) · 6 Checklist detail (mark-done + printable pack) · 7 Field-note capture (structured) · 8 Reminder email (not a screen).
- **Internal surface:** 9 Admin panel (bare-bones) to add/edit/verify rules and set the verify-stamp — all validation here, no raw DB editing.
- **MVP build cut (MoSCoW, ~4-day):** Must = Landing → Questionnaire → verified ordered list with citations + portal links + minimal admin CRUD. Should = Login + returning dashboard + checklist mark-done. Cut-first order if time runs short: field-note capture → reminder email → then trim checklist.

## Capabilities and Constraints

**Two data tiers, never mixed** — this is a load-bearing product rule that the UI must make visually unmistakable:

- **Verified spine** — curated by us, each rule marked ✓ with `source_url` + `last_verified_date` and status (verified / flagged). The trustworthy answer.
- **Community field-notes** — user-submitted non-happy flows, shown as a clearly-labelled second tier ("3 people reported the office also asked for a rent agreement"), framed as **field notes, not law.** Never contaminates the spine.

Other confirmed constraints:

- MVP data is **manually curated + cited + date-stamped only**. Scope cap: **~4–6 licences across the 3 categories.** Small, sourced, dated, honestly bounded beats broad and confident-but-wrong.
- **Out of scope (MVP):** submitting applications, government backend integration, payments; form-filling / autofill from a document vault (parked future branch); automated scraping that overwrites verified data; field-note→spine auto-promotion and flag-review (schema-ready, built post-MVP — no data at cold start); nationwide coverage; legal advice/guarantees; personas P4 and P5.
- **Schema-ready, post-MVP:** change-detection watcher (re-fetches each `source_url`, diffs, flags "⚠ possibly changed — re-verify", never silently overwrites), portal-notice watching, field-note→spine promotion, WhatsApp reminder channel, more cities/categories.
- **Cold-start honesty:** the crowd is empty at launch; the MVP loop is checklist + reminders, with the field-note repo seeded by us and labelled honestly as a post-MVP flywheel. We never claim a crowd we don't have.
- **Language:** MVP UI ships in **English**, but copy and layout are built so a **second language (e.g. Gujarati) can be added without rework** — recorded as a design constraint, not a shipped MVP feature. (Ahmedabad-native language support is a deliberate near-term possibility, not a launch commitment.)

## Brand Commitments

- **Name:** **LicenseSaathi** ("saathi" = companion). Reinforces the core thesis: a companion that stays with the user, not a one-time document.
- **Voice: friendly and encouraging.** Warm, conversational, companion-like — actively encourages a first-time, anxious owner through each step. This is a trust product, so encouragement never tips into hype or false certainty: it pairs warmth with visible proof (citations, dates) and honesty about what is *not* verified. Plain language over jargon.

## Evidence on Hand

- **Product docs (real, in-repo):** `docs/Problem_Space_PRD_Micro-Licensing.docx` (problem/personas/evidence), `docs/Solution_PRD_LicenseSaathi.md` (scope/moat/architecture/build cut), `docs/Spec_LicenseSaathi.md` (stories/decisions/tests), `docs/tickets/00..15-*.md` (16 tracer-bullet tickets), `README.md`, workflow docs.
- **No primary user validation exists.** Persona importance and willingness-to-use are hypotheses; MVP instrumentation (Mixpanel funnel) is designed to rank them. Future work must not fabricate validation, testimonials, user counts, or a crowd.
- **All licence figures, fees, document lists, timelines, and legal specifics are placeholders until re-verified against primary/official sources.** No fee, timeline, or requirement shown anywhere may be invented; every verified-spine rule requires a real `source_url` + `last_verified_date`. This is existential to the moat.
- No logo or visual brand assets exist yet.

## Product Principles

1. **Verified accuracy for one city is the product** — depth and truth over breadth and confidence. If a rule isn't sourced and dated, it isn't in the spine.
2. **Never mix the two tiers** — the verified spine and community field-notes must be visually and semantically distinct at every touchpoint; field-notes are "notes, not law."
3. **Value first, auth on save** — full discovery value with zero login; ask for a phone number only in exchange for a real benefit (saved companion + reminders).
4. **A companion, not a document** — the win is the returning, tracking user, not the one-time answer. Design for return and progress.
5. **Honest about limits** — bounded scope, dated verification, and an openly-empty cold-start crowd are trust features, not weaknesses. Never claim what we haven't built or verified.

## Accessibility & Inclusion

- **Mobile-first, non-expert audience.** Primary users are first-time owners on phones, often anxious and unfamiliar with licensing jargon — the system is defined for small screens first, with plain language and low cognitive load as functional requirements, not polish.
- **Language-expansion-ready** (see Constraints): English MVP, but no design decision should hard-block adding a second language.
- No formal accessibility standard has been specified by the user; default to strong, pragmatic mobile a11y (adequate contrast, tap-target sizing, readable type) given the audience. Revisit if a specific standard is later required.
