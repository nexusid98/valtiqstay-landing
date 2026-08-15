/**
 * Pure helpers + shared types for the session DETAIL page (M4-3). No I/O and
 * no request context here — everything is unit-testable. Session-list helpers
 * live in sessions.ts; this file covers guests/documents/extras/consents.
 */

/** The statuses an upsell request can have (DB CHECK constraint). */
export type UpsellStatus = "requested" | "confirmed" | "declined";

export const UPSELL_STATUSES: readonly UpsellStatus[] = [
  "requested",
  "confirmed",
  "declined",
];

/** i18n key suffix for a consent's granted value (under detail.consents). */
export type ConsentGrantedKey = "grantedYes" | "grantedNo";

/**
 * Tailwind classes for the upsell-status pill, keyed off the design tokens
 * (navy/gold/champagne only — never ad-hoc hex). Mirrors statusBadgeClasses()
 * in sessions.ts, restricted to the three upsell statuses.
 */
export function upsellStatusBadgeClasses(status: UpsellStatus): string {
  switch (status) {
    case "requested":
      return "border-champagne/40 text-champagne";
    case "confirmed":
      return "border-gold/60 bg-gold/10 text-gold-light";
    case "declined":
      return "border-navy-400 text-navy-400";
  }
}

/**
 * Line total for an upsell request: quantity × unit price. Returns null when
 * the unit price is missing or not numeric (PostgREST may surface decimal
 * columns as number or string, so both are handled). Quantity is a DB int and
 * assumed to be a valid number.
 */
export function upsellLineTotal(
  quantity: number,
  unitPrice: number | string | null,
): number | null {
  if (unitPrice === null || unitPrice === "") return null;
  const numeric = typeof unitPrice === "string" ? Number(unitPrice) : unitPrice;
  if (Number.isNaN(numeric)) return null;
  return numeric * quantity;
}

/**
 * Preferred label for the current locale, falling back to Italian (the
 * default locale) when no English label is stored on the upsell item.
 */
export function localizedLabel(
  labelIt: string,
  labelEn: string | null,
  locale: string,
): string {
  return locale === "en" && labelEn ? labelEn : labelIt;
}

/**
 * i18n key suffix for a consent's granted flag — keeps the mapping in one
 * testable place instead of inline ternaries in the page.
 */
export function consentGrantedKey(granted: boolean): ConsentGrantedKey {
  return granted ? "grantedYes" : "grantedNo";
}

/**
 * "15 August 2026, 14:30" from a timestamp column. Date and time are
 * formatted separately and joined with a comma so the output is stable across
 * ICU versions (combined date+time formats inject locale connectors like
 * "at"/"alle ore" that vary by Node release). Rendered in UTC so the label
 * never drifts with the server's local timezone; bare "en" resolves to en-GB
 * day-first, matching the Italian output style (same convention as formatDate
 * in src/lib/checkin/validation.ts).
 */
export function formatDateTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const resolvedLocale = locale === "en" ? "en-GB" : locale;
  const datePart = new Intl.DateTimeFormat(resolvedLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
  const timePart = new Intl.DateTimeFormat(resolvedLocale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
  return `${datePart}, ${timePart}`;
}
