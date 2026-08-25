import { describe, expect, it } from "vitest";
import { BillingError, billingError, isBillingError } from "./errors";

describe("BillingError", () => {
  it("carries a stable code and message", () => {
    const err = new BillingError("not_configured", "no keys");
    expect(err.code).toBe("not_configured");
    expect(err.message).toBe("no keys");
    expect(err.name).toBe("BillingError");
  });
  it("billingError builder produces the same shape", () => {
    const err = billingError("stripe_error");
    expect(err.code).toBe("stripe_error");
    expect(err.message).toBe("Billing error: stripe_error");
  });
  it("isBillingError guards instanceof", () => {
    expect(isBillingError(new BillingError("no_customer", "x"))).toBe(true);
    expect(isBillingError(new Error("plain"))).toBe(false);
    expect(isBillingError("nope")).toBe(false);
    expect(isBillingError(null)).toBe(false);
  });
});