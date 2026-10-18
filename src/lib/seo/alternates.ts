import { defaultLocale, locales } from "@/lib/i18n/config";

/**
 * Builds the hreflang (alternates.languages) map for a single route.
 *
 * `path` is the locale-less path of the route ("/" for home, "/c/abc-123" for
 * a guest token page). `origin` is the public origin of the request (see
 * src/lib/dashboard/origin.ts) so the emitted <link rel="alternate" hreflang>
 * tags are absolute URLs — the form crawlers expect.
 *
 * `x-default` points at the default locale (Italian), which is the language
 * negotiation fallback for every other visitor.
 */
export function buildLanguageAlternates(
  path: string,
  origin: string,
): Record<string, string> {
  const base = origin.replace(/\/+$/, "");
  const suffix = normalizePathSuffix(path);

  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = `${base}/${locale}${suffix}`;
  }
  alternates["x-default"] = `${base}/${defaultLocale}${suffix}`;
  return alternates;
}

/** Absolute canonical URL for a route in one locale. */
export function canonicalUrl(path: string, locale: string, origin: string): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}/${locale}${normalizePathSuffix(path)}`;
}

/**
 * Turns a route path into a locale-less suffix: "/" -> "", "c/abc" -> "/c/abc".
 */
export function normalizePathSuffix(path: string): string {
  const trimmed = path.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed ? `/${trimmed}` : "";
}
