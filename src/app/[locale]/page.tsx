import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { getPublicOrigin } from "@/lib/dashboard/origin";
import { buildLanguageAlternates, canonicalUrl } from "@/lib/seo/alternates";

/**
 * Metadata for the public landing page: localized title (absolute, so the
 * layout's "ValtiqStay — %s" template does not repeat the brand), localized
 * description, Open Graph tags and the hreflang set for the root path.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, origin] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getPublicOrigin(),
  ]);
  const url = canonicalUrl("/", locale, origin);

  return {
    title: { absolute: t("title") },
    description: t("description"),
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates("/", origin),
    },
    openGraph: {
      type: "website",
      siteName: t("title"),
      title: t("title"),
      description: t("description"),
      url,
      locale: locale === "it" ? "it_IT" : "en_GB",
    },
  };
}

export default function HomePage() {
  const t = useTranslations("home");
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4">
      <header className="absolute inset-x-0 top-0 flex justify-end px-4 pt-4">
        <LocaleSwitcher />
      </header>
      <h1 className="font-serif text-5xl font-bold text-gold">{t("title")}</h1>
      <p className="mt-4 text-center text-champagne">{t("tagline")}</p>
    </main>
  );
}
