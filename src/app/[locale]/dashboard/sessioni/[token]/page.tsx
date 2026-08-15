import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { requireStaff } from "@/lib/supabase/server";

/**
 * Session detail placeholder — the real guests/documents/upsells view ships in
 * the next M4 delegation. This page exists so the "Dettagli" links from the
 * sessions list resolve. The token is validated only by shape here; the detail
 * page will verify ownership through RLS when it reads the session row.
 */
export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  await requireStaff();
  const t = await getTranslations("dashboard.detail");
  const locale = await getLocale();

  return (
    <div>
      <Link
        href={`/${locale}/dashboard`}
        className="text-sm text-champagne/70 transition-colors hover:text-champagne"
      >
        ← {t("back")}
      </Link>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-gold">{t("title")}</h1>
      <p className="mt-1 font-mono text-sm text-champagne">{token}</p>
      <div className="mt-6 rounded-sm border border-navy-700 bg-navy-900 p-5 text-sm text-navy-300">
        {t("placeholder")}
      </div>
    </div>
  );
}
