import Link from "next/link";
import { getTranslations } from "next-intl/server";

/**
 * M6-2 — Guided empty state for the session list.
 *
 * Shown when the hotel has no `checkin_sessions` row yet: three short steps
 * explaining how a guest check-in works plus the CTA that creates the first
 * link. Server component — the only interactive element is a link.
 */
export async function SessionsEmptyState({ locale }: { locale: string }) {
  const t = await getTranslations("dashboard.sessions");
  const steps = [1, 2, 3] as const;

  return (
    <div className="mt-10 rounded-sm border border-navy-700 bg-navy-900 px-6 py-10">
      <h2 className="text-center font-serif text-xl text-champagne">{t("emptyTitle")}</h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-navy-300">{t("emptyBody")}</p>

      <h3 className="mt-8 text-center text-xs uppercase tracking-widest text-gold">
        {t("emptyHowTitle")}
      </h3>
      <ol className="mx-auto mt-4 grid max-w-3xl gap-3 sm:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step}
            className="rounded-sm border border-navy-800 bg-navy-950 p-4 text-center"
          >
            <span
              aria-hidden="true"
              className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-gold font-serif text-sm text-gold"
            >
              {step}
            </span>
            <p className="mt-2 text-sm font-medium text-champagne">{t(`emptySteps.${step}.title`)}</p>
            <p className="mt-1 text-xs text-navy-300">{t(`emptySteps.${step}.body`)}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 text-center">
        <Link
          href={`/${locale}/dashboard/sessioni/nuova`}
          className="inline-block rounded-sm bg-gold px-5 py-2.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter"
        >
          {t("emptyCta")}
        </Link>
      </div>
    </div>
  );
}
