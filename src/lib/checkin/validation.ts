import type { GuestFormData } from "./types";

export type GuestFieldErrors = Partial<
  Record<
    | "first_name"
    | "last_name"
    | "birth_date"
    | "birth_place"
    | "nationality",
    string
  >
>;

/** A non-empty value after trimming. */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validates an ISO date string (yyyy-mm-dd) against a real calendar date.
 * Dates are compared in UTC to avoid timezone drift.
 */
export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Human-readable date (it-IT / en-GB) from an ISO string. */
export function formatDate(iso: string, locale: string): string {
  if (!isValidDate(iso)) return iso;
  const [year, month, day] = iso.split("-").map(Number);
  // Bare "en" resolves to en-US ("May 17, 1990"); the supported English
  // format is en-GB day-first, matching the Italian output style.
  const resolvedLocale = locale === "en" ? "en-GB" : locale;
  return new Intl.DateTimeFormat(resolvedLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

/** Currency formatting (EUR) for a price coming from the DB (number or text). */
export function formatPrice(value: number | string | null, locale: string): string {
  if (value === null || value === "") return "";
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
  }).format(numeric);
}

/**
 * Validates a guest's personal fields. Returns an error message per field;
 * an empty object means the guest is ready to advance.
 */
export function validateGuest(
  guest: GuestFormData,
  requiredLabel: string,
): GuestFieldErrors {
  const errors: GuestFieldErrors = {};

  if (!isNonEmpty(guest.first_name)) errors.first_name = requiredLabel;
  if (!isNonEmpty(guest.last_name)) errors.last_name = requiredLabel;
  if (!isNonEmpty(guest.birth_place)) errors.birth_place = requiredLabel;
  if (!isNonEmpty(guest.nationality)) errors.nationality = requiredLabel;

  if (!isNonEmpty(guest.birth_date)) {
    errors.birth_date = requiredLabel;
  } else if (!isValidDate(guest.birth_date)) {
    errors.birth_date = requiredLabel;
  }

  return errors;
}

/** True when every guest in the list is valid. */
export function allGuestsValid(
  guests: GuestFormData[],
  requiredLabel: string,
): boolean {
  return guests.every((guest) => Object.keys(validateGuest(guest, requiredLabel)).length === 0);
}
