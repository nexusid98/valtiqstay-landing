"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  buildSubmitPayload,
  fetchClientIp,
  fetchUpsells,
  submitCheckin,
} from "@/lib/checkin/api";
import { CHECKIN_STEPS, useCheckInStore } from "@/lib/checkin-store";
import type { UpsellItemData } from "@/lib/checkin/types";
import { Button, StepCard, cn } from "./ui";
import { ConsentStep } from "./steps/ConsentStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { DocumentStep } from "./steps/DocumentStep";
import { GuestsStep } from "./steps/GuestsStep";
import { UpsellStep } from "./steps/UpsellStep";

const STEP_KEYS = ["guests", "documents", "upsell", "consent", "confirmation"] as const;

export function CheckInStepper() {
  const t = useTranslations("checkin");
  const token = useCheckInStore((state) => state.token);
  const currentStep = useCheckInStore((state) => state.currentStep);
  const setStep = useCheckInStore((state) => state.setStep);
  const markSubmitted = useCheckInStore((state) => state.markSubmitted);

  const [canContinue, setCanContinue] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [upsellItems, setUpsellItems] = useState<UpsellItemData[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchUpsells(token)
      .then((items) => {
        if (!cancelled) setUpsellItems(items);
      })
      .catch(() => {
        if (!cancelled) setUpsellItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleValidChange = useCallback((valid: boolean) => {
    setCanContinue(valid);
  }, []);

  // Entering consent (step 4) or later never blocks on validity.
  useEffect(() => {
    if (currentStep >= 4) setCanContinue(true);
  }, [currentStep]);

  function handleBack() {
    setSubmitError(false);
    setStep(Math.max(1, currentStep - 1));
  }

  async function handleNext() {
    if (currentStep === 4) {
      setSubmitting(true);
      setSubmitError(false);
      try {
        const state = useCheckInStore.getState();
        const ipAddress = await fetchClientIp();
        const payload = buildSubmitPayload({
          token,
          guests: state.guests,
          upsellSelections: state.upsellSelections,
          consentGranted: state.consentGranted,
          consentTextShown: state.consentTextShown,
          ipAddress,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        });
        const result = await submitCheckin(payload);
        if (!result.ok) {
          if (result.error === "already_submitted") {
            markSubmitted();
            setStep(5);
            return;
          }
          setSubmitError(true);
          return;
        }
        markSubmitted();
        setStep(5);
      } catch {
        setSubmitError(true);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep(currentStep + 1);
  }

  const progress = ((currentStep - 1) / (CHECKIN_STEPS.length - 1)) * 100;

  return (
    <main className="relative min-h-dvh bg-navy">
      {/* Thin gold progress bar at the very top */}
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-20 h-0.5 bg-navy-800">
        <div
          className="h-full bg-gold transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col px-4 pb-10 pt-6">
        {/* Step indicator — 5 circles connected by hairlines */}
        <nav
          aria-label={t("progress")}
          className="mb-6 flex items-center justify-center gap-2"
        >
          {CHECKIN_STEPS.map((stepNumber, index) => (
            <Fragment key={STEP_KEYS[index]}>
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px w-6 sm:w-8",
                    stepNumber <= currentStep ? "bg-gold" : "bg-champagne/30",
                  )}
                />
              ) : null}
              <span
                role="img"
                aria-label={t("a11y.stepIndicator", {
                  current: String(stepNumber),
                  total: String(CHECKIN_STEPS.length),
                })}
                aria-current={stepNumber === currentStep ? "step" : undefined}
                className={cn(
                  "h-3 w-3 rounded-full",
                  stepNumber <= currentStep ? "bg-gold" : "bg-champagne/30",
                )}
              />
            </Fragment>
          ))}
        </nav>

        <StepCard className="flex-1">
          {currentStep === 1 ? (
            <GuestsStep onValidChange={handleValidChange} />
          ) : currentStep === 2 ? (
            <DocumentStep onValidChange={handleValidChange} />
          ) : currentStep === 3 ? (
            <UpsellStep items={upsellItems} onValidChange={handleValidChange} />
          ) : currentStep === 4 ? (
            <ConsentStep />
          ) : (
            <ConfirmationStep upsellItems={upsellItems} />
          )}

          {submitError ? (
            <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {t("submit.error")}
            </p>
          ) : null}
        </StepCard>

        {/* Footer navigation */}
        {currentStep < CHECKIN_STEPS.length ? (
          <div className="mt-8 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <Button variant="secondary" onClick={handleBack} disabled={submitting}>
                {t("nav.back")}
              </Button>
            ) : (
              <span aria-hidden="true" />
            )}
            <div className="flex items-center gap-3">
              {currentStep === 3 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep(4)}
                  disabled={submitting}
                >
                  {t("nav.skip")}
                </Button>
              ) : null}
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canContinue || submitting}
              >
                {submitting ? t("submit.inProgress") : t("nav.next")}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
