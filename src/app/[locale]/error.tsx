"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

/**
 * Localized error boundary for the [locale] subtree. Client component, as Next
 * requires: it renders inside the locale layout, so the message catalog from
 * NextIntlClientProvider is available and the copy follows the guest's locale.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common.error");

  useEffect(() => {
    // Surface the failure in the browser console / Vercel logs.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-navy px-6 text-center">
      <h1 className="font-serif text-3xl text-white sm:text-4xl">{t("title")}</h1>
      <div aria-hidden="true" className="my-6 h-px w-[120px] bg-gold/60" />
      <p className="max-w-sm text-champagne">{t("body")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-10 inline-flex min-h-[48px] items-center justify-center rounded-full bg-gold px-6 py-3 text-base font-semibold text-navy transition-colors hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {t("retry")}
      </button>
    </main>
  );
}
