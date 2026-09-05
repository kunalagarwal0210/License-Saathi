/**
 * Ticket 09 — pure form parsing/validation for the admin rule editor.
 *
 * A rule row: category, condition (jsonb answer-key predicate), license_id
 * (FK), sequence (integer, drives evaluation/display order). See
 * src/lib/supabase/types.ts `RuleCondition` for the shape the rules engine
 * expects a parsed condition to be.
 */
import type { BusinessCategory, RuleCondition, RulesInsert } from "@/lib/supabase/types";

const CATEGORIES: readonly BusinessCategory[] = ["eatery", "retail", "salon"];

export type RuleFormInput = {
  category: string;
  condition: string; // raw JSON textarea, "" or "{}" -> always applies
  license_id: string;
  sequence: string;
};

export type RuleFormErrors = Partial<Record<keyof RuleFormInput, string>>;

export type ParseRuleFormResult =
  | { payload: RulesInsert; errors: Record<string, never> }
  | { payload?: undefined; errors: RuleFormErrors };

function parseCondition(raw: string): { value: RuleCondition } | { error: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: {} };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { error: "Condition must be valid JSON, e.g. {} or {\"turnover_band\":\"over_40L\"}." };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { error: "Condition must be a JSON object, e.g. {} or {\"turnover_band\":\"over_40L\"}." };
  }

  return { value: parsed as RuleCondition };
}

function parseSequence(raw: string): { value: number } | { error: string } {
  const trimmed = raw.trim();
  if (trimmed === "" || !/^-?\d+$/.test(trimmed)) {
    return { error: "Sequence must be a whole number." };
  }
  return { value: Number(trimmed) };
}

export function parseRuleForm(input: RuleFormInput): ParseRuleFormResult {
  const errors: RuleFormErrors = {};

  const category = input.category.trim();
  if (!CATEGORIES.includes(category as BusinessCategory)) {
    errors.category = "Choose a valid category.";
  }

  const licenseId = input.license_id.trim();
  if (!licenseId) errors.license_id = "Choose a licence.";

  const conditionResult = parseCondition(input.condition);
  if ("error" in conditionResult) errors.condition = conditionResult.error;

  const sequenceResult = parseSequence(input.sequence);
  if ("error" in sequenceResult) errors.sequence = sequenceResult.error;

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const payload: RulesInsert = {
    category: category as BusinessCategory,
    condition: (conditionResult as { value: RuleCondition }).value,
    license_id: licenseId,
    sequence: (sequenceResult as { value: number }).value,
  };

  return { payload, errors: {} as Record<string, never> };
}
