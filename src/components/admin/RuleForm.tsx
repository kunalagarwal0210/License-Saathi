"use client";

import { useActionState, type ReactNode } from "react";
import type { RuleFormInput } from "@/lib/admin/ruleForm";
import type { RuleActionState } from "@/app/admin/actions";

type LicenseOption = { id: string; name: string };

type RuleFormProps = {
  action: (state: RuleActionState, formData: FormData) => Promise<RuleActionState>;
  initialValues: RuleFormInput;
  licenseOptions: LicenseOption[];
  submitLabel: string;
};

// Ticket 09 — a rule row: category, condition (jsonb answer-key predicate),
// license_id (FK, shown as a licence-name select), sequence (drives order).
// Condition is entered as a JSON textarea; src/lib/admin/ruleForm.ts
// validates it parses to a plain object ({} = always applies).
export function RuleForm({ action, initialValues, licenseOptions, submitLabel }: RuleFormProps) {
  const [state, formAction, pending] = useActionState(action, {
    values: initialValues,
    errors: {},
  });
  const values = state.values;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.formError && (
        <p className="rounded-control bg-flag-tint px-3 py-2 text-sm font-medium text-flag">
          {state.formError}
        </p>
      )}

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

        <Field label="Sequence" htmlFor="sequence" error={state.errors.sequence} hint="Drives evaluation/display order.">
          <input
            id="sequence"
            name="sequence"
            inputMode="numeric"
            defaultValue={values.sequence}
            className={inputClass(!!state.errors.sequence)}
          />
        </Field>
      </div>

      <Field label="Licence" htmlFor="license_id" error={state.errors.license_id}>
        <select
          id="license_id"
          name="license_id"
          defaultValue={values.license_id}
          className={inputClass(!!state.errors.license_id)}
        >
          <option value="" disabled>
            Choose a licence…
          </option>
          {licenseOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Condition (JSON)"
        htmlFor="condition"
        error={state.errors.condition}
        hint={'Answer-key predicate, e.g. {"turnover_band":"over_40L"}. Leave blank or {} for "always applies".'}
      >
        <textarea
          id="condition"
          name="condition"
          rows={4}
          defaultValue={values.condition}
          className={`${inputClass(!!state.errors.condition)} font-mono text-[13px]`}
        />
      </Field>

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
