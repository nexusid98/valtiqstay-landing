import { getLocale, getTranslations } from "next-intl/server";
import { createClient, requireStaff } from "@/lib/supabase/server";
import { BillingActionButton } from "@/components/dashboard/BillingActionButton";
import { UpsellEmptyState } from "@/components/dashboard/UpsellEmptyState";
import { hasActiveUpsellItem } from "@/lib/onboarding/setup-checklist";
import { isBillingConfigured, SUBSCRIPTION_PRICE_ID } from "@/lib/billing/config";
import { formatCents } from "@/lib/billing/amounts";
import {
  billingLocale,
  billingStatusBadgeClasses,
  billingStatusLabelKey,
  canStartSubscription,
  formatPeriodEnd,
  hasStripeCustomer,
  ledgerStatusBadgeClasses,
  mapBillingStatus,
  mapLedgerRows,
  sumHotelShare,
  sumPlatformShare,
  type HotelBillingRecord,
  type UpsellLedgerRecord,
} from "@/lib/dashboard/billing";

/** How many ledger rows the page shows (most recent first). */
const LEDGER_LIMIT = 20;

/**
 * Billing page for the staff's own hotel: subscription status + the upsell
 * revenue-share ledger. Every read goes through the authenticated (cookie)
 * server client, so RLS (hotel_billing_staff_select / upsell_ledger_staff_
 * select, both scoped by current_hotel_id()) guarantees a hotel only ever sees
 * its own rows — no tenant filtering in app code.
 *
 * Renders without any Stripe keys: when isBillingConfigured() is false the
 * page shows a "billing not configured" notice instead of dead buttons.
 */
export default async function BillingPage() {
  await requireStaff();
  const t = await getTranslations("dashboard.billing");
  const locale = await getLocale();
  const supabase = await createClient();

  const configured = isBillingConfigured();
  const priceConfigured = Boolean(SUBSCRIPTION_PRICE_ID());

  const { data: billingRaw } = await supabase
    .from("hotel_billing")
    .select(
      "hotel_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, status, current_period_end",
    )
    .maybeSingle();

  const billing = (billingRaw ?? null) as HotelBillingRecord | null;
  const status = mapBillingStatus(billing?.status);
  const periodEnd = formatPeriodEnd(billing?.current_period_end, locale);
  const showSubscribe = canStartSubscription(configured, priceConfigured, billing);
  const showPortal = configured && hasStripeCustomer(billing);

  const { data: ledgerRaw } = await supabase
    .from("upsell_ledger")
    .select(
      "id, item_key, quantity, gross_cents, hotel_share_cents, platform_share_cents, currency, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(LEDGER_LIMIT);

  const ledger = mapLedgerRows((ledgerRaw ?? []) as UpsellLedgerRecord[]);
  const totals = {
    hotel: sumHotelShare(ledger),
    platform: sumPlatformShare(ledger),
  };
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

      {!configured ? (
        <div className="mt-6 rounded-sm border border-champagne/40 bg-navy-900 px-5 py-4">
          <p className="text-sm font-medium text-champagne">{t("notConfigured.title")}</p>
          <p className="mt-1 text-sm text-navy-300">{t("notConfigured.body")}</p>
        </div>
      ) : null}

      <section aria-labelledby="plan-heading" className="mt-6 rounded-sm border border-navy-700 bg-navy-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="plan-heading" className="font-serif text-xl text-champagne">
            {t("plan.title")}
          </h2>
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${billingStatusBadgeClasses(status)}`}
          >
            {t(`status.${billingStatusLabelKey(status)}`)}
          </span>
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-navy-400">{t("plan.price")}</dt>
            <dd className="mt-0.5 text-champagne">
              {priceConfigured ? t("plan.priceValue") : t("plan.priceUnknown")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-navy-400">
              {t("plan.periodEnd")}
            </dt>
            <dd className="mt-0.5 text-champagne">
              {periodEnd ?? t("plan.periodEndUnknown")}
            </dd>
          </div>
        </dl>

        {configured ? (
          <div className="mt-5 flex flex-wrap items-start gap-3">
            {showSubscribe ? (
              <BillingActionButton
                endpoint="/api/billing/checkout"
                label={t("actions.subscribe")}
                pendingLabel={t("actions.subscribePending")}
                errorLabel={t("errors.generic")}
              />
            ) : null}
            {showPortal ? (
              <BillingActionButton
                endpoint="/api/billing/portal"
                label={t("actions.manage")}
                pendingLabel={t("actions.managePending")}
                errorLabel={t("errors.generic")}
                variant="secondary"
              />
            ) : null}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="ledger-heading" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="ledger-heading" className="font-serif text-xl text-champagne">
            {t("ledger.title")}
          </h2>
          {ledger.length > 0 ? (
            <p className="text-xs text-navy-300">
              {t("ledger.totals", {
                hotel: formatCents(totals.hotel, billingLocale(locale)),
                platform: formatCents(totals.platform, billingLocale(locale)),
              })}
            </p>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-navy-300">{t("ledger.subtitle")}</p>
        {!hasExtras ? <UpsellEmptyState locale={locale} /> : null}

        {ledger.length === 0 ? (
          <div className="mt-4 rounded-sm border border-navy-700 bg-navy-900 px-6 py-10 text-center">
            <p className="text-sm text-navy-300">{t("ledger.empty")}</p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-sm border border-navy-700 bg-navy-900">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">{t("ledger.title")}</caption>
              <thead>
                <tr className="border-b border-navy-700 text-xs uppercase tracking-wide text-navy-400">
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("ledger.item")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("ledger.quantity")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("ledger.gross")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("ledger.hotelShare")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("ledger.platformShare")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("ledger.statusHeading")}
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    {t("ledger.date")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((row) => (
                  <tr key={row.id} className="border-b border-navy-800 last:border-0">
                    <td className="px-4 py-3 text-champagne">{row.itemKey}</td>
                    <td className="px-4 py-3 text-champagne">{row.quantity}</td>
                    <td className="px-4 py-3 text-champagne">
                      {formatCents(row.grossCents, billingLocale(locale))}
                    </td>
                    <td className="px-4 py-3 text-champagne">
                      {formatCents(row.hotelCents, billingLocale(locale))}
                    </td>
                    <td className="px-4 py-3 text-champagne">
                      {formatCents(row.platformCents, billingLocale(locale))}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${ledgerStatusBadgeClasses(row.status)}`}
                      >
                        {t(`ledger.status.${row.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy-300">
                      {formatPeriodEnd(row.createdAt, locale) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
