# 06: Branching questionnaire

**What to build:** The short, category-specific set of disambiguating questions that let the engine pinpoint exactly which licenses apply — so the result is specific to this business, not a generic list.

**Blocked by:** 00 (Design foundation), 05 (Landing + category picker), 03 (Rules engine + unit tests)

**Status:** ready-for-agent

**Design gate — finalize before any build below (no code until this passes):**

- [ ] Visual world and tokens inherited from `docs/DESIGN.md` (ticket 00)
- [ ] This surface designed via `/impeccable shape` and finalized against `docs/DESIGN.md`
- [ ] Design reviewed and approved by Kunal

**Build — start only after the design gate above is approved:**

- [ ] Per-category questions (e.g. eatery: seating, turnover band, on-premise vs cloud kitchen, alcohol; retail: turnover band, premises area; salon: premises, turnover band)
- [ ] 3–5 questions per category, matching the answer-keys the engine expects
- [ ] Collected answers are passed to the engine to compute the result
- [ ] Simple, low-friction UI; back/edit supported
