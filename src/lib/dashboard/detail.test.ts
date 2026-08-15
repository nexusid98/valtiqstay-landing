import { describe, expect, it } from "vitest";
import {
  UPSELL_STATUSES,
  consentGrantedKey,
  formatDateTime,
  localizedLabel,
  upsellLineTotal,
  upsellStatusBadgeClasses,
} from "./detail";

describe("upsellLineTotal", () => {
  it("multiplies quantity by a numeric price", () => {
    expect(upsellLineTotal(2, 30)).toBe(60);
  });
  it("parses string prices (PostgREST decimal shape)", () => {
    expect(upsellLineTotal(3, "15.50")).toBeCloseTo(46.5);
  });
  it("returns null for a missing price", () => {
    expect(upsellLineTotal(1, null)).toBeNull();
    expect(upsellLineTotal(1, "")).toBeNull();
  });
  it("returns null for a non-numeric price", () => {
    expect(upsellLineTotal(1, "n/a")).toBeNull();
  });
  it("handles a zero quantity", () => {
    expect(upsellLineTotal(0, 30)).toBe(0);
  });
});

describe("upsellStatusBadgeClasses", () => {
  it("returns a token-only class string for every upsell status", () => {
    for (const status of UPSELL_STATUSES) {
      const classes = upsellStatusBadgeClasses(status);
      expect(classes.length).toBeGreaterThan(0);
      expect(classes).toMatch(/\b(?:text|border|bg)-(?:gold|champagne|navy)/);
      expect(classes).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    }
  });
  it("differentiates the three statuses", () => {
    const sets = new Set(UPSELL_STATUSES.map((s) => upsellStatusBadgeClasses(s)));
    expect(sets.size).toBe(UPSELL_STATUSES.length);
  });
});

describe("localizedLabel", () => {
  const item = { labelIt: "Partenza tardiva", labelEn: "Late check-out" };
  it("prefers the English label for the en locale", () => {
    expect(localizedLabel(item.labelIt, item.labelEn, "en")).toBe("Late check-out");
  });
  it("falls back to Italian for non-en locales", () => {
    expect(localizedLabel(item.labelIt, item.labelEn, "it")).toBe("Partenza tardiva");
  });
  it("falls back to Italian when no English label is stored", () => {
    expect(localizedLabel(item.labelIt, null, "en")).toBe("Partenza tardiva");
  });
});

describe("consentGrantedKey", () => {
  it("maps true to the granted-yes i18n key", () => {
    expect(consentGrantedKey(true)).toBe("grantedYes");
  });
  it("maps false to the granted-no i18n key", () => {
    expect(consentGrantedKey(false)).toBe("grantedNo");
  });
});

describe("formatDateTime", () => {
  it("formats a timestamp in Italian (UTC)", () => {
    expect(formatDateTime("2026-08-15T14:30:00+00:00", "it")).toBe(
      "15 agosto 2026, 14:30",
    );
  });
  it("formats a timestamp in English day-first (UTC)", () => {
    expect(formatDateTime("2026-08-15T14:30:00+00:00", "en")).toBe(
      "15 August 2026, 14:30",
    );
  });
  it("returns the input unchanged when it is not a valid timestamp", () => {
    expect(formatDateTime("not-a-date", "it")).toBe("not-a-date");
  });
});
