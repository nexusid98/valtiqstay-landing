import { locales } from "./config";

/**
 * Rewrites a pathname so it points at `targetLocale`, preserving every other
 * segment (deep links, dynamic segments such as /it/c/<token> or
 * /it/dashboard/sessioni/<token>) and any query string / hash.
 *
 * Pure and framework-free so it can be unit tested and reused on the server.
 * `usePathname()` from next/navigation never includes the query string, but we
 * accept one defensively so the helper is safe to call with a full URL path.
 */
export function switchLocalePath(
  pathname: string,
  targetLocale: string,
  knownLocales: readonly string[] = locales,
): string {
  const queryIndex = pathname.search(/[?#]/);
  const path = queryIndex === -1 ? pathname : pathname.slice(0, queryIndex);
  const suffix = queryIndex === -1 ? "" : pathname.slice(queryIndex);

  // Normalise to an absolute path, then drop empty segments ("/", "//").
  const segments = (path.startsWith("/") ? path : `/${path}`)
    .split("/")
    .filter(Boolean);

  // The locale prefix, when present, is always the first segment.
  const rest = knownLocales.includes(segments[0]) ? segments.slice(1) : segments;

  return `/${targetLocale}${rest.length > 0 ? `/${rest.join("/")}` : ""}${suffix}`;
}
