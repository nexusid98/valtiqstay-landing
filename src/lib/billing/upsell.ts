/**
 * Pure helpers for the GUEST upsell payment flow (M5-2). No I/O and no SDK
 * calls, so this module is safe on both the server (the /api/billing/
 * upsell-checkout route) and the client (the confirmation step's CTA).
 *
 * SECURITY INVARIANT: amounts are always derived from the hotel's
 * upsell_items.price column — never from anything the browser sends. The route
 * passes the requested item's DB row through these helpers and hands the
 * resulting cents to Stripe; the browser only supplies a token, a stay id and
 * an item key (all of which are re-validated server-side).
 */
import { parseCentsFromEuros } from "./amounts";

/** A requested upsell as read from the DB (upsell_items ⋈ upsell_requests). */
export interface RequestedUpsell {
  itemKey: string;
  labelIt: string;
  labelEn: string | null;
  /** upsell_items.price — DECIMAL(10,2), surfaced as number or numeric string. */
  priceEuros: number | string | null;
  /** upsell_requests.quantity */
  quantity: number;
}

/** A Stripe line item computed from the DB price table. */
export interface UpsellCheckoutLine {
  itemKey: string;
  label: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

/**
 * Unit price in integer cents from a DB price value, or null when the value is
 * missing, non-numeric or zero/negative (a zero-price extra must not produce a
 * free Stripe checkout — the route answers 400 instead).
 */
export function upsellUnitCents(priceEuros: number | string | null | undefined): number | null {
  if (priceEuros === null || priceEuros === undefined || priceEuros === "") return null;
  const cents = parseCentsFromEuros(priceEuros as number | string);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return Math.round(cents);
}

/** Preferred label for the locale, falling back to Italian (default locale). */
export function upsellLabel(
  labelIt: string,
  labelEn: string | null | undefined,
  locale: string | null | undefined,
): string {
  return locale === "en" && labelEn ? labelEn : labelIt;
}

/**
 * Builds the single Stripe line item for one requested extra: unit price from
 * the DB, quantity from the upgrade request, label localized for the guest.
 * Returns null when the row cannot be priced (route → HTTP 400).
 *
 * The result is passed to createUpsellCheckoutSession() AS IS: the helper below
 * (stripeUpsellLineAmounts) maps it to Stripe's quantity/unit_amount pair, so a
 * caller never has to pre-multiply anything.
 */
export function buildUpsellCheckoutLine(
  request: RequestedUpsell,
  locale: string | null | undefined,
): UpsellCheckoutLine | null {
  const unitPriceCents = upsellUnitCents(request.priceEuros);
  if (unitPriceCents === null) return null;
  const quantity =
    Number.isFinite(request.quantity) && request.quantity > 0
      ? Math.floor(request.quantity)
      : 1;
  return {
    itemKey: request.itemKey,
    label: upsellLabel(request.labelIt, request.labelEn, locale),
    quantity,
    unitPriceCents,
    totalCents: unitPriceCents * quantity,
  };
}

/**
 * The exact pair that goes into a Stripe Checkout line item for one upsell:
 * `quantity` is the REAL quantity and `unitAmount` is the PER-UNIT price in
 * cents. Stripe multiplies those two itself, so the amount charged is
 * quantity × unitAmount (= totalCents).
 *
 * REGRESSION GUARD (M5-2): the M5-1 wrapper used to pass `quantity` AND
 * `unit_amount: quantity * unitAmount`, which Stripe multiplies again and
 * therefore charged quantity² × unit. Tests in upsell.test.ts fail if anyone
 * reintroduces that pre-multiplication — never derive unitAmount from the total.
 */
export function stripeUpsellLineAmounts(
  quantity: number,
  unitCents: number,
): { quantity: number; unitAmount: number; totalCents: number } {
  const qty = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
  const unitAmount = Number.isFinite(unitCents) && unitCents > 0 ? Math.round(unitCents) : 0;
  return { quantity: qty, unitAmount, totalCents: qty * unitAmount };
}

/**
 * Display-only total of the guest's selected extras (cents), used by the
 * confirmation step's CTA. The server recomputes the chargeable amount from
 * the DB — this figure is never sent to Stripe.
 */
export function guestExtrasTotalCents(
  selections: { priceEuros: number | string | null; quantity: number }[],
): number {
  return selections.reduce((total, selection) => {
    const unit = upsellUnitCents(selection.priceEuros);
    if (unit === null) return total;
    const quantity =
      Number.isFinite(selection.quantity) && selection.quantity > 0
        ? Math.floor(selection.quantity)
        : 1;
    return total + unit * quantity;
  }, 0);
}
