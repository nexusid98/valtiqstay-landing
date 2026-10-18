import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient, requireStaff } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";

/**
 * Dashboard pages are private staff tooling: keep them out of search indexes.
 * The tab title runs through the shared "ValtiqStay — %s" template.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

/**
 * Branded shell for every dashboard route. Guards the whole subtree: an
 * unauthenticated visitor (or a user without a hotel profile) is redirected
 * to /{locale}/login by requireStaff(). The hotel name is read through RLS
 * (hotels_staff_select scopes staff to their own hotel), so no tenant data is
 * ever exposed across hotels.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const staff = await requireStaff();
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: hotel } = await supabase
    .from("hotels")
    .select("name")
    .eq("id", staff.profile.hotel_id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-navy">
      <header className="border-b border-navy-800 bg-navy-950/60">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pb-3 pt-5">
          <div className="min-w-0">
            <p className="truncate font-serif text-xl font-semibold text-gold">
              {hotel?.name ?? "ValtiqStay"}
            </p>
            <p className="truncate text-xs text-navy-300">{staff.profile.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-navy-400 sm:block">{staff.user.email}</span>
            <LocaleSwitcher />
            <SignOutButton />
          </div>
        </div>
        <nav className="mx-auto w-full max-w-5xl px-4" aria-label={t("nav.label")}>
          <DashboardNav locale={locale} />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
