"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { switchLocalePath } from "@/lib/i18n/switch-locale-path";

/**
 * Compact IT / EN toggle. Two short segments with 44px touch targets — the
 * clearest pattern one-handed on a phone, where full language names would
 * crowd the header.
 *
 * Each entry is a real <Link>: it keeps the current path (including dynamic
 * segments such as /it/c/<token>) and is crawlable, so no JavaScript is needed
 * to switch language. hrefLang marks the target language for assistive tech and
 * crawlers; the full language name lives in aria-label / title.
 */
export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("common.language");
  const activeLocale = useLocale();
  const pathname = usePathname() ?? "/";

  const entries = [
    { locale: "it", short: t("short.it"), name: t("italian") },
    { locale: "en", short: t("short.en"), name: t("english") },
  ] as const;

  return (
    <nav aria-label={t("label")} className={className}>
      <ul className="flex items-center gap-1">
        {entries.map((entry) => {
          const active = entry.locale === activeLocale;
          return (
            <li key={entry.locale}>
              <Link
                href={switchLocalePath(pathname, entry.locale)}
                hrefLang={entry.locale}
                lang={entry.locale}
                aria-current={active ? "true" : undefined}
                aria-label={t("switchTo", { language: entry.name })}
                title={entry.name}
                className={[
                  "inline-flex h-11 min-w-[44px] items-center justify-center rounded-full border px-2.5",
                  "text-xs font-semibold uppercase tracking-[0.15em] transition-colors",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                  active
                    ? "border-gold text-gold"
                    : "border-champagne/30 text-champagne hover:border-champagne hover:text-white",
                ].join(" ")}
              >
                {entry.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
