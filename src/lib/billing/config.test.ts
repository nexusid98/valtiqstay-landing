import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SUBSCRIPTION_PRICE_ID, isBillingConfigured } from "./config";

const KEY_NAMES = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_SUBSCRIPTION_PRICE_ID"] as const;
const saved: Partial<Record<(typeof KEY_NAMES)[number], string | undefined>> = {};

beforeEach(() => {
  for (const name of KEY_NAMES) saved[name] = process.env[name];
});
afterEach(() => {
  for (const name of KEY_NAMES) {
    const value = saved[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("isBillingConfigured", () => {
  it("is false when both keys are missing", () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(isBillingConfigured()).toBe(false);
  });
  it("is false when only one key is present", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(isBillingConfigured()).toBe(false);
    delete process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    expect(isBillingConfigured()).toBe(false);
  });
  it("is true when both keys are present", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    expect(isBillingConfigured()).toBe(true);
  });
});

describe("SUBSCRIPTION_PRICE_ID", () => {
  it("is the env override when set", () => {
    process.env.STRIPE_SUBSCRIPTION_PRICE_ID = "price_abc123";
    expect(SUBSCRIPTION_PRICE_ID()).toBe("price_abc123");
  });
  it("is empty when unset", () => {
    delete process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    expect(SUBSCRIPTION_PRICE_ID()).toBe("");
  });
});