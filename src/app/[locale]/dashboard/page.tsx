import { getTranslations } from "next-intl/server";
import { requireStaff } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";

/**
 * Dashboard guard placeholder — the real dashboard UI (session list, create
 * form, session detail) ships in a later M4 delegation. This page exists so
 * auth is verifiable end-to-end: unauthenticated visitors are redirected to
 * /{locale}/login by requireStaff().
 */
export default async function DashboardPage() {
  const session = await requireStaff();
  const t = await getTranslations("dashboard");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-serif text-4xl font-bold text-gold">{t("title")}</h1>
      <p className="mt-4 text-champagne">{t("placeholder")}</p>
      <p className="mt-2 text-sm text-navy-300">
        {session.user.email} · {session.profile.full_name}
      </p>
      <div className="mt-8">
        <SignOutButton />
      </div>
    </main>
  );
}
