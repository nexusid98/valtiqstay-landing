import { describe, expect, it } from "vitest";
import {
  buildUpsellCheckoutLine,
  guestExtrasTotalCents,
  upsellLabel,
  upsellUnitCents,
} from "./upsell";

describe("upsellUnitCents", () => {
  it("converts DB decimal prices (number or string) to integer cents", () => {
    expect(upsellUnitCents(30)).toBe(3000);
    expect(upsellUnitCents("19.99")).toBe(1999);
    expect(upsellUnitCents("19,99")).toBe(1999);
    expect(upsellUnitCents(0.5)).toBe(50);
  });

  it("rejects missing, non-numeric and non-positive prices", () => {
    expect(upsellUnitCents(null)).toBeNull();
    expect(upsellUnitCents(undefined)).toBeNull();
    expect(upsellUnitCents("")).toBeNull();
    expect(upsellUnitCents("abc")).toBeNull();
    expect(upsellUnitCents(0)).toBeNull();
    expect(upsellUnitCents(-5)).toBeNull();
  });
});

describe("upsellLabel", () => {
  it("prefers English only for the en locale, else Italian", () => {
    expect(upsellLabel("Colazione", "Breakfast", "en")).toBe("Breakfast");
    expect(upsellLabel("Colazione", null, "en")).toBe("Colazione");
    expect(upsellLabel("Colazione", "Breakfast", "it")).toBe("Colazione");
  });
});

describe("buildUpsellCheckoutLine", () => {
  const base = {
    itemKey: "late_checkout",
    labelIt: "Check-out tardivo",
    labelEn: "Late checkout",
    priceEuros: "25.00",
    quantity: 2,
  };

  it("prices a request from the DB row, never from client input", () => {
    const line = buildUpsellCheckoutLine(base, "it");
    expect(line).toEqual({
      itemKey: "late_checkout",
      label: "Check-out tardivo",
      quantity: 2,
      unitPriceCents: 2500,
      totalCents: 5000,
    });
  });

  it("localizes the label for English guests", () => {
    expect(buildUpsellCheckoutLine(base, "en")?.label).toBe("Late checkout");
  });

  it("defaults a missing/invalid quantity to 1", () => {
    expect(buildUpsellCheckoutLine({ ...base, quantity: 0 }, "it")?.quantity).toBe(1);
    expect(buildUpsellCheckoutLine({ ...base, quantity: -3 }, "it")?.quantity).toBe(1);
    expect(
      buildUpsellCheckoutLine({ ...base, quantity: Number.NaN }, "it")?.quantity,
    ).toBe(1);
  });

  it("returns null when the item cannot be priced", () => {
    expect(buildUpsellCheckoutLine({ ...base, priceEuros: null }, "it")).toBeNull();
    expect(buildUpsellCheckoutLine({ ...base, priceEuros: "n/a" }, "it")).toBeNull();
    expect(buildUpsellCheckoutLine({ ...base, priceEuros: 0 }, "it")).toBeNull();
  });
});

describe("guestExtrasTotalCents", () => {
  it("sums quantity × unit price across selections", () => {
    expect(
      guestExtrasTotalCents([
        { priceEuros: "25.00", quantity: 2 },
        { priceEuros: 10, quantity: 1 },
      ]),
    ).toBe(6000);
  });

  it("ignores unpriced selections and defaults bad quantities", () => {
    expect(
      guestExtrasTotalCents([
        { priceEuros: null, quantity: 1 },
        { priceEuros: "15.50", quantity: 0 },
      ]),
    ).toBe(1550);
    expect(guestExtrasTotalCents([])).toBe(0);
  });
});
