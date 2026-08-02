"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCheckInStore } from "@/lib/checkin-store";
import { StepHeading } from "../ui";

export function ConsentStep() {
  const t = useTranslations("checkin");
  const locale = useLocale();
  const hotelName = useCheckInStore((state) => state.hotel?.name ?? "");
  const consentGranted = useCheckInStore((state) => state.consentGranted);
  const setConsent = useCheckInStore((state) => state.setConsent);

  const marketingText = t("consent.marketing", { hotelName });

  // Keep the exact text shown to the guest in the store for the audit trail.
  useEffect(() => {
    if (consentGranted) {
      setConsent(consentGranted, marketingText);
    }
  }, [marketingText, consentGranted, setConsent]);

  function handleChange() {
    setConsent(!consentGranted, marketingText);
  }

  return (
    <div>
      <StepHeading title={t("consent.title")} subtitle={t("consent.subtitle")} />

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-champagne/40 p-4">
        <input
          type="checkbox"
          checked={consentGranted}
          onChange={handleChange}
          className="mt-1 h-5 w-5 shrink-0 accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        />
        <span className="text-navy">{marketingText}</span>
      </label>

      <a
        href={`/${locale}/privacy`}
        className="mt-4 inline-flex min-h-[44px] items-center text-sm text-gold-dark underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {t("consent.privacy")}
      </a>

      <p className="mt-2 text-sm text-navy-500">{t("consent.optional")}</p>
    </div>
  );
}
