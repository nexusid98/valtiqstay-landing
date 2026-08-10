"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckinError, fetchSession, startSession } from "@/lib/checkin/api";
import { useCheckInStore } from "@/lib/checkin-store";
import type { CheckinErrorCode } from "@/lib/checkin/types";
import { ArrivoScreen } from "./ArrivoScreen";
import { CheckInStepper } from "./CheckInStepper";
import { Button } from "./ui";

function ErrorScreen({
  code,
  onRetry,
}: {
  code: CheckinErrorCode;
  onRetry: () => void;
}) {
  const t = useTranslations("checkin");

  let message: string;
  if (code === "invalid_token") message = t("errors.invalidToken");
  else if (code === "expired_token") message = t("errors.expiredToken");
  else if (code === "already_submitted") message = t("errors.alreadySubmitted");
  else message = t("errors.generic");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-navy px-6 text-center">
      <p className="max-w-sm text-base text-champagne">{message}</p>
      {code === "unknown" ? (
        <Button
          variant="primary"
          onClick={onRetry}
          className="mt-8 w-full max-w-[280px]"
        >
          {t("errors.retry")}
        </Button>
      ) : null}
    </main>
  );
}

function LoadingScreen() {
  const t = useTranslations("checkin");
  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy">
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-champagne/30 border-t-gold"
      />
      <p role="status" className="sr-only">
        {t("a11y.loading")}
      </p>
    </main>
  );
}

/**
 * Client entry point for /[locale]/c/[token].
 * - Resumes from sessionStorage when the saved token matches and the flow
 *   has not been submitted yet.
 * - Otherwise validates the token against get_stay_by_session_token and
 *   renders L'Arrivo.
 */
export function CheckinFlow({ token }: { token: string }) {
  const t = useTranslations("checkin");
  const currentStep = useCheckInStore((state) => state.currentStep);
  const status = useCheckInStore((state) => state.status);
  const hotel = useCheckInStore((state) => state.hotel);
  const setStep = useCheckInStore((state) => state.setStep);
  const markInProgress = useCheckInStore((state) => state.markInProgress);

  const [booting, setBooting] = useState(true);
  const [fatalError, setFatalError] = useState<CheckinErrorCode | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const saved = useCheckInStore.getState();

      // Resume from sessionStorage without re-validating the token.
      if (
        saved.token === token &&
        (saved.status === "loaded" ||
          saved.status === "in_progress" ||
          saved.status === "submitted")
      ) {
        setBooting(false);
        return;
      }

      try {
        const data = await fetchSession(token);
        if (cancelled) return;
        useCheckInStore.getState().setSession(token, data);
        setFatalError(null);
      } catch (error) {
        if (cancelled) return;
        setFatalError(error instanceof CheckinError ? error.code : "unknown");
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleBegin = useCallback(() => {
    setStep(1);
    markInProgress();
    // Best-effort server-side status update; non-fatal if it fails.
    startSession(token).catch(() => {
      /* the flow remains usable client-side */
    });
  }, [token, setStep, markInProgress]);

  const handleRetry = useCallback(() => {
    setBooting(true);
    setFatalError(null);
    // Force a fresh fetch by clearing any partial saved state.
    const saved = useCheckInStore.getState();
    if (saved.token !== token) {
      useCheckInStore.getState().reset();
    }
    fetchSession(token)
      .then((data) => {
        useCheckInStore.getState().setSession(token, data);
        setBooting(false);
      })
      .catch((error: unknown) => {
        setFatalError(error instanceof CheckinError ? error.code : "unknown");
        setBooting(false);
      });
  }, [token]);

  if (booting) return <LoadingScreen />;
  if (fatalError) return <ErrorScreen code={fatalError} onRetry={handleRetry} />;

  // A submitted flow always lands on the confirmation step.
  if (status === "submitted" || currentStep === 5) {
    return <CheckInStepper />;
  }
  if (currentStep === 0) {
    return hotel ? <ArrivoScreen hotel={hotel} onBegin={handleBegin} /> : <LoadingScreen />;
  }
  return <CheckInStepper />;
}
