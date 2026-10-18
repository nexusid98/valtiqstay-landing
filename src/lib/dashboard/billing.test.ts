import { describe, expect, it } from "vitest";
import {
  billingLocale,
  billingStatusBadgeClasses,
  billingStatusLabelKey,
  canStartSubscription,
  formatPeriodEnd,
  hasManagedSubscription,
  hasStripeCustomer,
  ledgerStatusBadgeClasses,
  mapBillingStatus,
  mapLedgerRow,
  mapLedgerRows,
  sumHotelShare,
  sumPlatformShare,
  type HotelBillingRecord,
  type UpsellLedgerRecord,
} from "./billing";

const billing = (over: Partial<HotelBillingRecord> = {}): HotelBillingRecord => ({
  hotel_id: "11111111-1111-1111-1111-111111111111",
  stripe_customer_id: null,
  stripe_subscription_id: null,
  stripe_price_id: null,
  status: "none",
  current_period_end: null,
  ...over,
});

const ledger = (over: Partial<UpsellLedgerRecord> = {}): UpsellLedgerRecord => ({
  id: "row-1",
  item_key: "late_checkout",
  quantity: 1,
  gross_cents: 3000,
  hotel_share_cents: 2400,
  platform_share_cents: 600,
  currency: "eur",
  status: "paid",
  created_at: "2026-08-25T10:00:00.000Z",
  ...over,
});

describe("mapBillingStatus", () => {
  it("keeps known statuses", () => {
    for (const status of ["none", "trialing", "active", "past_due", "canceled"] as const) {
      expect(mapBillingStatus(status)).toBe(status);
    }
  });

  it("falls back to none for unknown/nullish values", () => {
    expect(mapBillingStatus("paused")).toBe("none");
    expect(mapBillingStatus(null)).toBe("none");
    expect(mapBillingStatus(undefined)).toBe("none");
  });
});

describe("billingStatusLabelKey", () => {
  it("converts past_due to a dotted-path-safe camelCase key", () => {
    expect(billingStatusLabelKey("past_due")).toBe("pastDue");
    expect(billingStatusLabelKey("active")).toBe("active");
    expect(billingStatusLabelKey("none")).toBe("none");
  });
});

describe("billingStatusBadgeClasses", () => {
  it("uses design-token classes only (no ad-hoc hex)", () => {
    for (const status of ["none", "trialing", "active", "past_due", "canceled"] as const) {
      const classes = billingStatusBadgeClasses(status);
      expect(classes).toMatch(/^(border|bg|text)-/);
      expect(classes).not.toMatch(/#[0-9a-f]{3,6}/i);
    }
    expect(billingStatusBadgeClasses("active")).toContain("bg-gold");
  });
});

describe("ledgerStatusBadgeClasses", () => {
  it("returns token-based classes for every status", () => {
    expect(ledgerStatusBadgeClasses("paid")).toContain("gold");
    expect(ledgerStatusBadgeClasses("pending")).toContain("champagne");
    expect(ledgerStatusBadgeClasses("failed")).toContain("navy");
    expect(ledgerStatusBadgeClasses("refunded")).toContain("navy");
  });
});

describe("hasManagedSubscription / hasStripeCustomer", () => {
  it("is false with no row or no ids", () => {
    expect(hasManagedSubscription(null)).toBe(false);
    expect(hasManagedSubscription(billing())).toBe(false);
    expect(hasManagedSubscription(billing({ stripe_customer_id: "cus_1" }))).toBe(false);
  });

  it("is true when both customer and subscription exist", () => {
    const row = billing({ stripe_customer_id: "cus_1", stripe_subscription_id: "sub_1" });
    expect(hasManagedSubscription(row)).toBe(true);
    expect(hasStripeCustomer(row)).toBe(true);
  });

  it("hasStripeCustomer is true with only a customer id", () => {
    expect(hasStripeCustomer(billing({ stripe_customer_id: "cus_1" }))).toBe(true);
    expect(hasStripeCustomer(billing())).toBe(false);
  });
});

describe("canStartSubscription", () => {
  it("is false when billing is not configured", () => {
    expect(canStartSubscription(false, true, null)).toBe(false);
  });

  it("is false when no Stripe price is configured", () => {
    expect(canStartSubscription(true, false, null)).toBe(false);
  });

  it("is true for a hotel with no plan", () => {
    expect(canStartSubscription(true, true, null)).toBe(true);
    expect(canStartSubscription(true, true, billing())).toBe(true);
  });

  it("is false while active or trialing (manage, do not re-buy)", () => {
    expect(canStartSubscription(true, true, billing({ status: "active" }))).toBe(false);
    expect(canStartSubscription(true, true, billing({ status: "trialing" }))).toBe(false);
  });

  it("is true again once past_due or canceled", () => {
    expect(canStartSubscription(true, true, billing({ status: "past_due" }))).toBe(true);
    expect(canStartSubscription(true, true, billing({ status: "canceled" }))).toBe(true);
  });
});

describe("billingLocale", () => {
  it("normalizes to it/en", () => {
    expect(billingLocale("en")).toBe("en");
    expect(billingLocale("it")).toBe("it");
    expect(billingLocale("fr")).toBe("it");
    expect(billingLocale(null)).toBe("it");
  });
});

describe("formatPeriodEnd", () => {
  it("returns null for missing or invalid timestamps", () => {
    expect(formatPeriodEnd(null, "it")).toBeNull();
    expect(formatPeriodEnd(undefined, "it")).toBeNull();
    expect(formatPeriodEnd("not-a-date", "it")).toBeNull();
  });

  it("formats day-first in both locales, in UTC", () => {
    const iso = "2026-09-01T23:30:00.000Z";
    expect(formatPeriodEnd(iso, "it")).toBe("1 settembre 2026");
    expect(formatPeriodEnd(iso, "en")).toBe("1 September 2026");
  });
});

describe("mapLedgerRow", () => {
  it("flattens a DB row into view fields", () => {
    expect(mapLedgerRow(ledger())).toEqual({
      id: "row-1",
      itemKey: "late_checkout",
      quantity: 1,
      grossCents: 3000,
      hotelCents: 2400,
      platformCents: 600,
      status: "paid",
      createdAt: "2026-08-25T10:00:00.000Z",
    });
  });

  it("coerces string numerics and normalizes unknown statuses", () => {
    const row = mapLedgerRow(
      ledger({
        gross_cents: "3000" as unknown as number,
        hotel_share_cents: "2400" as unknown as number,
        status: "weird",
        created_at: null,
      }),
    );
    expect(row.grossCents).toBe(3000);
    expect(row.hotelCents).toBe(2400);
    expect(row.status).toBe("pending");
    expect(row.createdAt).toBeNull();
  });
});

describe("mapLedgerRows", () => {
  it("handles null and maps every row", () => {
    expect(mapLedgerRows(null)).toEqual([]);
    expect(mapLedgerRows(undefined)).toEqual([]);
    expect(mapLedgerRows([ledger(), ledger({ id: "row-2" })])).toHaveLength(2);
  });
});

describe("share totals", () => {
  it("sums hotel and platform shares in cents", () => {
    const rows = mapLedgerRows([
      ledger(),
      ledger({ id: "row-2", gross_cents: 5000, hotel_share_cents: 4000, platform_share_cents: 1000 }),
    ]);
    expect(sumHotelShare(rows)).toBe(6400);
    expect(sumPlatformShare(rows)).toBe(1600);
    expect(sumHotelShare([])).toBe(0);
  });
});
