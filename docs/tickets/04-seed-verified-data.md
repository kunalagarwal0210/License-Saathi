# 04: Seed verified license/rules data

**What to build:** Real, human-verified licensing data for Ahmedabad covering the three MVP categories, loaded into the verified spine so the engine returns true answers. This is the manual research that makes the product more trustworthy than a general LLM.

**Blocked by:** 03 (Rules engine + unit tests)

**Status:** ready-for-agent

- [ ] ~4–6 licenses curated for eatery/café, retail/kirana, salon (e.g. FSSAI, GST, Shops & Establishment, trade/health license, Fire NOC, signage)
- [ ] Each license has an official `source_url` and a `last_verified_date`
- [ ] Rules rows map category + disambiguating answers to the correct ordered license set
- [ ] Engine tests (03) pass against the real seeded data
- [ ] Any requirement without a verified official source is excluded from the spine (belongs in field-notes)
