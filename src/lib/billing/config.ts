/**
 * Billing configuration. Everything reads the environment at call time (not
 * import time) so it is easy to unit test with different env values and so
 * the app runs cleanly with NO Stripe keys present.
 *
 * Feature flag: `isBillingConfigured()` is true only when BOTH
 * STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set. Until then every
 * billing code path must degrade gracefully (API returns
 * "billing_not_configured"; no live Stripe SDK call is attempted).
 */
export function isBillingConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
  );
}

/**
 * The Stripe Price id for the flat SaaS subscription, overridable via
 * STRIPE_SUBSCRIPTION_PRICE_ID. Implemented as a function (rather than a
 * module constant) so it reads the env at call time and can be unit-tested by
 * mutating process.env. Empty string until the owner creates the real price
 * in their Stripe account (M5-3).
 */
export const SUBSCRIPTION_PRICE_ID = (): string =>
  process.env.STRIPE_SUBSCRIPTION_PRICE_ID ?? "";

/** Revenue share: the platform keeps this % of each gross upsell payment. */
export const PLATFORM_SHARE_PCT = 20;
/** Revenue share: the hotel keeps this % of each gross upsell payment. */
export const HOTEL_SHARE_PCT = 80;