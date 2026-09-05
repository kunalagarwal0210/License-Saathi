"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Answers, AnswerValue, BusinessCategory } from "@/lib/engine/types";
import {
  applySkippedDefaults,
  getResultsHref,
  getVisibleQuestions,
} from "@/lib/questionnaire";
import { CATEGORY_DEFINITIONS } from "@/lib/categories";

type QuestionnaireFlowProps = {
  category: BusinessCategory;
};

// Owns the one-question-at-a-time guided-journey flow (spec §10): current
// step, collected answers, Back/Continue. Presentation-only wiring — all
// question data + branching lives in the pure `src/lib/questionnaire.ts`.
export function QuestionnaireFlow({ category }: QuestionnaireFlowProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0);

  // Visible questions depend on answers so far (the eatery seating branch),
  // so this is recomputed each render rather than fixed up front.
  const visibleQuestions = useMemo(
    () => getVisibleQuestions(category, answers),
    [category, answers]
  );

  const currentQuestion = visibleQuestions[stepIndex];
  const totalSteps = visibleQuestions.length;
  const categoryLabel =
    CATEGORY_DEFINITIONS.find((definition) => definition.id === category)?.label ??
    category;

  if (!currentQuestion) {
    // Defensive fallback — should be unreachable since Continue only advances
    // while a next question exists, and completion navigates away.
    return null;
  }

  const selectedValue = answers[currentQuestion.key];
  const hasSelection = selectedValue !== undefined;

  function selectOption(value: AnswerValue) {
    setAnswers((previous) => ({ ...previous, [currentQuestion.key]: value }));
  }

  function handleBack() {
    if (stepIndex === 0) {
      router.push("/");
      return;
    }
    setStepIndex((index) => index - 1);
  }

  function handleContinue() {
    if (!hasSelection) return;

    if (stepIndex + 1 < visibleQuestions.length) {
      setStepIndex((index) => index + 1);
      return;
    }

    // Last question answered — finalize (fill in skipped-branch defaults)
    // and hand off to the results route via the answers-in-URL contract.
    const finalAnswers = applySkippedDefaults(category, answers);
    router.push(getResultsHref(category, finalAnswers));
  }

  return (
    <div className="flex w-full max-w-[560px] flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-signage text-xs font-semibold uppercase tracking-[0.18em] text-route">
            {categoryLabel} · Ahmedabad
          </span>
          <span className="font-signage text-xs font-semibold tabular-nums text-ink-secondary">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-pill bg-surface-sunk">
          <div
            className="h-full rounded-pill bg-route transition-[width] duration-300 ease-out"
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-signage text-2xl font-bold tracking-tight text-ink">
          {currentQuestion.question}
        </h1>
        <p className="text-base leading-relaxed text-ink-secondary">
          {currentQuestion.subtitle}
        </p>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">{currentQuestion.question}</legend>
        {currentQuestion.options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={isSelected}
              onClick={() => selectOption(option.value)}
              className={`flex min-h-[64px] w-full flex-col items-start justify-center gap-0.5 rounded-card border px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-ground ${
                isSelected
                  ? "border-route bg-route-tint"
                  : "border-hairline bg-surface hover:border-route/40"
              }`}
            >
              <span className="flex w-full items-center justify-between gap-3">
                <span className="font-signage text-base font-semibold text-ink">
                  {option.label}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected ? "border-route bg-route text-on-route" : "border-hairline"
                  }`}
                >
                  {isSelected && (
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M3 8.5 6.2 12 13 4" />
                    </svg>
                  )}
                </span>
              </span>
              {option.sublabel && (
                <span className="text-sm leading-snug text-ink-secondary">
                  {option.sublabel}
                </span>
              )}
            </button>
          );
        })}
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="min-h-[48px] shrink-0 rounded-control border border-hairline bg-surface px-5 py-3 font-signage text-base font-semibold text-ink-secondary transition-colors hover:border-route/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!hasSelection}
          onClick={handleContinue}
          className="min-h-[48px] flex-1 rounded-control bg-route px-6 py-3 font-signage text-base font-semibold text-on-route shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-colors hover:bg-route-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-route focus-visible:ring-offset-2 focus-visible:ring-offset-ground disabled:cursor-not-allowed disabled:bg-surface-sunk disabled:text-ink-muted disabled:shadow-none"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
