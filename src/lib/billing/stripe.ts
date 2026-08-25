/**
 * Thin, typed wrappers around the Stripe SDK. Server-side only (nodejs
 * runtime, import in API route handlers). Every wrapper:
 *   - returns/throws a typed BillingError instead of letting raw SDK errors
 *     escape;
 *   - throws BillingError("not_configured") when the feature flag is off, so
 *     the SDK is NEVER called without a key.
 *
 * createStripe() returns `null` (not a throw) when billing is not configured,
 * matching the "degrade gracefully" requirement; the thin wrappers below use
 * it and throw the typed error, which the route handlers map to HTTP 503.
 */
import Stripe from "stripe";
import { isBillingConfigured } from "./config";
import { BillingError, billingError } from "./errors";

/** The Stripe client, or null when billing is not configured. */
export function createStripe(): Stripe | null {
  if (!isBillingConfigured()) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY as string);
}

/** Type guard: is billing feature-flagged on AND a client exists? */
export function requireStripe(): Stripe {
  const stripe = createStripe();
  if (!stripe) {
    throw billingError(
      "not_configured",
      "Billing is not configured: STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET are missing.",
    );
  }
  return stripe;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CreateHotelCheckoutParams {
  hotelId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface UpsellLineItem {
  itemKey: string;
  quantity: number;
  unitPriceCents: number;
  label: string;
}

export interface CreateUpsellCheckoutParams {
  hotelId: string;
  stayId: string;
  guestId?: string;
  lineItem: UpsellLineItem;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalParams {
  customerId: string;
  returnUrl: string;
}

// ---------------------------------------------------------------------------
// Wrappers
// ---------------------------------------------------------------------------
/**
 * Creates a hosted Checkout Session in subscription mode for a hotel's SaaS
 * plan. The hotel id travels in the session metadata (kind: "subscription")
 * so the webhook can attribute the resulting subscription to the right hotel.
 */
export async function createHotelCheckoutSession(
  params: CreateHotelCheckoutParams,
): Promise<Stripe.Checkout.Session> {
  const stripe = requireStripe();
  try {
    return await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: params.email,
      line_items: [{ price: params.priceId, quantity: 1 }],
      metadata: { hotel_id: params.hotelId, kind: "subscription" },
      subscription_data: {
        metadata: { hotel_id: params.hotelId, kind: "subscription" },
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  } catch (error) {
    throw toBillingError(error);
  }
}

/**
 * Creates a hosted Checkout Session in payment (one-time) mode for a guest
 * upsell. The line item unit price comes from the DB (hotel-configured), and
 * the hotel/stay identifiers travel in the metadata (kind: "upsell_payment").
 * Stripe records the ACTUAL amount collected; the webhook uses
 * session.amount_total as the source of truth (never client input).
 */
export async function createUpsellCheckoutSession(
  params: CreateUpsellCheckoutParams,
): Promise<Stripe.Checkout.Session> {
  const stripe = requireStripe();
  const { lineItem } = params;
  const quantity = lineItem.quantity > 0 ? lineItem.quantity : 1;
  const unitAmount = lineItem.unitPriceCents > 0 ? lineItem.unitPriceCents : 0;
  try {
    return await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity,
          price_data: {
            currency: "eur",
            unit_amount: quantity * unitAmount,
            product_data: { name: lineItem.label },
          },
        },
      ],
      metadata: {
        hotel_id: params.hotelId,
        stay_id: params.stayId,
        kind: "upsell_payment",
        ...(params.guestId ? { guest_id: params.guestId } : {}),
        item_key: lineItem.itemKey,
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  } catch (error) {
    throw toBillingError(error);
  }
}

/** Creates a Stripe Billing Portal session so the hotel can manage its plan. */
export async function createBillingPortalSession(
  params: CreatePortalParams,
): Promise<Stripe.BillingPortal.Session> {
  const stripe = requireStripe();
  try {
    return await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    });
  } catch (error) {
    throw toBillingError(error);
  }
}

/**
 * Verifies a raw webhook payload against STRIPE_WEBHOOK_SECRET and returns the
 * typed Event. Throws BillingError("stripe_error") on signature mismatch (the
 * route maps that to HTTP 400).
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string,
): Stripe.Event {
  const stripe = requireStripe();
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error) {
    throw toBillingError(error);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function toBillingError(error: unknown): BillingError {
  if (error instanceof BillingError) return error;
  if (error instanceof Stripe.errors.StripeError) {
    return new BillingError("stripe_error", error.message);
  }
  const message = error instanceof Error ? error.message : String(error);
  return new BillingError("stripe_error", message);
}
