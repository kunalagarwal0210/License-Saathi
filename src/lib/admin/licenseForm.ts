/**
 * Ticket 09 — pure form parsing/validation for the admin licence editor.
 *
 * Kept free of React/Next/Supabase-client imports so it can be unit-tested
 * directly (matching the pattern in questionnaire.ts / routeView.ts). The
 * server action that actually writes to Supabase is a thin wrapper around
 * `parseLicenseForm` + `getSupabaseAdmin()`.
 *
 * Mirrors the DB CHECK constraint `chk_verified_has_source`
 * (supabase/migrations/0001_initial_schema.sql): a `status = 'verified'` row
 * must carry a non-blank `source_url` and a `last_verified_date`. We
 * validate this here so the form can show a clear inline error instead of
 * letting a bad write bounce off the DB constraint.
 */
import type {
  BusinessCategory,
  LicenseStatus,
  LicensesInsert,
} from "@/lib/supabase/types";

const CATEGORIES: readonly BusinessCategory[] = ["eatery", "retail", "salon"];
const STATUSES: readonly LicenseStatus[] = ["verified", "flagged"];

export type LicenseFormInput = {
  name: string;
  description: string;
  category: string;
  govt_fee_inr: string; // raw form field, empty string -> null
  rough_timeline: string;
  portal_deep_link: string;
  required_documents: string; // raw textarea, one doc per line
  source_url: string;
  last_verified_date: string;
  status: string;
};

export type LicenseFormErrors = Partial<Record<keyof LicenseFormInput, string>>;

export type ParseLicenseFormResult =
  | { payload: LicensesInsert; errors: Record<string, never> }
  | { payload?: undefined; errors: LicenseFormErrors };

/** Splits the textarea into one document per non-blank line. */
function parseRequiredDocuments(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** `""` -> null, a valid integer string -> number, anything else -> error. */
function parseFee(raw: string): { value: number | null } | { error: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null };
  if (!/^-?\d+$/.test(trimmed)) {
    return { error: "Fee must be a whole number (in INR), or left blank." };
  }
  return { value: Number(trimmed) };
}

export function parseLicenseForm(input: LicenseFormInput): ParseLicenseFormResult {
  const errors: LicenseFormErrors = {};

  const name = input.name.trim();
  if (!name) errors.name = "Name is required.";

  const description = input.description.trim();
  if (!description) errors.description = "Description is required.";

  const category = input.category.trim();
  if (!CATEGORIES.includes(category as BusinessCategory)) {
    errors.category = "Choose a valid category.";
  }

  const roughTimeline = input.rough_timeline.trim();
  if (!roughTimeline) errors.rough_timeline = "Timeline is required.";

  const portalDeepLink = input.portal_deep_link.trim();
  if (!portalDeepLink) errors.portal_deep_link = "Portal link is required.";

  const status = input.status.trim();
  if (!STATUSES.includes(status as LicenseStatus)) {
    errors.status = "Choose a valid status.";
  }

  const feeResult = parseFee(input.govt_fee_inr);
  if ("error" in feeResult) errors.govt_fee_inr = feeResult.error;

  const sourceUrl = input.source_url.trim();
  const lastVerifiedDate = input.last_verified_date.trim();

  // The verify-stamp rule: mirrors chk_verified_has_source.
  if (status === "verified") {
    if (!sourceUrl) {
      errors.source_url = "A source URL is required to mark a licence verified.";
    }
    if (!lastVerifiedDate) {
      errors.last_verified_date =
        "A verified date is required to mark a licence verified.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const payload: LicensesInsert = {
    name,
    description,
    category: category as BusinessCategory,
    govt_fee_inr: "value" in feeResult ? feeResult.value : null,
    rough_timeline: roughTimeline,
    portal_deep_link: portalDeepLink,
    required_documents: parseRequiredDocuments(input.required_documents),
    source_url: sourceUrl === "" ? null : sourceUrl,
    last_verified_date: lastVerifiedDate === "" ? null : lastVerifiedDate,
    status: status as LicenseStatus,
  };

  return { payload, errors: {} as Record<string, never> };
}
