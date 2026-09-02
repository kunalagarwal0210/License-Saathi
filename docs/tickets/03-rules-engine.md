# 03: Rules engine + unit tests

**What to build:** The deterministic core and the product's moat: a function that maps `(category, answers)` to the correct **ordered** set of licenses, with dependencies respected. Content is never LLM-generated. This is the highest test seam — built and tested against in-memory fixtures before any real data or UI exists.

**Blocked by:** 02 (Supabase schema + connection)

**Status:** ready-for-agent

- [ ] Pure engine function `(category, answers) → ordered license set`, isolated from UI and DB
- [ ] Reads rules from the data layer (fixtures now, real rows later) — no hardcoded answers in the engine
- [ ] Unit tests assert external behaviour: café seating above/below Fire-NOC threshold, turnover band above/below GST threshold, cloud-kitchen vs on-premise divergence, dependency ordering, and a retail + salon happy path
- [ ] Test file established as the reference pattern for future logic tests
