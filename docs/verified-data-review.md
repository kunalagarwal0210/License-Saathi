# Verified licence data — spot-check sheet (ticket 04)

Read this alongside `src/lib/data/verified.ts`, the source of truth. Every
row below is one entry in `verifiedLicenses`. **Verified** rows carry a
`source_url` that was actually fetched during research and a
`last_verified_date` of 2026-09-05. **Flagged** rows are included (never
silently dropped) but either couldn't be tied to an official source within
the research timebox, or the specific number/claim is a carried-over
assumption — the reason is always in the row's `description` too.

## How to spot-check fast

For each **verified** row, click the source URL and confirm it's a real,
live, official page that plausibly supports the claim. For each **flagged**
row, the fastest useful thing you can do is try the official portal
yourself and tell me if you find the missing fact — I've noted exactly what
I couldn't confirm and why.

## Licences

| id | category | name | status | fee (₹) | source_url | note |
|---|---|---|---|---|---|---|
| `shop_establishment_eatery` | eatery | Shops & Establishment Registration | verified | null (varies) | https://enagar.gujarat.gov.in/ | Official Gujarat Labour Dept eNagar portal, fetched — confirms the service exists and covers Ahmedabad. Fee (~₹1,000 per filing agencies) not independently confirmed on the portal itself — left null rather than asserted. |
| `shop_establishment_retail` | retail | Shops & Establishment Registration | verified | null (varies) | https://enagar.gujarat.gov.in/ | Same registration, retail category row (DB requires one category per row — see below). |
| `shop_establishment_salon` | salon | Shops & Establishment Registration | verified | null (varies) | https://enagar.gujarat.gov.in/ | Same registration, salon category row. |
| `gst_eatery` | eatery | GST Registration | verified | 0 | https://gstcouncil.gov.in/node/4096 | Services threshold ₹20L (CGST Act s.22 baseline). Registration itself is free. |
| `gst_retail` | retail | GST Registration | verified | 0 | https://gstcouncil.gov.in/node/4096 | Fetched: official GST Council notification page confirming the ₹40L exclusive-goods-supplier threshold (Notification 10/2019-CT). |
| `gst_salon` | salon | GST Registration | verified | 0 | https://gstcouncil.gov.in/node/4096 | Services threshold ₹20L — a salon is a service business, doesn't get the ₹40L goods carve-out. |
| `fssai_basic` | eatery | FSSAI Basic Registration | verified | 100 | https://foscos.fssai.gov.in/ | Turnover ≤ ₹12L. Portal fetched and confirmed live/official; the ₹100 fee and ₹12L cutoff are well-established figures cross-checked via multiple independent secondary sources (the FoSCoS portal itself is a JS-rendered SPA that didn't yield extractable plain-text confirmation of the number). |
| `fssai_state` | eatery | FSSAI State Licence | verified | null (varies ~₹2,000–5,000) | https://foscos.fssai.gov.in/ | Turnover > ₹12L. Same portal-verification caveat as Basic Registration above. |
| `fire_noc_eatery` | eatery | Fire NOC | **flagged** | null | — | Every attempt to fetch ahmedabadcity.gov.in's fire department page failed on a TLS certificate error; indiacode.nic.in (403) and townplanning.gujarat.gov.in (404) also failed. The 50-seat threshold is carried over unverified from ticket 03's illustrative fixture. |
| `fire_noc_retail` | retail | Fire NOC | **flagged** | null | — | Same blocker as above; "large" area threshold unverified. |
| `fire_noc_salon` | salon | Fire NOC | **flagged** | null | — | Same blocker as above; "large" area threshold unverified. |
| `trade_license_eatery` | eatery | Eating House / Trade Licence | **flagged** | null | — | Couldn't confirm AMC issues a distinct Eating House Licence beyond Gumasta (Shops & Establishment) for Ahmedabad specifically — may be redundant. Included per the ticket's requested coverage, not as a confirmed independent requirement. |
| `trade_license_retail` | retail | Retail Trade Licence | **flagged** | null | — | Same uncertainty — may be the same AMC product as Shops & Establishment registration under another name. AMC portal unreachable (TLS error). |
| `health_trade_license_salon` | salon | Health Trade Licence | **flagged** | null | — | Same uncertainty as retail trade licence above. |
| `prof_tax_eatery` | eatery | Professional Tax Registration (Employer) | **flagged** | null | — | commercialtax.gujarat.gov.in refused the connection on every fetch attempt. Requirement is real (Gujarat does levy professional tax) but not independently confirmed against the live official page. |
| `prof_tax_retail` | retail | Professional Tax Registration (Employer) | **flagged** | null | — | Same as above. |
| `prof_tax_salon` | salon | Professional Tax Registration (Employer) | **flagged** | null | — | Same as above. |
| `liquor_permit_eatery` | eatery | Liquor Service — Gujarat Prohibition | **flagged** | null | https://e-prohibition.gujarat.gov.in/ | See "Gujarat prohibition" section below — this is the important local-truth row. |

## Gujarat prohibition (`alcohol`) — how it was handled

Gujarat is a dry state under the Gujarat Prohibition Act, 1949. Multiple
independent compliance-industry sources (petpooja, psrcompliance, and
others) consistently state that **no standard bar/restaurant liquor
licence is issued anywhere in Gujarat except inside GIFT City,
Gandhinagar** (which allows an FL-3 licence). Outside GIFT City, alcohol
access is only through *personal* consumption permits (health/visitor/
tourist permits) issued to individuals by the Prohibition & Excise
Department — there's no venue-level licence path for a restaurant to serve
alcohol.

I fetched `e-prohibition.gujarat.gov.in` and confirmed it's the live,
official Directorate of Prohibition and Excise e-services portal — but its
content is a service-application shell, not a policy statement, so it
doesn't itself say "no venue licences outside GIFT City." That specific
claim is therefore **flagged**, not verified — but I did NOT model it as a
generic-India liquor licence. Instead, `alcohol: true` maps to a single
flagged row whose `description` states the local reality plainly, so the
checklist tells a Gujarat eatery owner the truth (you cannot get a standard
liquor licence here) instead of pointing them at a licence that doesn't
exist in this state. **Recommend a human confirm this directly with the
Prohibition & Excise Department or a Gujarat excise-law source before this
row goes live**, since it's currently corroborated by industry blogs, not
government text.

## Fee handling

- `gst_*`: `govt_fee_inr: 0` — GST registration itself carries no
  government fee (this is a well-established, non-controversial fact, not
  merely a "varies" case).
- `fssai_basic`: `govt_fee_inr: 100` — flat fee, confirmed by consistent
  cross-source corroboration.
- Everything else that has a real fee is a **range** (Shops &
  Establishment ~₹1,000 unconfirmed; FSSAI State ~₹2,000–5,000; Fire NOC
  ₹500–₹50,000 by size) → `govt_fee_inr: null`, with the range noted in
  `description` per the ticket's fee policy.

## Why licences are duplicated per category

`licenses.category` is `not null` in the schema (one category per row), but
a real-world licence like "Shops & Establishment Registration" or "GST
Registration" applies to all three business categories. Rather than change
the schema, each such licence is modeled as **one `VerifiedLicense` entry
per category it applies to** — same name/description/portal, distinct
`id`/`category` — so every DB row still maps 1:1 to one engine `License`
and one `rules` category scope. This is spelled out in the comment block at
the top of `src/lib/data/verified.ts`.

## Everything I couldn't verify (summary)

- **Fire NOC** exact seating/area thresholds (AMC fire dept page: TLS
  certificate error on every fetch attempt; indiacode.nic.in: 403;
  townplanning.gujarat.gov.in: 404).
- Whether Ahmedabad has genuinely **separate** Eating House / Retail Trade
  / Health Trade licences distinct from the Gumasta (Shops & Establishment)
  certificate, or whether these are the same AMC product under different
  informal names (AMC portal itself: TLS certificate error on every fetch
  attempt).
- **Professional tax** registration specifics (commercialtax.gujarat.gov.in:
  connection refused on every attempt).
- The precise ₹ figures for Shops & Establishment registration and FSSAI
  State Licence fees (both left `null`/ranged rather than asserted).
- The Gujarat-prohibition "no venue licence outside GIFT City" claim, as
  described above — the department's own portal doesn't state this in
  retrievable text; it's corroborated by industry sources only.

None of the above blocked delivery — every affected row is included and
marked `flagged` with the specific gap named in its `description`, per the
ticket's verification policy.
