import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";

/**
 * Localized 404 for every route inside [locale]. The locale comes from the
 * request (next-intl middleware), so the copy and the "back home" link both
 * follow the language the guest is already reading.
 */
export default async function NotFound() {
  const [t, locale] = await Promise.all([
    getTranslations("common.notFound"),
    getLocale(),
  ]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-navy px-6 text-center">
      <p
        aria-hidden="true"
        className="font-serif text-6xl font-semibold text-gold"
      >
        404
      </p>
      <div aria-hidden="true" className="my-6 h-px w-[120px] bg-gold/60" />
      <h1 className="font-serif text-3xl text-white sm:text-4xl">{t("title")}</h1>
      <p className="mt-4 max-w-sm text-champagne">{t("body")}</p>
      <Link
        href={`/${locale}`}
        className="mt-10 inline-flex min-h-[48px] items-center justify-center rounded-full border border-champagne/60 px-6 py-3 text-base font-semibold text-champagne transition-colors hover:border-champagne hover:bg-navy-800/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
