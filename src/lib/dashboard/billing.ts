/**
 * Pure helpers + shared types for the staff dashboard's BILLING page (M5-2).
 * No I/O and no request context here — everything is unit-testable. Session
 * list helpers live in sessions.ts, detail helpers in detail.ts.
 *
 * Money is always integer cents (Stripe's unit); formatting goes through
 * formatCents() in src/lib/billing/amounts.ts.
 */

/** The subscription statuses a hotel_billing row can hold (DB CHECK). */
export type BillingStatus = "none" | "trialing" | "active" | "past_due" | "canceled";

export const BILLING_STATUSES: readonly BillingStatus[] = [
  "none",
  "trialing",
  "active",
  "past_due",
  "canceled",
];

/** The statuses an upsell_ledger row can hold (DB CHECK). */
export type LedgerStatus = "pending" | "paid" | "refunded" | "failed";

export const LEDGER_STATUSES: readonly LedgerStatus[] = [
  "pending",
  "paid",
  "refunded",
  "failed",
];

/** i18n key suffix for a billing status (under dashboard.billing.status). */
export type BillingStatusKey = "none" | "trialing" | "active" | "pastDue" | "canceled";

/** The columns the billing page reads from public.hotel_billing. */
export interface HotelBillingRecord {
  hotel_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: string;
  current_period_end: string | null;
}

/** A recent row from public.upsell_ledger, as read through RLS. */
export interface UpsellLedgerRecord {
  id: string;
  item_key: string;
  quantity: number;
  gross_cents: number;
  hotel_share_cents: number;
  platform_share_cents: number;
  currency: string;
  status: string;
  created_at: string | null;
}

/** A ledger row flattened for rendering (ids/dates resolved by the page). */
export interface LedgerRowView {
  id: string;
  itemKey: string;
  quantity: number;
  grossCents: number;
  hotelCents: number;
  platformCents: number;
  status: LedgerStatus;
  createdAt: string | null;
}

/**
 * Normalizes a DB/Stripe status string onto the BillingStatus union.
 * Anything unexpected (including null/undefined) reads as "none" so the page
 * never renders an unlabelled badge.
 */
export function mapBillingStatus(status: string | null | undefined): BillingStatus {
  return BILLING_STATUSES.includes(status as BillingStatus)
    ? (status as BillingStatus)
    : "none";
}

/**
 * i18n key suffix for a billing status. `past_due` becomes `pastDue` so the
 * key is a valid dotted JSON path segment (no underscores in message keys).
 */
export function billingStatusLabelKey(status: BillingStatus): BillingStatusKey {
  return status === "past_due" ? "pastDue" : status;
}

/**
 * Tailwind classes for the billing-status pill, keyed off the design tokens
 * (navy/gold/champagne only — never ad-hoc hex). Mirrors statusBadgeClasses()
 * in sessions.ts.
 */
export function billingStatusBadgeClasses(status: BillingStatus): string {
  switch (status) {
    case "none":
      return "border-navy-400 text-navy-400";
    case "trialing":
      return "border-champagne/40 text-champagne";
    case "active":
      return "border-gold bg-gold text-navy-950";
    case "past_due":
      return "border-gold/60 bg-gold/10 text-gold-light";
    case "canceled":
      return "border-navy-400 text-navy-400";
  }
}

/**
 * True when the hotel already has a Stripe customer AND subscription, i.e. it
 * has subscribed at least once. Only then does the page offer the "manage
 * subscription" (Billing Portal) action; otherwise the only CTA is subscribe.
 */
export function hasManagedSubscription(row: HotelBillingRecord | null): boolean {
  return Boolean(row?.stripe_customer_id && row?.stripe_subscription_id);
}

/** True when the hotel has a Stripe customer at all (portal can be opened). */
export function hasStripeCustomer(row: HotelBillingRecord | null): boolean {
  return Boolean(row?.stripe_customer_id);
}

/** Whether the page may offer the "subscribe" CTA. */
export function canStartSubscription(
  configured: boolean,
  priceConfigured: boolean,
  row: HotelBillingRecord | null,
): boolean {
  if (!configured || !priceConfigured) return false;
  // An active/trialing subscription should be *managed*, not re-purchased.
  const status = mapBillingStatus(row?.status);
  return status !== "active" && status !== "trialing";
}

/** Normalizes an incoming locale to the two locales shipped by the app. */
export function billingLocale(locale: string | null | undefined): "it" | "en" {
  return locale === "en" ? "en" : "it";
}

/**
 * Formats a `current_period_end` timestamp as a day-month-year date in the
 * requested locale, or null when it is missing/unparseable. Rendered in UTC so
 * the label never drifts with the server's timezone (same convention as
 * formatDateTime in detail.ts). Bare "en" resolves to en-GB (day-first).
 */
export function formatPeriodEnd(
  iso: string | null | undefined,
  locale: string | null | undefined,
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const tag = billingLocale(locale) === "en" ? "en-GB" : "it-IT";
  return new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Normalizes an upsell_ledger status string onto the LedgerStatus union. */
export function mapLedgerStatus(status: string | null | undefined): LedgerStatus {
  return LEDGER_STATUSES.includes(status as LedgerStatus)
    ? (status as LedgerStatus)
    : "pending";
}

/** Tailwind classes for the ledger-status pill (shared base lives in the page). */
export function ledgerStatusBadgeClasses(status: LedgerStatus): string {
  switch (status) {
    case "pending":
      return "border-champagne/40 text-champagne";
    case "paid":
      return "border-gold/60 bg-gold/10 text-gold-light";
    case "refunded":
      return "border-navy-400 text-navy-300";
    case "failed":
      return "border-navy-400 text-navy-400";
  }
}

/**
 * Flattens a raw upsell_ledger row for rendering. Cents are coerced to numbers
 * (PostgREST surfaces INT columns as numbers, but a string is tolerated) and
 * the status is normalized so an unexpected value still renders a labelled pill.
 */
export function mapLedgerRow(raw: UpsellLedgerRecord): LedgerRowView {
  return {
    id: raw.id,
    itemKey: raw.item_key,
    quantity: Number.isFinite(Number(raw.quantity)) ? Number(raw.quantity) : 1,
    grossCents: Number(raw.gross_cents) || 0,
    hotelCents: Number(raw.hotel_share_cents) || 0,
    platformCents: Number(raw.platform_share_cents) || 0,
    status: mapLedgerStatus(raw.status),
    createdAt: raw.created_at,
  };
}

/** Maps a fresh ledger read onto view rows (missing/null rows → []). */
export function mapLedgerRows(
  raw: UpsellLedgerRecord[] | null | undefined,
): LedgerRowView[] {
  return (raw ?? []).map(mapLedgerRow);
}

/** Sum of the hotel's share across the given ledger rows (integer cents). */
export function sumHotelShare(rows: LedgerRowView[]): number {
  return rows.reduce((total, row) => total + row.hotelCents, 0);
}

/** Sum of the platform's share across the given ledger rows (integer cents). */
export function sumPlatformShare(rows: LedgerRowView[]): number {
  return rows.reduce((total, row) => total + row.platformCents, 0);
}
