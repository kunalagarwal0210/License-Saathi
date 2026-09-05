/**
 * ILLUSTRATIVE fixtures for the rules engine (ticket 03).
 *
 * These licences, thresholds, and dependency edges are made up to exercise
 * every seam of `resolveLicenses` (band boundaries, category divergence,
 * dependency ordering, cycle detection). They are NOT verified Ahmedabad
 * data. Ticket 04 replaces/verifies the real rows (real licence names, fees,
 * documents, portals, and the exact threshold each rule fires on) — this
 * file's job is only to prove the engine's contract works, not to be a
 * source of truth for licensing advice.
 */
import type { License, Rule, RulesSource } from "./types";

const licenses: License[] = [
  // Shared across all three categories.
  { id: "shop_establishment", name: "Shops & Establishment Registration", dependsOn: [], order: 1 },
  { id: "gst_registration", name: "GST Registration", dependsOn: [], order: 2 },
  { id: "fire_noc", name: "Fire NOC", dependsOn: ["shop_establishment"], order: 4 },

  // Eatery-specific.
  { id: "fssai_basic", name: "FSSAI Basic Registration", dependsOn: ["shop_establishment"], order: 2 },
  { id: "fssai_state", name: "FSSAI State Licence", dependsOn: ["shop_establishment"], order: 2 },
  { id: "eating_house_license", name: "Eating House Licence", dependsOn: ["shop_establishment"], order: 5 },
  { id: "liquor_license", name: "Liquor Licence", dependsOn: ["shop_establishment"], order: 6 },

  // Retail-specific.
  { id: "retail_trade_license", name: "Retail Trade Licence", dependsOn: ["shop_establishment"], order: 3 },

  // Salon-specific.
  { id: "salon_trade_license", name: "Salon Trade Licence", dependsOn: ["shop_establishment"], order: 3 },
];

const rules: Rule[] = [
  // ---- Eatery ----
  { category: "eatery", conditions: {}, grantsLicenseId: "shop_establishment" },
  {
    category: "eatery",
    conditions: { turnover_band: ["under_12L", "12L_to_20L"] },
    grantsLicenseId: "fssai_basic",
  },
  {
    category: "eatery",
    conditions: { turnover_band: ["20L_to_40L", "over_40L"] },
    grantsLicenseId: "fssai_state",
  },
  // GST line for services ~₹20L.
  {
    category: "eatery",
    conditions: { turnover_band: ["20L_to_40L", "over_40L"] },
    grantsLicenseId: "gst_registration",
  },
  { category: "eatery", conditions: { seating_band: "50_plus" }, grantsLicenseId: "fire_noc" },
  {
    category: "eatery",
    conditions: { premises_type: "on_premise" },
    grantsLicenseId: "eating_house_license",
  },
  { category: "eatery", conditions: { alcohol: true }, grantsLicenseId: "liquor_license" },

  // ---- Retail ----
  { category: "retail", conditions: {}, grantsLicenseId: "shop_establishment" },
  { category: "retail", conditions: {}, grantsLicenseId: "retail_trade_license" },
  // GST line for goods ~₹40L.
  {
    category: "retail",
    conditions: { turnover_band: ["over_40L"] },
    grantsLicenseId: "gst_registration",
  },
  { category: "retail", conditions: { area_band: "large" }, grantsLicenseId: "fire_noc" },

  // ---- Salon ----
  { category: "salon", conditions: {}, grantsLicenseId: "shop_establishment" },
  { category: "salon", conditions: {}, grantsLicenseId: "salon_trade_license" },
  // Salon is a service, so it uses the ~₹20L GST line like eatery.
  {
    category: "salon",
    conditions: { turnover_band: ["20L_to_40L", "over_40L"] },
    grantsLicenseId: "gst_registration",
  },
  { category: "salon", conditions: { area_band: "large" }, grantsLicenseId: "fire_noc" },
];

export const fixtureRulesSource: RulesSource = { rules, licenses };

/**
 * A deliberately cyclic rules source (two licences depending on each other)
 * for exercising the engine's cycle-detection guard. Not used by any
 * "happy path" test.
 */
export const cyclicRulesSource: RulesSource = {
  licenses: [
    { id: "cycle_a", name: "Cycle A", dependsOn: ["cycle_b"] },
    { id: "cycle_b", name: "Cycle B", dependsOn: ["cycle_a"] },
  ],
  rules: [
    { category: "eatery", conditions: {}, grantsLicenseId: "cycle_a" },
    { category: "eatery", conditions: {}, grantsLicenseId: "cycle_b" },
  ],
};
