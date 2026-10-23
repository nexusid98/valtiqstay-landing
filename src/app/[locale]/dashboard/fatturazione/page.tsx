import { getLocale, getTranslations } from "next-intl/server";
import { createClient, requireStaff } from "@/lib/supabase/server";
import { UpsellEmptyState } from "@/components/dashboard/UpsellEmptyState";
import { hasActiveUpsellItem } from "@/lib/onboarding/setup-checklist";

/**
 * Billing page for the staff's own hotel.
 *
 * ValtiqStay bills hotels by monthly bank transfer (bonifico) with an invoice —
 * no card, no payment provider. The invoicing module (monthly invoice records,
 * IBAN, payment declaration) lands in a later phase, so for now the page is a
 * clean, localized "not active yet" state that also explains how guest extras
 * work: the hotel collects them at the desk, the platform never processes a
 * payment.
 *
 * The page reads no billing table yet, so it renders correctly before the
 * revised billing migration is applied.
 */
export default async function BillingPage() {
  await requireStaff();
  const t = await getTranslations("dashboard.billing");
  const locale = await getLocale();
  const supabase = await createClient();

  // Active extras for the guest check-in. RLS (upsell_items_staff_all, scoped by
  // current_hotel_id()) guarantees this read only ever returns this hotel's rows.
  const { data: upsellRaw } = await supabase.from("upsell_items").select("active");
  const hasExtras = hasActiveUpsellItem(upsellRaw ?? []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-gold">{t("title")}</h1>
          <p className="mt-1 text-sm text-champagne/80">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-champagne/40 bg-navy-900 px-5 py-4">
        <p className="text-sm font-medium text-champagne">{t("notice.title")}</p>
        <p className="mt-1 text-sm text-navy-300">{t("notice.body")}</p>
      </div>

      <section
        aria-labelledby="plan-heading"
        className="mt-6 rounded-sm border border-navy-700 bg-navy-900 p-5"
      >
        <h2 id="plan-heading" className="font-serif text-xl text-champagne">
          {t("plan.title")}
        </h2>

        <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-navy-400">{t("plan.name")}</dt>
            <dd className="mt-0.5 text-champagne">{t("plan.nameValue")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-navy-400">{t("plan.price")}</dt>
            <dd className="mt-0.5 text-champagne">{t("plan.priceValue")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-navy-400">{t("plan.method")}</dt>
            <dd className="mt-0.5 text-champagne">{t("plan.methodValue")}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="extras-heading" className="mt-8">
        <h2 id="extras-heading" className="font-serif text-xl text-champagne">
          {t("extras.title")}
        </h2>
        <p className="mt-1 text-sm text-navy-300">{t("extras.body")}</p>
        {!hasExtras ? <UpsellEmptyState locale={locale} /> : null}
      </section>
    </div>
  );
}
