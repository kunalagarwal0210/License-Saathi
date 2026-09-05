/**
 * Ticket 06 — the branching questionnaire's pure logic.
 *
 * Question sets are derived directly from `src/lib/data/verified.ts`'s rule
 * conditions (the ticket-03 answer-key contract): only ask a key that
 * actually differentiates a licence outcome for that category. No question
 * exists here that the engine doesn't branch on.
 *
 *   eatery: premises_type, seating_band (only if on_premise), turnover_band, alcohol
 *   retail: turnover_band, area_band
 *   salon:  turnover_band, area_band
 *
 * Kept free of React/Next imports so it can be unit-tested directly and
 * reused by both the questionnaire page and the results route (URL
 * serialization).
 */
import type {
  AnswerKey,
  Answers,
  AnswerValue,
  AreaBand,
  BusinessCategory,
  PremisesType,
  SeatingBand,
  TurnoverBand,
} from "./engine/types";

export type QuestionOption = {
  /** The large, human label shown on the option card. */
  label: string;
  /** Optional smaller clarifying line under the label. */
  sublabel?: string;
  /** The engine token this option writes into `Answers`. */
  value: AnswerValue;
};

export type QuestionConfig = {
  key: AnswerKey;
  /** The large question headline. */
  question: string;
  /** The reassuring subtitle under the question. */
  subtitle: string;
  options: QuestionOption[];
  /**
   * When present and false for the current answer set, this question is
   * skipped entirely (branching) — `skippedValue` is written in its place
   * so every category's answer set stays fully populated for the engine.
   */
  showIf?: (answers: Answers) => boolean;
  skippedValue?: AnswerValue;
};

const TURNOVER_QUESTION: QuestionConfig = {
  key: "turnover_band",
  question: "What yearly turnover do you expect?",
  subtitle: "A rough estimate is enough. You can change it later.",
  options: [
    { label: "Up to ₹12 lakh", value: "under_12L" satisfies TurnoverBand },
    { label: "₹12–20 lakh", value: "12L_to_20L" satisfies TurnoverBand },
    { label: "₹20–40 lakh", value: "20L_to_40L" satisfies TurnoverBand },
    { label: "Above ₹40 lakh", value: "over_40L" satisfies TurnoverBand },
  ],
};

const EATERY_QUESTIONS: QuestionConfig[] = [
  {
    key: "premises_type",
    question: "How will you serve customers?",
    subtitle: "Choose the option closest to your planned setup.",
    options: [
      {
        label: "Customers can sit and eat",
        sublabel: "Dine-in, café or restaurant",
        value: "on_premise" satisfies PremisesType,
      },
      {
        label: "Cloud kitchen only",
        sublabel: "Delivery or takeaway, with no seating",
        value: "cloud_kitchen" satisfies PremisesType,
      },
    ],
  },
  {
    key: "seating_band",
    question: "How many seats will your eatery have?",
    subtitle: "This determines whether a Fire NOC applies to your premises.",
    options: [
      { label: "Fewer than 50 seats", value: "under_50" satisfies SeatingBand },
      { label: "50 seats or more", value: "50_plus" satisfies SeatingBand },
    ],
    // Cloud kitchens have no seating — skip the question and lock in "none"
    // rather than ask something that can't matter for this path.
    showIf: (answers) => answers.premises_type === "on_premise",
    skippedValue: "none" satisfies SeatingBand,
  },
  TURNOVER_QUESTION,
  {
    key: "alcohol",
    question: "Will you serve alcohol?",
    subtitle: "This affects which permissions appear on your route.",
    options: [
      { label: "No", value: false },
      { label: "Yes", value: true },
    ],
  },
];

const RETAIL_QUESTIONS: QuestionConfig[] = [
  TURNOVER_QUESTION,
  {
    key: "area_band",
    question: "How much floor space will you use?",
    subtitle: "This determines whether a Fire NOC applies to your premises.",
    options: [
      { label: "Small", sublabel: "A compact storefront", value: "small" satisfies AreaBand },
      { label: "Large", sublabel: "A larger-format shop", value: "large" satisfies AreaBand },
    ],
  },
];

const SALON_QUESTIONS: QuestionConfig[] = [
  TURNOVER_QUESTION,
  {
    key: "area_band",
    question: "How much floor space will you use?",
    subtitle: "This determines whether a Fire NOC applies to your premises.",
    options: [
      { label: "Small", sublabel: "A compact single-chair setup", value: "small" satisfies AreaBand },
      { label: "Large", sublabel: "A larger salon floor", value: "large" satisfies AreaBand },
    ],
  },
];

const QUESTIONS_BY_CATEGORY: Record<BusinessCategory, QuestionConfig[]> = {
  eatery: EATERY_QUESTIONS,
  retail: RETAIL_QUESTIONS,
  salon: SALON_QUESTIONS,
};

/** The full, unfiltered question config for a category (includes skippable ones). */
export function getQuestionSet(category: BusinessCategory): QuestionConfig[] {
  return QUESTIONS_BY_CATEGORY[category];
}

/** The questions actually shown given the answers collected so far. */
export function getVisibleQuestions(
  category: BusinessCategory,
  answers: Answers
): QuestionConfig[] {
  return getQuestionSet(category).filter(
    (question) => !question.showIf || question.showIf(answers)
  );
}

/**
 * Fills in `skippedValue` for any question whose `showIf` is false given the
 * final answer set — e.g. eatery `seating_band` -> `"none"` for a cloud
 * kitchen. Idempotent; never overwrites an answer the user actually gave.
 */
export function applySkippedDefaults(
  category: BusinessCategory,
  answers: Answers
): Answers {
  const result: Answers = { ...answers };
  for (const question of getQuestionSet(category)) {
    if (question.showIf && !question.showIf(answers) && question.skippedValue !== undefined) {
      const key = question.key;
      if (result[key] === undefined) {
        (result as Record<AnswerKey, AnswerValue>)[key] = question.skippedValue;
      }
    }
  }
  return result;
}

// ── URL <-> Answers serialization (the 06 -> 07 routing contract) ─────────

const TURNOVER_BANDS: readonly TurnoverBand[] = [
  "under_12L",
  "12L_to_20L",
  "20L_to_40L",
  "over_40L",
];
const SEATING_BANDS: readonly SeatingBand[] = ["none", "under_50", "50_plus"];
const AREA_BANDS: readonly AreaBand[] = ["small", "large"];
const PREMISES_TYPES: readonly PremisesType[] = [
  "on_premise",
  "cloud_kitchen",
  "rented",
  "owned",
];

/** Serializes a completed answer set into results-route query params. */
export function answersToSearchParams(answers: Answers): URLSearchParams {
  const params = new URLSearchParams();
  if (answers.premises_type !== undefined) params.set("premises_type", answers.premises_type);
  if (answers.seating_band !== undefined) params.set("seating_band", answers.seating_band);
  if (answers.area_band !== undefined) params.set("area_band", answers.area_band);
  if (answers.turnover_band !== undefined) params.set("turnover_band", answers.turnover_band);
  if (answers.alcohol !== undefined) params.set("alcohol", String(answers.alcohol));
  return params;
}

/**
 * Parses results-route query params back into `Answers`, ignoring unknown
 * keys/values rather than throwing — a malformed or hand-edited URL should
 * degrade to "fewer answers" (fewer licence-rule matches), never a crash.
 */
export function searchParamsToAnswers(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): Answers {
  const get = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const answers: Answers = {};

  const premisesType = get("premises_type");
  if (premisesType && (PREMISES_TYPES as string[]).includes(premisesType)) {
    answers.premises_type = premisesType as PremisesType;
  }
  const seatingBand = get("seating_band");
  if (seatingBand && (SEATING_BANDS as string[]).includes(seatingBand)) {
    answers.seating_band = seatingBand as SeatingBand;
  }
  const areaBand = get("area_band");
  if (areaBand && (AREA_BANDS as string[]).includes(areaBand)) {
    answers.area_band = areaBand as AreaBand;
  }
  const turnoverBand = get("turnover_band");
  if (turnoverBand && (TURNOVER_BANDS as string[]).includes(turnoverBand)) {
    answers.turnover_band = turnoverBand as TurnoverBand;
  }
  const alcohol = get("alcohol");
  if (alcohol === "true" || alcohol === "false") {
    answers.alcohol = alcohol === "true";
  }

  return answers;
}

/** Builds the `/results/[category]` href carrying the answers (ticket 06 -> 07 contract). */
export function getResultsHref(category: BusinessCategory, answers: Answers): string {
  const query = answersToSearchParams(answers).toString();
  return query ? `/results/${category}?${query}` : `/results/${category}`;
}
