import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckinFlow } from "@/components/checkin/CheckinFlow";
import { getPublicOrigin } from "@/lib/dashboard/origin";
import { buildLanguageAlternates, canonicalUrl } from "@/lib/seo/alternates";

/**
 * Guest check-in link (/{locale}/c/{token}). Metadata is localized and carries
 * its own canonical + hreflang pair so a shared link advertises both language
 * versions. The page is deliberately noindex: the URL contains a bearer token
 * that must never end up in a search index.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}): Promise<Metadata> {
  const { locale, token } = await params;
  const [tCheckin, tMeta, origin] = await Promise.all([
    getTranslations({ locale, namespace: "checkin" }),
    getTranslations({ locale, namespace: "common.meta" }),
    getPublicOrigin(),
  ]);
  const path = `/c/${token}`;

  return {
    title: tCheckin("progress"),
    description: tMeta("defaultDescription"),
    robots: { index: false, follow: false },
    alternates: {
      canonical: canonicalUrl(path, locale, origin),
      languages: buildLanguageAlternates(path, origin),
    },
  };
}

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { token } = await params;
  return <CheckinFlow token={token} />;
}
