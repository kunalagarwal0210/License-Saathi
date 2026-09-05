/**
 * Verified licence/rules data (ticket 04) — Ahmedabad, Gujarat, India.
 *
 * This is the product's core trust claim: real, human-verifiable,
 * source-cited licensing data for first-time eatery/retail/salon owners,
 * replacing the illustrative `fixtures.ts` (ticket 03) as the data actually
 * shown to users and seeded into Supabase.
 *
 * Verification policy (see docs/verified-data-review.md for the full
 * spot-check sheet):
 *   - `status: "verified"` rows carry a `sourceUrl` that was actually
 *     fetched during ticket-04 research, and a `lastVerifiedDate`.
 *   - `status: "flagged"` rows are included (never silently dropped) but
 *     could not be tied to an official source within the research
 *     timebox, OR the specific numeric threshold/fee is a carried-over
 *     assumption rather than an independently confirmed figure. Every
 *     flagged row explains why in its `description`.
 *   - No URL below was invented — every `sourceUrl` is a page that was
 *     fetched (directly, or via search-engine corroboration where the live
 *     fetch was blocked — see the review doc for which).
 *
 * DB↔engine reconciliation (ticket 04 approved design, see AGENT_TASK):
 *   - The `licenses` table (0001_initial_schema.sql) requires one
 *     `category` per row. A real-world licence that applies to more than
 *     one business category (e.g. Shops & Establishment registration, GST
 *     registration) is therefore modeled as ONE `VerifiedLicense` entry
 *     PER category it applies to (same underlying licence, distinct
 *     `id`/`category`/DB row) rather than a single row with no category —
 *     this keeps the DB schema (which mandates category) and the engine
 *     (whose `License` has no category field) in lockstep: one
 *     `VerifiedLicense` == one DB row == one engine `License`.
 *   - DB `rules.sequence` -> engine `License.order`. `dependsOn` is `[]`
 *     for every row (no cross-licence prerequisite chains in this verified
 *     set), so the engine's topological sort degenerates to a stable sort
 *     by `order` (see `resolveLicenses.ts`).
 *   - DB `rules.condition` jsonb is exactly the engine's `RuleCondition`
 *     object (array value = set-membership).
 */
import type { BusinessCategory, License, RuleCondition, RulesSource } from "../engine/types";

export type LicenseStatus = "verified" | "flagged";

/**
 * The richer, DB-shaped licence record. Superset of the engine's minimal
 * `License` — carries every column `licenses` (0001_initial_schema.sql)
 * needs, plus the category the engine's `Rule.category` already scopes by.
 */
export type VerifiedLicense = {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  /** Whole rupees; null when the fee is a range/varies (see `description`). */
  govtFeeInr: number | null;
  roughTimeline: string;
  portalDeepLink: string;
  requiredDocuments: string[];
  /** Null only for `status: "flagged"` rows with no source found at all. */
  sourceUrl: string | null;
  /** ISO "YYYY-MM-DD"; null only for `status: "flagged"` rows. */
  lastVerifiedDate: string | null;
  status: LicenseStatus;
  /** Stable tie-break within a category; mirrors `License.order`. */
  order: number;
};

export type VerifiedRule = {
  category: BusinessCategory;
  conditions: RuleCondition;
  /** References `VerifiedLicense.id`. */
  licenseId: string;
};

const VERIFIED_ON = "2026-09-05";

// ── Licences ────────────────────────────────────────────────────────────

export const verifiedLicenses: VerifiedLicense[] = [
  // ---- Shops & Establishment Registration (Gumasta) — all 3 categories ----
  {
    id: "shop_establishment_eatery",
    name: "Shops & Establishment Registration",
    category: "eatery",
    description:
      "Mandatory registration under the Gujarat Shops & Establishments (Regulation of Employment and Conditions of Service) Act, 2019 for any commercial establishment operating in Ahmedabad — filed online through the Gujarat Labour Department's eNagar portal, which covers Ahmedabad Municipal Corporation. The registration fee is commonly cited by filing agencies as roughly ₹1,000, but that exact figure was not independently confirmed on the official portal within the research timebox, so it is left unset (null) here rather than asserted.",
    govtFeeInr: null,
    roughTimeline: "7–15 working days",
    portalDeepLink: "https://enagar.gujarat.gov.in/",
    requiredDocuments: [
      "PAN card",
      "Aadhaar card",
      "Passport-size photograph",
      "Proof of business premises (rent agreement or property tax receipt)",
      "Partnership deed / incorporation certificate (if applicable)",
    ],
    sourceUrl: "https://enagar.gujarat.gov.in/",
    lastVerifiedDate: VERIFIED_ON,
    status: "verified",
    order: 1,
  },
  {
    id: "shop_establishment_retail",
    name: "Shops & Establishment Registration",
    category: "retail",
    description:
      "Same registration as for eatery/salon (see that row) — mandatory under the Gujarat Shops & Establishments Act for any Ahmedabad retail premises, filed via the Gujarat eNagar portal.",
    govtFeeInr: null,
    roughTimeline: "7–15 working days",
    portalDeepLink: "https://enagar.gujarat.gov.in/",
    requiredDocuments: [
      "PAN card",
      "Aadhaar card",
      "Passport-size photograph",
      "Proof of business premises (rent agreement or property tax receipt)",
      "Partnership deed / incorporation certificate (if applicable)",
    ],
    sourceUrl: "https://enagar.gujarat.gov.in/",
    lastVerifiedDate: VERIFIED_ON,
    status: "verified",
    order: 1,
  },
  {
    id: "shop_establishment_salon",
    name: "Shops & Establishment Registration",
    category: "salon",
    description:
      "Same registration as for eatery/retail (see that row) — mandatory under the Gujarat Shops & Establishments Act for any Ahmedabad salon premises, filed via the Gujarat eNagar portal.",
    govtFeeInr: null,
    roughTimeline: "7–15 working days",
    portalDeepLink: "https://enagar.gujarat.gov.in/",
    requiredDocuments: [
      "PAN card",
      "Aadhaar card",
      "Passport-size photograph",
      "Proof of business premises (rent agreement or property tax receipt)",
      "Partnership deed / incorporation certificate (if applicable)",
    ],
    sourceUrl: "https://enagar.gujarat.gov.in/",
    lastVerifiedDate: VERIFIED_ON,
    status: "verified",
    order: 1,
  },

  // ---- GST Registration — all 3 categories (threshold band differs) ----
  {
    id: "gst_eatery",
    name: "GST Registration",
    category: "eatery",
    description:
      "Register on the GST portal once aggregate annual turnover crosses ₹20 lakh — the services threshold under Section 22 of the CGST Act, 2017. Registration itself carries no government fee.",
    govtFeeInr: 0,
    roughTimeline: "3–7 working days",
    portalDeepLink: "https://www.gst.gov.in/",
    requiredDocuments: [
      "PAN card",
      "Aadhaar card",
      "Proof of business address",
      "Bank account statement or cancelled cheque",
      "Photograph of proprietor/partners",
    ],
    sourceUrl: "https://gstcouncil.gov.in/node/4096",
    lastVerifiedDate: VERIFIED_ON,
    status: "verified",
    order: 2,
  },
  {
    id: "gst_retail",
    name: "GST Registration",
    category: "retail",
    description:
      "Register on the GST portal once aggregate annual turnover crosses ₹40 lakh — the goods threshold under CBIC Notification No. 10/2019-Central Tax (dated 7 March 2019), which raised the exclusive-goods-supplier threshold from ₹20 lakh to ₹40 lakh with effect from 1 April 2019. Registration itself carries no government fee.",
    govtFeeInr: 0,
    roughTimeline: "3–7 working days",
    portalDeepLink: "https://www.gst.gov.in/",
    requiredDocuments: [
      "PAN card",
      "Aadhaar card",
      "Proof of business address",
      "Bank account statement or cancelled cheque",
      "Photograph of proprietor/partners",
    ],
    sourceUrl: "https://gstcouncil.gov.in/node/4096",
    lastVerifiedDate: VERIFIED_ON,
    status: "verified",
    order: 2,
  },
  {
    id: "gst_salon",
    name: "GST Registration",
    category: "salon",
    description:
      "Register on the GST portal once aggregate annual turnover crosses ₹20 lakh — the services threshold under Section 22 of the CGST Act, 2017 (a salon is a service business, not a goods supplier, so it does not get the ₹40 lakh goods threshold). Registration itself carries no government fee.",
    govtFeeInr: 0,
    roughTimeline: "3–7 working days",
    portalDeepLink: "https://www.gst.gov.in/",
    requiredDocuments: [
      "PAN card",
      "Aadhaar card",
      "Proof of business address",
      "Bank account statement or cancelled cheque",
      "Photograph of proprietor/partners",
    ],
    sourceUrl: "https://gstcouncil.gov.in/node/4096",
    lastVerifiedDate: VERIFIED_ON,
    status: "verified",
    order: 2,
  },

  // ---- FSSAI — eatery only ----
  {
    id: "fssai_basic",
    name: "FSSAI Basic Registration",
    category: "eatery",
    description:
      "Required for any food business (including a small eatery) with annual turnover up to ₹12 lakh. Applied for on FoSCoS, FSSAI's official licensing portal.",
    govtFeeInr: 100,
    roughTimeline: "7–15 working days",
    portalDeepLink: "https://foscos.fssai.gov.in/",
    requiredDocuments: [
      "Passport-size photograph of proprietor",
      "Identity proof (Aadhaar/PAN/voter ID)",
      "Proof of business premises",
      "Declaration form (Form A)",
    ],
    sourceUrl: "https://foscos.fssai.gov.in/",
    lastVerifiedDate: VERIFIED_ON,
    status: "verified",
    order: 2,
  },
  {
    id: "fssai_state",
    name: "FSSAI State Licence",
    category: "eatery",
    description:
      "Required once annual turnover exceeds ₹12 lakh (up to ₹20 crore). The fee is a slab depending on business/production category, not a single number, so it is left unset (null) here — commonly cited in the ₹2,000–₹5,000/year range by filing agencies. Applied for on FoSCoS, FSSAI's official licensing portal.",
    govtFeeInr: null,
    roughTimeline: "30–60 days",
    portalDeepLink: "https://foscos.fssai.gov.in/",
    requiredDocuments: [
      "Passport-size photograph of proprietor",
      "Identity proof (Aadhaar/PAN/voter ID)",
      "Proof of business premises",
      "Water test report",
      "Food safety management plan",
    ],
    sourceUrl: "https://foscos.fssai.gov.in/",
    lastVerifiedDate: VERIFIED_ON,
    status: "verified",
    order: 2,
  },

  // ---- Fire NOC — all 3 categories (flagged: no direct official fetch) ----
  {
    id: "fire_noc_eatery",
    name: "Fire NOC",
    category: "eatery",
    description:
      "Required under the Gujarat Fire Prevention and Life Safety Measures Act, 2013 for assembly-occupancy premises above a seating-capacity threshold. FLAGGED: every attempt to fetch the Ahmedabad Municipal Corporation fire department page (ahmedabadcity.gov.in) failed on a TLS certificate error, and the state fire-rules amendment (Schedule 3, 2021) that sets the exact seating cutoff was not independently retrievable within the research timebox (indiacode.nic.in returned 403; townplanning.gujarat.gov.in returned 404). The 50-seat threshold used here is carried over from ticket 03's illustrative fixture, not independently re-verified — treat it as an assumption pending a human check against the AMC portal directly.",
    govtFeeInr: null,
    roughTimeline: "15–30 working days",
    portalDeepLink: "https://ahmedabadcity.gov.in/portal/jsp/Static_pages/fire_dept.jsp",
    requiredDocuments: [
      "Building plan/layout",
      "Fire safety equipment installation certificate",
      "Proof of premises ownership/lease",
      "Shops & Establishment registration certificate",
    ],
    sourceUrl: null,
    lastVerifiedDate: null,
    status: "flagged",
    order: 4,
  },
  {
    id: "fire_noc_retail",
    name: "Fire NOC",
    category: "retail",
    description:
      "Required above a floor-area threshold for retail premises. FLAGGED for the same reason as the eatery Fire NOC row: the AMC fire department page could not be fetched (TLS certificate error) and the exact area cutoff in the state fire rules was not independently retrievable within the research timebox. The 'large' area band used here is carried over from ticket 03's illustrative fixture.",
    govtFeeInr: null,
    roughTimeline: "15–30 working days",
    portalDeepLink: "https://ahmedabadcity.gov.in/portal/jsp/Static_pages/fire_dept.jsp",
    requiredDocuments: [
      "Building plan/layout",
      "Fire safety equipment installation certificate",
      "Proof of premises ownership/lease",
      "Shops & Establishment registration certificate",
    ],
    sourceUrl: null,
    lastVerifiedDate: null,
    status: "flagged",
    order: 4,
  },
  {
    id: "fire_noc_salon",
    name: "Fire NOC",
    category: "salon",
    description:
      "Required above a floor-area threshold for salon premises. FLAGGED for the same reason as the eatery/retail Fire NOC rows: the AMC fire department page could not be fetched (TLS certificate error) and the exact area cutoff in the state fire rules was not independently retrievable within the research timebox. The 'large' area band used here is carried over from ticket 03's illustrative fixture.",
    govtFeeInr: null,
    roughTimeline: "15–30 working days",
    portalDeepLink: "https://ahmedabadcity.gov.in/portal/jsp/Static_pages/fire_dept.jsp",
    requiredDocuments: [
      "Building plan/layout",
      "Fire safety equipment installation certificate",
      "Proof of premises ownership/lease",
      "Shops & Establishment registration certificate",
    ],
    sourceUrl: null,
    lastVerifiedDate: null,
    status: "flagged",
    order: 4,
  },

  // ---- Category-specific trade/health licences (flagged) ----
  {
    id: "trade_license_eatery",
    name: "Eating House / Trade Licence",
    category: "eatery",
    description:
      "Cities such as Delhi and Mumbai issue a distinct police-department 'Eating House Licence' separate from their municipal trade licence. FLAGGED: research did not find evidence that Ahmedabad Municipal Corporation issues a separate Eating House Licence beyond the Gumasta (Shops & Establishment registration) certificate — it may be that AMC's Gumasta already IS the operative trade permission for an eatery here, making this row redundant. Included for completeness/parity with other Indian cities rather than as a confirmed independent requirement; verify with AMC directly before relying on it.",
    govtFeeInr: null,
    roughTimeline: "unknown — not independently verified",
    portalDeepLink: "https://ahmedabadcity.gov.in/",
    requiredDocuments: ["Shops & Establishment registration certificate", "FSSAI registration/licence"],
    sourceUrl: null,
    lastVerifiedDate: null,
    status: "flagged",
    order: 5,
  },
  {
    id: "trade_license_retail",
    name: "Retail Trade Licence",
    category: "retail",
    description:
      "AMC issues commercial trade licences to shops, showrooms, and other retail establishments. FLAGGED: could not confirm, within the research timebox, whether this is a distinct AMC product from the Gumasta (Shops & Establishment registration) or the same certificate under another name — the AMC portal itself could not be fetched (TLS certificate error). Included for completeness; likely redundant with Shops & Establishment registration for Ahmedabad specifically.",
    govtFeeInr: null,
    roughTimeline: "unknown — not independently verified",
    portalDeepLink: "https://ahmedabadcity.gov.in/",
    requiredDocuments: ["Shops & Establishment registration certificate"],
    sourceUrl: null,
    lastVerifiedDate: null,
    status: "flagged",
    order: 3,
  },
  {
    id: "health_trade_license_salon",
    name: "Health Trade Licence",
    category: "salon",
    description:
      "Salons/barber shops are commonly required to hold a municipal 'health trade' permit alongside their general trade licence, on public-health grounds (sanitation, sterilisation of equipment). FLAGGED: could not confirm this as a distinct AMC product, separate from Gumasta (Shops & Establishment registration), within the research timebox — the AMC portal could not be fetched (TLS certificate error). Included for completeness; verify with AMC directly before relying on it.",
    govtFeeInr: null,
    roughTimeline: "unknown — not independently verified",
    portalDeepLink: "https://ahmedabadcity.gov.in/",
    requiredDocuments: ["Shops & Establishment registration certificate"],
    sourceUrl: null,
    lastVerifiedDate: null,
    status: "flagged",
    order: 3,
  },

  // ---- Professional Tax registration — all 3 categories (flagged) ----
  {
    id: "prof_tax_eatery",
    name: "Professional Tax Registration (Employer)",
    category: "eatery",
    description:
      "Gujarat levies professional tax on employers/employees, administered by the Commercial Tax Department. FLAGGED: the department's professional-tax registration page (commercialtax.gujarat.gov.in) refused the connection on every fetch attempt during research, so the requirement is carried over from generally-known Gujarat tax practice rather than independently confirmed against the live official page within the timebox.",
    govtFeeInr: null,
    roughTimeline: "unknown — not independently verified",
    portalDeepLink: "https://commercialtax.gujarat.gov.in/vatwebsite/dealer/dealerMain.jsp?viewPageNo=207",
    requiredDocuments: ["PAN card", "Shops & Establishment registration certificate", "Employee salary details"],
    sourceUrl: null,
    lastVerifiedDate: null,
    status: "flagged",
    order: 6,
  },
  {
    id: "prof_tax_retail",
    name: "Professional Tax Registration (Employer)",
    category: "retail",
    description:
      "Same requirement as the eatery/salon row (see there for the flag reason): Gujarat professional tax on employers, administered by the Commercial Tax Department, not independently confirmed against the live official page within the research timebox.",
    govtFeeInr: null,
    roughTimeline: "unknown — not independently verified",
    portalDeepLink: "https://commercialtax.gujarat.gov.in/vatwebsite/dealer/dealerMain.jsp?viewPageNo=207",
    requiredDocuments: ["PAN card", "Shops & Establishment registration certificate", "Employee salary details"],
    sourceUrl: null,
    lastVerifiedDate: null,
    status: "flagged",
    order: 6,
  },
  {
    id: "prof_tax_salon",
    name: "Professional Tax Registration (Employer)",
    category: "salon",
    description:
      "Same requirement as the eatery/retail row (see there for the flag reason): Gujarat professional tax on employers, administered by the Commercial Tax Department, not independently confirmed against the live official page within the research timebox.",
    govtFeeInr: null,
    roughTimeline: "unknown — not independently verified",
    portalDeepLink: "https://commercialtax.gujarat.gov.in/vatwebsite/dealer/dealerMain.jsp?viewPageNo=207",
    requiredDocuments: ["PAN card", "Shops & Establishment registration certificate", "Employee salary details"],
    sourceUrl: null,
    lastVerifiedDate: null,
    status: "flagged",
    order: 6,
  },

  // ---- Alcohol / Gujarat prohibition reality — eatery only ----
  {
    id: "liquor_permit_eatery",
    name: "Liquor Service — Gujarat Prohibition (no standard venue licence)",
    category: "eatery",
    description:
      "IMPORTANT LOCAL REALITY, not a generic-India answer: Gujarat is a prohibition (dry) state under the Gujarat Prohibition Act, 1949. There is no standard bar/restaurant liquor licence for an on-premise eatery in Ahmedabad — the one narrow exception is inside GIFT City, Gandhinagar, where an FL-3 licence can be held. Outside GIFT City, alcohol is only accessible to individuals via personal consumption permits (health/visitor/tourist permits) issued by the Prohibition & Excise Department — there is no venue-level path for a restaurant to legally serve alcohol on premises. FLAGGED because the specific claim ('no venue licence issued outside GIFT City') was corroborated by multiple compliance-industry sources but not found stated in first-party text on the department's own portal within the research timebox (the portal itself — e-prohibition.gujarat.gov.in — was fetched and confirmed live and official, but its content is an e-services shell, not a policy statement). This row exists so the checklist can surface the reality (\"you cannot get a standard liquor licence here\") instead of silently omitting it or inventing a generic-India liquor-licence step.",
    govtFeeInr: null,
    roughTimeline: "n/a — no standard venue licence exists outside GIFT City",
    portalDeepLink: "https://e-prohibition.gujarat.gov.in/",
    requiredDocuments: [],
    sourceUrl: "https://e-prohibition.gujarat.gov.in/",
    lastVerifiedDate: VERIFIED_ON,
    status: "flagged",
    order: 7,
  },
];

// ── Rules ───────────────────────────────────────────────────────────────

export const verifiedRules: VerifiedRule[] = [
  // ---- Eatery ----
  { category: "eatery", conditions: {}, licenseId: "shop_establishment_eatery" },
  {
    category: "eatery",
    conditions: { turnover_band: ["under_12L"] },
    licenseId: "fssai_basic",
  },
  {
    category: "eatery",
    conditions: { turnover_band: ["12L_to_20L", "20L_to_40L", "over_40L"] },
    licenseId: "fssai_state",
  },
  {
    category: "eatery",
    conditions: { turnover_band: ["20L_to_40L", "over_40L"] },
    licenseId: "gst_eatery",
  },
  { category: "eatery", conditions: { seating_band: "50_plus" }, licenseId: "fire_noc_eatery" },
  {
    category: "eatery",
    conditions: { premises_type: "on_premise" },
    licenseId: "trade_license_eatery",
  },
  { category: "eatery", conditions: {}, licenseId: "prof_tax_eatery" },
  { category: "eatery", conditions: { alcohol: true }, licenseId: "liquor_permit_eatery" },

  // ---- Retail ----
  { category: "retail", conditions: {}, licenseId: "shop_establishment_retail" },
  { category: "retail", conditions: {}, licenseId: "trade_license_retail" },
  { category: "retail", conditions: {}, licenseId: "prof_tax_retail" },
  {
    category: "retail",
    conditions: { turnover_band: ["over_40L"] },
    licenseId: "gst_retail",
  },
  { category: "retail", conditions: { area_band: "large" }, licenseId: "fire_noc_retail" },

  // ---- Salon ----
  { category: "salon", conditions: {}, licenseId: "shop_establishment_salon" },
  { category: "salon", conditions: {}, licenseId: "health_trade_license_salon" },
  { category: "salon", conditions: {}, licenseId: "prof_tax_salon" },
  {
    category: "salon",
    conditions: { turnover_band: ["20L_to_40L", "over_40L"] },
    licenseId: "gst_salon",
  },
  { category: "salon", conditions: { area_band: "large" }, licenseId: "fire_noc_salon" },
];

// ── Engine-facing derived shapes ─────────────────────────────────────────

/**
 * The verified dataset, mapped down to the engine's minimal `RulesSource`
 * shape (`resolveLicenses.ts` never imports Supabase or this file's richer
 * `VerifiedLicense`/`VerifiedRule` types — only this seam).
 */
export const verifiedRulesSource: RulesSource = {
  licenses: verifiedLicenses.map(
    (license): License => ({
      id: license.id,
      name: license.name,
      dependsOn: [],
      order: license.order,
    })
  ),
  rules: verifiedRules.map((rule) => ({
    category: rule.category,
    conditions: rule.conditions,
    grantsLicenseId: rule.licenseId,
  })),
};
