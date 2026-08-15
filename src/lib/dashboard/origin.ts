import { headers } from "next/headers";

/**
 * The public origin (scheme + host) of the current request, derived from the
 * standard forwarded headers Vercel sets (x-forwarded-proto / x-forwarded-host)
 * with the local-dev fallback of http://localhost:3000. Used to build absolute
 * guest check-in links ({origin}/it/c/{token}) that hotel staff copy from the
 * dashboard. Server-only (imports next/headers).
 */
export async function getPublicOrigin(): Promise<string> {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
