"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * Dashboard top nav. A tiny client component so `aria-current="page"` lands on
 * the section actually being viewed (the layout is a server component and does
 * not know the pathname).
 */
export function DashboardNav({ locale }: { locale: string }) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname() ?? "";

  const links = [
    { href: `/${locale}/dashboard`, label: t("sessions") },
    { href: `/${locale}/dashboard/fatturazione`, label: t("billing") },
  ];

  return (
    <ul className="flex gap-6">
      {links.map((link) => {
        const active =
          link.href === `/${locale}/dashboard`
            ? pathname === link.href || pathname.startsWith(`/${locale}/dashboard/sessioni`)
            : pathname.startsWith(link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "inline-block border-b-2 border-gold px-1 pb-2.5 pt-1 text-sm text-gold"
                  : "inline-block border-b-2 border-transparent px-1 pb-2.5 pt-1 text-sm text-navy-300 transition-colors hover:text-champagne"
              }
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
