/**
 * Typed error for all billing code paths. Every wrapper that touches the
 * Stripe SDK throws a BillingError with a stable machine-readable `code` so
 * API routes can map it to an HTTP status/body without fragile string
 * matching. Unknown Stripe errors are normalised to "stripe_error".
 */
export type BillingErrorCode =
  | "not_configured" // Stripe keys absent (feature flag off)
  | "invalid_metadata" // Stripe metadata failed shape validation
  | "no_customer" // hotel has no Stripe customer yet (portal)
  | "not_found" // referenced row (stay/guest/hotel) missing
  | "stripe_error"; // the Stripe SDK call itself failed

export class BillingError extends Error {
  readonly code: BillingErrorCode;

  constructor(code: BillingErrorCode, message: string) {
    super(message);
    this.name = "BillingError";
    this.code = code;
  }
}

/** Builds a BillingError with a stable message for a given code. */
export function billingError(
  code: BillingErrorCode,
  message = `Billing error: ${code}`,
): BillingError {
  return new BillingError(code, message);
}

/** True when the value is a valid BillingError with one of the known codes. */
export function isBillingError(value: unknown): value is BillingError {
  return value instanceof BillingError;
}
