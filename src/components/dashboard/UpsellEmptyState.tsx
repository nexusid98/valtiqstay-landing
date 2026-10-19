import Link from "next/link";
import { getTranslations } from "next-intl/server";

/**
 * M6-2 — Empty state for the upsell configuration.
 *
 * Shown on the billing page when the hotel has no `upsell_items` row with
 * `active = true`: the guest check-in then offers no extras and the revenue
 * share below stays empty. Explains what extras are and points at the setup
 * checklist that tracks the extras step (there is no dedicated extras editor
 * page yet, so the CTA goes back to the checklist rather than to a dead link).
 */
export async function UpsellEmptyState({ locale }: { locale: string }) {
  const t = await getTranslations("dashboard.billing.upsellEmpty");

  return (
    <div className="mt-4 rounded-sm border border-dashed border-champagne/40 bg-navy-900 px-5 py-8 text-center">
      <h3 className="font-serif text-lg text-champagne">{t("title")}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-navy-300">{t("body")}</p>
      <Link
        href={`/${locale}/dashboard#setup`}
        className="mt-5 inline-block rounded-sm border border-gold px-5 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold/10 hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
