import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

/**
 * Cookie-based Supabase server client (auth-aware). Use inside Server
 * Components, route handlers and server actions; the auth cookies are
 * refreshed by src/middleware.ts on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The setAll method may be called from a Server Component.
            // This is expected to fail if the caller is not in a request context.
          }
        },
      },
    },
  );
}

/** The subset of the caller's profile the dashboard needs. */
export interface StaffProfile {
  id: string;
  hotel_id: string;
  role: "hotel_admin" | "hotel_staff";
  full_name: string;
}

export interface StaffSession {
  user: { id: string; email: string | undefined };
  profile: StaffProfile;
}

/**
 * Returns the authenticated staff member and their profile, or null when the
 * caller is signed out or has no profile row (e.g. an anon session). The
 * profile lookup goes through RLS, which scopes staff to their own hotel.
 */
export async function getSession(): Promise<StaffSession | null> {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, hotel_id, role, full_name")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    user: { id: data.user.id, email: data.user.email },
    profile: profile as StaffProfile,
  };
}

/**
 * Server-side guard for dashboard routes: returns the staff session or
 * redirects to /{locale}/login. Throws the Next.js redirect, so call it at
 * the top of a server page and use the returned session.
 */
export async function requireStaff(): Promise<StaffSession> {
  const session = await getSession();
  if (session) return session;

  let locale = "it";
  try {
    locale = (await getLocale()) || "it";
  } catch {
    // Not inside a request context (e.g. a build-time call) — fall back.
  }

  redirect(`/${locale}/login`);
}
