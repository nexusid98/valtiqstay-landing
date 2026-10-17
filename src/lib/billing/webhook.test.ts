import { describe, expect, it } from "vitest";
import {
  HANDLED_EVENT_TYPES,
  isHandledEventType,
  parseSubscriptionMetadata,
  parseUpsellPaymentMetadata,
} from "./webhook";

describe("isHandledEventType (idempotency/dispatch map)", () => {
  it("includes every event we dispatch on", () => {
    expect(HANDLED_EVENT_TYPES).toEqual(
      expect.arrayContaining([
        "checkout.session.completed",
        "customer.subscription.updated",
        "customer.subscription.deleted",
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
      ]),
    );
  });
  it("returns true for handled types and false otherwise", () => {
    expect(isHandledEventType("checkout.session.completed")).toBe(true);
    expect(isHandledEventType("payment_intent.succeeded")).toBe(true);
    expect(isHandledEventType("invoice.paid")).toBe(false);
    expect(isHandledEventType("")).toBe(false);
  });
});

describe("parseSubscriptionMetadata", () => {
  const ok = { kind: "subscription", hotel_id: "hotel-1" };
  it("accepts valid subscription metadata", () => {
    const r = parseSubscriptionMetadata(ok);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.kind).toBe("subscription");
      expect(r.value.hotelId).toBe("hotel-1");
    }
  });
  it.each([
    ["missing metadata", undefined],
    ["null metadata", null],
    ["wrong kind", { kind: "upsell_payment", hotel_id: "h" }],
    ["missing hotel_id", { kind: "subscription" }],
    ["empty hotel_id", { kind: "subscription", hotel_id: "  " }],
  ])("rejects %s", (_label, meta) => {
    const r = parseSubscriptionMetadata(meta as never);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("invalid_metadata");
  });
});

describe("parseUpsellPaymentMetadata", () => {
  const ok = {
    kind: "upsell_payment",
    hotel_id: "hotel-1",
    stay_id: "stay-1",
    item_key: "late_checkout",
  };
  it("accepts valid upsell metadata", () => {
    const r = parseUpsellPaymentMetadata(ok);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toMatchObject({
        kind: "upsell_payment",
        hotelId: "hotel-1",
        stayId: "stay-1",
        itemKey: "late_checkout",
      });
      expect(r.value.guestId).toBeUndefined();
    }
  });
  it("captures optional guest_id when present", () => {
    const r = parseUpsellPaymentMetadata({ ...ok, guest_id: "guest-9" });
    expect(r.ok && r.value.guestId).toBe("guest-9");
  });
  it.each([
    ["missing metadata", undefined],
    ["wrong kind", { ...ok, kind: "subscription" }],
    ["missing stay_id", { kind: "upsell_payment", hotel_id: "h", item_key: "k" }],
    ["missing hotel_id", { kind: "upsell_payment", stay_id: "s", item_key: "k" }],
    ["missing item_key", { kind: "upsell_payment", hotel_id: "h", stay_id: "s" }],
  ])("rejects %s", (_label, meta) => {
    const r = parseUpsellPaymentMetadata(meta as never);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe("invalid_metadata");
  });
});