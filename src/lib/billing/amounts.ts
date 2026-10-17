/**
 * Pure money helpers for billing. All amounts are integer cents (Stripe's
 * unit) — never floats. Locale-aware formatting uses the native Intl API so
 * it is correct for it-IT ("30,00 €") and en-GB ("€30.00").
 */
import { HOTEL_SHARE_PCT } from "./config";

export interface SplitCents {
  hotelCents: number;
  platformCents: number;
}

/**
 * Splits a gross amount (integer cents) between hotel and platform.
 * Integer math only: hotel = floor(gross * HOTEL_SHARE_PCT / 100), platform =
 * gross − hotel (the remainder), so the two parts always sum exactly to gross.
 * Example: gross 3000 → hotel 2400, platform 600 (an 80/20 split).
 */
export function splitCents(grossCents: number): SplitCents {
  const hotelCents = Math.floor((grossCents * HOTEL_SHARE_PCT) / 100);
  return {
    hotelCents,
    platformCents: grossCents - hotelCents,
  };
}

/**
 * Formats an integer cent amount as a localized currency string.
 * it-IT → "30,00 €", en-GB → "€30.00".
 */
export function formatCents(cents: number, locale: "it" | "en" = "it"): string {
  const formatter = new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
  });
  return formatter.format(cents / 100);
}

/**
 * Parses a euro amount (e.g. from a form field or a DB DECIMAL price string)
 * into integer cents. Handles numbers, numeric strings and string prices such
 * as "30" or "19,99"/"19.99" from the DB. Returns NaN when the input cannot
 * be parsed. Rounding is banker-unsafe on purpose (Math.round) — normal money
 * values have at most 2 decimals so this is exact.
 */
export function parseCentsFromEuros(euros: number | string): number {
  if (typeof euros === "number") {
    return Math.round(euros * 100);
  }
  const normalized = euros.trim().replace(",", ".");
  const value = Number(normalized);
  if (Number.isNaN(value)) return Number.NaN;
  return Math.round(value * 100);
}
