import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient, requireStaff } from "@/lib/supabase/server";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { getPublicOrigin } from "@/lib/dashboard/origin";
import {
  buildCheckinUrl,
  effectiveStatus,
  type ListedSession,
} from "@/lib/dashboard/sessions";
import { formatDate } from "@/lib/checkin/validation";

/**
 * Sessions list for the staff's own hotel. All reads go through the
 * authenticated (cookie) server client, so RLS scopes every row to the
 * caller's hotel_id — no tenant filtering in app code.
 */
export default async function SessionsPage() {
  const staff = await requireStaff();
  const t = await getTranslations("dashboard.sessions");
  const locale = await getLocale();
  const origin = await getPublicOrigin();
  const supabase = await createClient();

  // The hotel's default locale determines the guest link path (/it/c/{token}).
  const { data: hotel } = await supabase
    .from("hotels")
    .select("locale")
    .eq("id", staff.profile.hotel_id)
    .maybeSingle();
  const hotelLocale = hotel?.locale ?? "it";

  const { data: raw, error } = await supabase
    .from("checkin_sessions")
    .select(
      "token, status, expires_at, submitted_at, created_at, stays(id, arrival_date, departure_date, room_label, booking_ref)",
    )
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(`checkin_sessions query failed: ${error.message}`);
  }

  // Guest count per stay — a second lightweight read, also hotel-scoped by
  // RLS. Counted in JS to keep the query plain and typed.
  const { data: guests } = await supabase.from("guests").select("stay_id");
  const guestCounts = new Map<string, number>();
  for (const guest of guests ?? []) {
    guestCounts.set(guest.stay_id, (guestCounts.get(guest.stay_id) ?? 0) + 1);
  }

  const sessions: ListedSession[] = (raw ?? []).map((row) => {
    // PostgREST returns a to-one embed as an object, but the untyped client
    // may surface it as an array — normalize both shapes.
    const stay = Array.isArray(row.stays) ? (row.stays[0] ?? null) : (row.stays ?? null);
    return {
      token: row.token,
      status: effectiveStatus(row.status, row.expires_at),
      stays: stay,
      expires_at: row.expires_at,
      submitted_at: row.submitted_at,
      created_at: row.created_at,
      guestCount: stay ? (guestCounts.get(stay.id) ?? 0) : 0,
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-gold">{t("title")}</h1>
          <p className="mt-1 text-sm text-champagne/80">{t("subtitle")}</p>
        </div>
        <Link
          href={`/${locale}/dashboard/sessioni/nuova`}
          className="rounded-sm bg-gold px-4 py-2.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter"
        >
          {t("newLink")}
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="mt-10 rounded-sm border border-navy-700 bg-navy-900 px-6 py-14 text-center">
          <h2 className="font-serif text-xl text-champagne">{t("emptyTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-300">{t("emptyBody")}</p>
          <Link
            href={`/${locale}/dashboard/sessioni/nuova`}
            className="mt-6 inline-block rounded-sm bg-gold px-5 py-2.5 text-sm font-medium text-navy-950 transition-colors hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter"
          >
            {t("emptyCta")}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.token}
              session={session}
              locale={locale}
              hotelLocale={hotelLocale}
              origin={origin}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/** One session row: token + status, stay dates, room/booking, guest count. */
async function SessionCard({
  session,
  locale,
  hotelLocale,
  origin,
}: {
  session: ListedSession;
  locale: string;
  hotelLocale: string;
  origin: string;
}) {
  const t = await getTranslations("dashboard.sessions");
  const linkPath = `/${hotelLocale}/c/${session.token}`;
  const stay = session.stays;

  return (
    <li className="rounded-sm border border-navy-700 bg-navy-900 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate font-mono text-sm text-champagne">{session.token}</span>
          <StatusBadge status={session.status} label={t(`status.${session.status}`)} />
        </div>
        <div className="flex items-center gap-2">
          <CopyLinkButton
            url={buildCheckinUrl(origin, linkPath)}
            label={t("copyLink")}
            copiedLabel={t("copied")}
          />
          <Link
            href={`/${locale}/dashboard/sessioni/${session.token}`}
            className="inline-flex items-center rounded-sm border border-navy-600 px-3 py-1.5 text-sm text-champagne transition-colors hover:border-gold hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter"
          >
            {t("details")}
          </Link>
        </div>
      </div>

      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <div className="flex items-baseline gap-2">
          <dt className="shrink-0 text-xs uppercase tracking-wide text-navy-400">
            {t("period")}
          </dt>
          <dd className="truncate text-champagne">
            {stay
              ? t("dateRange", {
                  arrival: formatDate(stay.arrival_date, locale),
                  departure: formatDate(stay.departure_date, locale),
                })
              : "—"}
          </dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="shrink-0 text-xs uppercase tracking-wide text-navy-400">
            {t("room")}
          </dt>
          <dd className="truncate text-champagne">{stay?.room_label ?? t("noRoom")}</dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="shrink-0 text-xs uppercase tracking-wide text-navy-400">
            {t("booking")}
          </dt>
          <dd className="truncate text-champagne">{stay?.booking_ref ?? t("noBooking")}</dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt className="shrink-0 text-xs uppercase tracking-wide text-navy-400">
            {t("guests")}
          </dt>
          <dd className="text-champagne">{t("guestCount", { count: session.guestCount })}</dd>
        </div>
      </dl>
    </li>
  );
}
