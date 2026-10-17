/**
 * Pure webhook dispatch/metadata logic for the billing webhook route. Kept
 * free of any SDK/DB I/O so it can be unit-tested directly. The route handler
 * is responsible for signature verification, idempotent storage, and the
 * actual DB writes — this module only decides *what* to do and *validates*
 * shape.
 *
 * Why a dedicated module: the metadata values arrive from Stripe and are
 * UNTRUSTED. Every read goes through `parse*Metadata` which rejects anything
 * that does not match the expected shape before any row is written.
 */
import { billingError, BillingError } from "./errors";

/** Event types the webhook actually reacts to (the dispatch map). */
export const HANDLED_EVENT_TYPES = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
] as const;

export type HandledEventType = (typeof HANDLED_EVENT_TYPES)[number];

/**
 * Pure idempotency/dispatch map: whether a given Stripe event type is one we
 * have a handler for. Unknown/unhandled events are stored in webhook_events
 * for the audit trail but otherwise ignored (200, no-op).
 */
export function isHandledEventType(type: string): boolean {
  return (HANDLED_EVENT_TYPES as readonly string[]).includes(type);
}

// ---------------------------------------------------------------------------
// Metadata validation (Stripe metadata is untrusted)
// ---------------------------------------------------------------------------
export interface SubscriptionMetadata {
  hotelId: string;
  kind: "subscription";
}
export interface UpsellPaymentMetadata {
  hotelId: string;
  stayId: string;
  itemKey: string;
  kind: "upsell_payment";
  guestId?: string;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: BillingError };

/** Stripe Checkout session metadata shape. */
export type StripeMetadata = Record<string, string> | null | undefined;

function nonEmpty(meta: StripeMetadata, key: string): boolean {
  return Boolean(meta) && typeof meta![key] === "string" && meta![key].trim().length > 0;
}

/**
 * Validates the metadata of a subscription-mode Checkout Session. Requires
 * kind === "subscription" and a present hotel_id. Existence of the hotel row
 * itself is checked by the route (service-role query) before writing.
 */
export function parseSubscriptionMetadata(
  metadata: StripeMetadata,
): ParseResult<SubscriptionMetadata> {
  if (metadata?.kind !== "subscription" || !nonEmpty(metadata, "hotel_id")) {
    return {
      ok: false,
      error: billingError(
        "invalid_metadata",
        "Subscription checkout metadata missing or malformed (need kind=subscription and hotel_id).",
      ),
    };
  }
  return { ok: true, value: { kind: "subscription", hotelId: metadata.hotel_id } };
}

/**
 * Validates the metadata of an upsell-payment Checkout Session. Requires
 * kind === "upsell_payment", plus hotel_id, stay_id and item_key. guest_id is
 * optional. Stay/guest/hotel existence is checked by the route before writing.
 */
export function parseUpsellPaymentMetadata(
  metadata: StripeMetadata,
): ParseResult<UpsellPaymentMetadata> {
  const required = ["hotel_id", "stay_id", "item_key"].every((k) => nonEmpty(metadata, k));
  if (metadata?.kind !== "upsell_payment" || !required) {
    return {
      ok: false,
      error: billingError(
        "invalid_metadata",
        "Upsell checkout metadata missing or malformed (need kind=upsell_payment, hotel_id, stay_id, item_key).",
      ),
    };
  }
  const value: UpsellPaymentMetadata = {
    kind: "upsell_payment",
    hotelId: metadata!.hotel_id,
    stayId: metadata!.stay_id,
    itemKey: metadata!.item_key,
  };
  if (nonEmpty(metadata, "guest_id")) value.guestId = metadata!.guest_id;
  return { ok: true, value };
}
