import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { locales, defaultLocale } from "./lib/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});

/**
 * Composed middleware: refresh the Supabase auth session first, then run
 * next-intl locale negotiation. Order matters — updateSession() must run
 * before next-intl so a (possibly refreshed) auth cookie is already set on
 * the request by the time the intl middleware produces its response.
 *
 * The intl response is the final response (it owns the locale redirect /
 * rewrite); the refreshed Supabase cookies are copied onto it so the browser
 * persists them.
 */
export async function middleware(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  const intlResponse = intlMiddleware(request);

  // Carry refreshed auth cookies (e.g. a rotated access/refresh token) onto
  // the response next-intl produced.
  supabaseResponse.cookies.getAll().forEach((cookie) =>
    intlResponse.cookies.set(cookie),
  );

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
