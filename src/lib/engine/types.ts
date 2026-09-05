/**
 * Rules-engine answer-key contract (ticket 03).
 *
 * This is the CONTRACT the ticket-06 questionnaire builds against: which
 * answer keys exist, and which discrete tokens each one accepts. Answers are
 * always discrete tokens (enums/booleans), never raw numbers — band
 * boundaries are chosen to sit ON the real legal thresholds so the engine
 * only ever needs equality / set-membership checks, never arithmetic.
 *
 * NOTE: every shape below uses `type`, not `interface`, matching the
 * convention already established in `src/lib/supabase/types.ts`.
 */

export type BusinessCategory = "eatery" | "retail" | "salon";

/**
 * Turnover bands, boundaries pinned to the FSSAI basic-vs-state-licence line
 * (~₹12L) and the GST registration lines (~₹20L for services, ~₹40L for
 * goods). Exact cutoffs are illustrative here — ticket 04 verifies the real
 * Ahmedabad-applicable thresholds against source documents.
 */
export type TurnoverBand = "under_12L" | "12L_to_20L" | "20L_to_40L" | "over_40L";

/** Eatery-only: seating capacity band, boundary at the Fire-NOC scrutiny line. */
export type SeatingBand = "none" | "under_50" | "50_plus";

/** Retail/salon-only: premises area band (Shops & Establishment / Fire NOC by area). */
export type AreaBand = "small" | "large";

/**
 * Premises type. Eatery uses `on_premise | cloud_kitchen`; retail/salon use
 * `rented | owned`. Modeled as one union because a `Rule`'s condition value
 * is category-scoped already (via `Rule.category`), so there's no ambiguity
 * about which subset applies for a given rule.
 */
export type PremisesType = "on_premise" | "cloud_kitchen" | "rented" | "owned";

export type AnswerKey =
  | "turnover_band"
  | "seating_band"
  | "area_band"
  | "premises_type"
  | "alcohol";

/**
 * The full answer set for one questionnaire run. Every key is optional
 * because which keys are actually asked (and answered) depends on the
 * business category — e.g. `seating_band` only makes sense for `eatery`,
 * `area_band` only for `retail`/`salon`.
 */
export type Answers = {
  turnover_band?: TurnoverBand;
  seating_band?: SeatingBand;
  area_band?: AreaBand;
  premises_type?: PremisesType;
  alcohol?: boolean;
};

export type AnswerValue = TurnoverBand | SeatingBand | AreaBand | PremisesType | boolean;

/**
 * A rule's conditions. Every key present must match the corresponding
 * answer for the rule to apply; a key holding an array matches if the
 * answer is a member of that array (set-membership); a key absent from
 * `conditions` is a wildcard (matches any answer, including an unanswered
 * one). An empty object always matches — used for licences every business
 * in the category needs regardless of answers.
 */
export type RuleCondition = Partial<Record<AnswerKey, AnswerValue | AnswerValue[]>>;

export type Rule = {
  category: BusinessCategory;
  conditions: RuleCondition;
  grantsLicenseId: string;
};

export type License = {
  id: string;
  name: string;
  /** IDs of licences that must appear (and be listed) before this one. */
  dependsOn: string[];
  /**
   * Stable tie-break for licences with no dependency relationship between
   * them — lower sorts first. Optional; licences without an `order` sort
   * after ones that have it, then by `id`.
   */
  order?: number;
};

/**
 * The rules engine's data-source seam. In-memory today (`fixtures.ts`);
 * swappable for a Supabase-backed loader later without the engine itself
 * changing (the engine never imports Supabase).
 */
export type RulesSource = {
  rules: Rule[];
  licenses: License[];
};

export type OrderedLicense = License;
