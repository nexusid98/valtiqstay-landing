import { describe, expect, it } from "vitest";
import { splitCents, formatCents, parseCentsFromEuros } from "./amounts";
import { HOTEL_SHARE_PCT, PLATFORM_SHARE_PCT } from "./config";

describe("splitCents", () => {
  it("splits a gross amount 80/20 with integer math", () => {
    const { hotelCents, platformCents } = splitCents(3000);
    expect(hotelCents).toBe(2400);
    expect(platformCents).toBe(600);
  });

  it("uses floor for the hotel share so parts always sum to gross", () => {
    // 1001 * 80 / 100 = 800.8 → floor = 800 hotel; remainder 201 platform.
    const gross = 1001;
    const { hotelCents, platformCents } = splitCents(gross);
    expect(hotelCents).toBe(800);
    expect(platformCents).toBe(201);
    expect(hotelCents + platformCents).toBe(gross);
  });

  it("works for a single cent", () => {
    const { hotelCents, platformCents } = splitCents(1);
    expect(hotelCents).toBe(0);
    expect(platformCents).toBe(1);
  });

  it("returns zeros for zero gross", () => {
    expect(splitCents(0)).toEqual({ hotelCents: 0, platformCents: 0 });
  });

  it("regression: 80/20 precomputed values match constants", () => {
    expect(HOTEL_SHARE_PCT).toBe(80);
    expect(PLATFORM_SHARE_PCT).toBe(20);
    const gross = 5000;
    const split = splitCents(gross);
    expect(split.hotelCents).toBe((gross * HOTEL_SHARE_PCT) / 100);
    expect(split.platformCents).toBe((gross * PLATFORM_SHARE_PCT) / 100);
  });
});

describe("formatCents", () => {
  it("formats as it-IT style by default", () => {
    expect(formatCents(3000)).toBe("30,00\u00A0€");
  });
  it("formats as it-IT explicitly", () => {
    expect(formatCents(3000, "it")).toBe("30,00\u00A0€");
  });
  it("formats as en-GB style", () => {
    expect(formatCents(3000, "en")).toBe("€30.00");
  });
  it("handles fractional cents rounding", () => {
    expect(formatCents(1999, "en")).toBe("€19.99");
  });
});

describe("parseCentsFromEuros", () => {
  it("parses a number of euros", () => {
    expect(parseCentsFromEuros(30)).toBe(3000);
    expect(parseCentsFromEuros(19.99)).toBe(1999);
  });
  it("parses a dot decimal string", () => {
    expect(parseCentsFromEuros("30")).toBe(3000);
    expect(parseCentsFromEuros("19.99")).toBe(1999);
  });
  it("parses a comma decimal string (Italian input)", () => {
    expect(parseCentsFromEuros("19,99")).toBe(1999);
  });
  it("returns NaN for unparseable strings", () => {
    expect(Number.isNaN(parseCentsFromEuros("n/a"))).toBe(true);
  });
});
