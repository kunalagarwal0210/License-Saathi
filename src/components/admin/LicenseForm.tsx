"use client";

import { useActionState, type ReactNode } from "react";
import type { LicenseFormInput } from "@/lib/admin/licenseForm";
import type { LicenseActionState } from "@/app/admin/actions";

type LicenseFormProps = {
  action: (state: LicenseActionState, formData: FormData) => Promise<LicenseActionState>;
  initialValues: LicenseFormInput;
  submitLabel: string;
};

const EMPTY_STATE = (values: LicenseFormInput): LicenseActionState => ({
  values,
  errors: {},
});

// Ticket 09 — covers every `licenses` column. The verify-stamp rule
// (status=verified requires source_url + last_verified_date, mirroring the
// DB's chk_verified_has_source CHECK) is validated in
// src/lib/admin/licenseForm.ts and surfaced here as inline field errors.
export function LicenseForm({ action, initialValues, submitLabel }: LicenseFormProps) {
  const [state, formAction, pending] = useActionState(action, EMPTY_STATE(initialValues));
  const values = state.values;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.formError && (
        <p className="rounded-control bg-flag-tint px-3 py-2 text-sm font-medium text-flag">
          {state.formError}
        </p>
      )}

      <Field label="Name" htmlFor="name" error={state.errors.name}>
        <input
          id="name"
          name="name"
          defaultValue={values.name}
          className={inputClass(!!state.errors.name)}
        />
      </Field>

      <Field label="Description" htmlFor="description" error={state.errors.description}>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={values.description}
          className={inputClass(!!state.errors.description)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" error={state.errors.category}>
          <select
            id="category"
            name="category"
            defaultValue={values.category || "eatery"}
            className={inputClass(!!state.errors.category)}
          >
            <option value="eatery">Eatery</option>
            <option value="retail">Retail</option>
            <option value="salon">Salon</option>
          </select>
        </Field>

        <Field label="Status" htmlFor="status" error={state.errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={values.status || "flagged"}
            className={inputClass(!!state.errors.status)}
          >
            <option value="verified">Verified</option>
            <option value="flagged">Flagged</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Govt. fee (INR)"
          htmlFor="govt_fee_inr"
          error={state.errors.govt_fee_inr}
          hint="Whole number. Leave blank if it varies."
        >
          <input
            id="govt_fee_inr"
            name="govt_fee_inr"
            inputMode="numeric"
            defaultValue={values.govt_fee_inr}
            className={inputClass(!!state.errors.govt_fee_inr)}
          />
        </Field>

        <Field label="Rough timeline" htmlFor="rough_timeline" error={state.errors.rough_timeline}>
          <input
            id="rough_timeline"
            name="rough_timeline"
            defaultValue={values.rough_timeline}
            placeholder="e.g. 7-10 days"
            className={inputClass(!!state.errors.rough_timeline)}
          />
        </Field>
      </div>

      <Field
        label="Portal deep link"
        htmlFor="portal_deep_link"
        error={state.errors.portal_deep_link}
      >
        <input
          id="portal_deep_link"
          name="portal_deep_link"
          defaultValue={values.portal_deep_link}
          placeholder="https://..."
          className={inputClass(!!state.errors.portal_deep_link)}
        />
      </Field>

      <Field
        label="Required documents"
        htmlFor="required_documents"
        error={state.errors.required_documents}
        hint="One document per line."
      >
        <textarea
          id="required_documents"
          name="required_documents"
          rows={4}
          defaultValue={values.required_documents}
          className={inputClass(!!state.errors.required_documents)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Source URL"
          htmlFor="source_url"
          error={state.errors.source_url}
          hint="Required to mark a licence Verified."
        >
          <input
            id="source_url"
            name="source_url"
            defaultValue={values.source_url}
            placeholder="https://..."
            className={inputClass(!!state.errors.source_url)}
          />
        </Field>

        <Field
          label="Last verified date"
          htmlFor="last_verified_date"
          error={state.errors.last_verified_date}
          hint="Required to mark a licence Verified."
        >
          <input
            id="last_verified_date"
            name="last_verified_date"
            type="date"
            defaultValue={values.last_verified_date}
            className={inputClass(!!state.errors.last_verified_date)}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[44px] items-center justify-center rounded-control bg-route px-5 py-2.5 font-signage text-sm font-semibold text-on-route transition-colors hover:bg-route-strong disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function inputClass(hasError: boolean): string {
  return `w-full rounded-control border bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
    hasError ? "border-flag" : "border-hairline"
  }`;
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-signage text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-flag">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}
