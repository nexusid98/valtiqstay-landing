import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/lib/i18n/config";
import { getPublicOrigin } from "@/lib/dashboard/origin";
import { buildLanguageAlternates, canonicalUrl } from "@/lib/seo/alternates";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Localized metadata for the whole [locale] subtree: a "ValtiqStay — <page>"
 * title template, the localized description, and the hreflang set
 * (it / en / x-default → Italian) built from the real request origin so the
 * <link rel="alternate"> tags are absolute URLs. Pages that are not the home
 * page override `alternates` with their own path (see c/[token]/page.tsx) and
 * the dashboard is explicitly noindex.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [tMeta, tHome, origin] = await Promise.all([
    getTranslations({ locale, namespace: "common.meta" }),
    getTranslations({ locale, namespace: "home" }),
    getPublicOrigin(),
  ]);

  return {
    metadataBase: new URL(origin),
    title: {
      default: tHome("title"),
      template: tMeta("titleTemplate"),
    },
    description: tHome("description"),
    alternates: {
      canonical: canonicalUrl("/", locale, origin),
      languages: buildLanguageAlternates("/", origin),
    },
    openGraph: {
      type: "website",
      siteName: tHome("title"),
      title: tHome("title"),
      description: tHome("description"),
      url: canonicalUrl("/", locale, origin),
      locale: locale === "it" ? "it_IT" : "en_GB",
    },
    twitter: {
      card: "summary",
      title: tHome("title"),
      description: tHome("description"),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }
  const messages = await getMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
