import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient, requireStaff } from "@/lib/supabase/server";
import { CopyLinkButton } from "@/components/dashboard/CopyLinkButton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { DocumentDownloadButton } from "@/components/dashboard/DocumentDownloadButton";
import { getPublicOrigin } from "@/lib/dashboard/origin";
import {
  buildCheckinUrl,
  effectiveStatus,
  type SessionStatus,
} from "@/lib/dashboard/sessions";
import {
  consentGrantedKey,
  formatDateTime,
  localizedLabel,
  upsellLineTotal,
  upsellStatusBadgeClasses,
  type UpsellStatus,
} from "@/lib/dashboard/detail";
import { formatDate, formatPrice } from "@/lib/checkin/validation";

/** Row shapes as returned by PostgREST (untyped client) for this page. */
interface StayRow {
  id: string;
  arrival_date: string;
  departure_date: string;
  room_label: string | null;
  booking_ref: string | null;
}
interface GuestRow {
  id: string;
  is_lead: boolean;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  birth_place: string | null;
  nationality: string | null;
  doc_type: string | null;
  doc_number: string | null;
  doc_issuing_country: string | null;
  doc_expiry_date: string | null;
}
interface DocumentRow {
  id: string;
  guest_id: string | null;
  doc_type: string | null;
  doc_number: string | null;
  issuing_country: string | null;
  expiry_date: string | null;
  storage_path: string;
  uploaded_at: string | null;
}
interface UpsellItemRow {
  id: string;
  key: string;
  label_it: string;
  label_en: string | null;
  price: number | string | null;
}
interface UpsellRequestRow {
  id: string;
  quantity: number;
  status: UpsellStatus;
  created_at: string;
  upsell_items: UpsellItemRow | UpsellItemRow[] | null;
}
interface ConsentRow {
  id: string;
  purpose: string;
  granted: boolean;
  created_at: string;
}

/** PostgREST may surface a to-one embed as an object or a single-element array. */
function toOne<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

/**
 * Session detail: everything staff need to review a guest check-in — stay
 * summary + public link, per-guest identity + uploaded documents (with the
 * signed download route), requested extras, and consent rows. All reads go
 * through the authenticated (cookie) server client, so RLS scopes every row
 * to the caller's hotel_id — an unknown token or one from another hotel
 * resolves to the inline "sessione non trovata" state below.
 */
export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  await requireStaff();
  const t = await getTranslations("dashboard.detail");
  const tSessions = await getTranslations("dashboard.sessions");
  const locale = await getLocale();
  const origin = await getPublicOrigin();
  const supabase = await createClient();

  const { data: sessionRaw } = await supabase
    .from("checkin_sessions")
    .select(
      "token, status, expires_at, submitted_at, created_at, hotel_id, stays(id, arrival_date, departure_date, room_label, booking_ref)",
    )
    .eq("token", token)
    .maybeSingle();
  if (!sessionRaw) {
    return <NotFoundState />;
  }
  const session = sessionRaw as { token: string; status: string; expires_at: string | null; hotel_id: string; stays: StayRow | StayRow[] | null };
  const stay = toOne<StayRow>(session.stays);
  if (!stay) {
    return <NotFoundState />;
  }

  // The hotel's default locale determines the guest link path (/it/c/{token}).
  const { data: hotel } = await supabase
    .from("hotels")
    .select("locale")
    .eq("id", session.hotel_id)
    .maybeSingle();
  const hotelLocale = hotel?.locale ?? "it";

  const { data: guestsRaw } = await supabase
    .from("guests")
    .select(
      "id, is_lead, first_name, last_name, birth_date, birth_place, nationality, doc_type, doc_number, doc_issuing_country, doc_expiry_date",
    )
    .eq("stay_id", stay.id)
    .order("is_lead", { ascending: false });
  const guests = (guestsRaw ?? []) as GuestRow[];
  const guestIds = guests.map((guest) => guest.id);

  // Documents and consents are per-guest; skip the IN query when the stay has
  // no guests yet (a fresh link nobody has used).
  let documents: DocumentRow[] = [];
  let consents: ConsentRow[] = [];
  if (guestIds.length > 0) {
    const { data: documentsRaw } = await supabase
      .from("documents")
      .select(
        "id, guest_id, doc_type, doc_number, issuing_country, expiry_date, storage_path, uploaded_at",
      )
      .in("guest_id", guestIds)
      .order("uploaded_at", { ascending: true });
    documents = (documentsRaw ?? []) as DocumentRow[];
    const { data: consentsRaw } = await supabase
      .from("consents")
      .select("id, purpose, granted, created_at")
      .in("guest_id", guestIds)
      .order("created_at", { ascending: true });
    consents = (consentsRaw ?? []) as ConsentRow[];
  }
  const documentsByGuest = new Map<string, DocumentRow[]>();
  for (const doc of documents) {
    if (!doc.guest_id) continue;
    const list = documentsByGuest.get(doc.guest_id) ?? [];
    list.push(doc);
    documentsByGuest.set(doc.guest_id, list);
  }

  const { data: upsellRaw } = await supabase
    .from("upsell_requests")
    .select(
      "id, quantity, status, created_at, upsell_items(id, key, label_it, label_en, price)",
    )
    .eq("stay_id", stay.id)
    .order("created_at", { ascending: true });
  const upsellRequests = (upsellRaw ?? []) as UpsellRequestRow[];

  const status: SessionStatus = effectiveStatus(session.status, session.expires_at);
  const linkPath = `/${hotelLocale}/c/${session.token}`;
  const publicUrl = buildCheckinUrl(origin, linkPath);

  return (
    <div>
      <Link
        href={`/${locale}/dashboard`}
        className="text-sm text-champagne/70 transition-colors hover:text-champagne"
      >
        ← {t("back")}
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-semibold text-gold">{t("title")}</h1>
          <p className="mt-1 truncate font-mono text-sm text-champagne">{session.token}</p>
        </div>
        <StatusBadge status={status} label={tSessions(`status.${status}`)} />
      </div>

      <dl className="mt-6 grid gap-x-6 gap-y-1.5 rounded-sm border border-navy-700 bg-navy-900 p-4 text-sm sm:grid-cols-2">
        <DetailRow
          label={tSessions("period")}
          value={tSessions("dateRange", {
            arrival: formatDate(stay.arrival_date, locale),
            departure: formatDate(stay.departure_date, locale),
          })}
        />
        <DetailRow
          label={tSessions("room")}
          value={stay.room_label ?? tSessions("noRoom")}
        />
        <DetailRow
          label={tSessions("booking")}
          value={stay.booking_ref ?? tSessions("noBooking")}
        />
        <DetailRow
          label={tSessions("guests")}
          value={tSessions("guestCount", { count: guests.length })}
        />
      </dl>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-navy-700 bg-navy-900 p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-navy-400">{t("checkinLink")}</p>
          <p className="truncate font-mono text-sm text-champagne">{publicUrl}</p>
        </div>
        <CopyLinkButton
          url={publicUrl}
          label={tSessions("copyLink")}
          copiedLabel={tSessions("copied")}
        />
      </div>

      <section className="mt-8" aria-labelledby="detail-guests-title">
        <h2 id="detail-guests-title" className="font-serif text-xl font-semibold text-champagne">
          {t("guests.title")}
        </h2>
        {guests.length === 0 ? (
          <p className="mt-3 rounded-sm border border-navy-700 bg-navy-900 p-4 text-sm text-navy-300">
            {t("guests.none")}
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {guests.map((guest) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                documents={documentsByGuest.get(guest.id) ?? []}
                locale={locale}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8" aria-labelledby="detail-extras-title">
        <h2 id="detail-extras-title" className="font-serif text-xl font-semibold text-champagne">
          {t("extras.title")}
        </h2>
        {upsellRequests.length === 0 ? (
          <p className="mt-3 rounded-sm border border-navy-700 bg-navy-900 p-4 text-sm text-navy-300">
            {t("extras.none")}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-sm border border-navy-700 bg-navy-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-800 text-left text-xs uppercase tracking-wide text-navy-400">
                  <th className="px-4 py-2.5 font-medium">{t("extras.item")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("extras.quantity")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("extras.unitPrice")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("extras.total")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("extras.statusLabel")}</th>
                </tr>
              </thead>
              <tbody>
                {upsellRequests.map((request) => {
                  const item = toOne<UpsellItemRow>(request.upsell_items);
                  const total = upsellLineTotal(request.quantity, item?.price ?? null);
                  return (
                    <tr
                      key={request.id}
                      className="border-b border-navy-800 last:border-0"
                    >
                      <td className="px-4 py-2.5 text-champagne">
                        {item
                          ? localizedLabel(item.label_it, item.label_en, locale)
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-navy-200">{request.quantity}</td>
                      <td className="px-4 py-2.5 text-navy-200">
                        {formatPrice(item?.price ?? null, locale)}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gold-light">
                        {formatPrice(total, locale)}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${upsellStatusBadgeClasses(request.status)}`}
                        >
                          {t(`extras.status.${request.status}`)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8" aria-labelledby="detail-consents-title">
        <h2 id="detail-consents-title" className="font-serif text-xl font-semibold text-champagne">
          {t("consents.title")}
        </h2>
        {consents.length === 0 ? (
          <p className="mt-3 rounded-sm border border-navy-700 bg-navy-900 p-4 text-sm text-navy-300">
            {t("consents.none")}
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {consents.map((consent) => {
              const grantedKey = consentGrantedKey(consent.granted);
              return (
                <li
                  key={consent.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-navy-700 bg-navy-900 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-champagne">{consent.purpose}</p>
                    <p className="text-xs text-navy-400">
                      {t("consents.createdAt")} {formatDateTime(consent.created_at, locale)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${consent.granted ? "border-gold/60 bg-gold/10 text-gold-light" : "border-navy-400 text-navy-400"}`}
                  >
                    {t(`consents.${grantedKey}`)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Inline not-found: unknown token or a session belonging to another hotel. */
async function NotFoundState() {
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
      <div className="mt-10 rounded-sm border border-navy-700 bg-navy-900 px-6 py-14 text-center">
        <h1 className="font-serif text-2xl font-semibold text-gold">
          {t("notFoundTitle")}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-navy-300">{t("notFoundBody")}</p>
      </div>
    </div>
  );
}

/** One dl pair inside a summary grid. */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="shrink-0 text-xs uppercase tracking-wide text-navy-400">{label}</dt>
      <dd className="truncate text-champagne">{value}</dd>
    </div>
  );
}

/** One guest: identity fields plus their uploaded document row(s). */
async function GuestCard({
  guest,
  documents,
  locale,
}: {
  guest: GuestRow;
  documents: DocumentRow[];
  locale: string;
}) {
  const t = await getTranslations("dashboard.detail");
  return (
    <li className="rounded-sm border border-navy-700 bg-navy-900 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-serif text-lg text-champagne">
          {`${guest.first_name} ${guest.last_name}`.trim()}
        </h3>
        {guest.is_lead && (
          <span className="inline-flex items-center whitespace-nowrap rounded-full border border-gold/60 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold-light">
            {t("guests.isLead")}
          </span>
        )}
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
        <DetailRow label={t("guests.birth")} value={birthText(guest, locale)} />
        <DetailRow
          label={t("guests.nationality")}
          value={guest.nationality ?? "—"}
        />
        <DetailRow
          label={t("guests.document")}
          value={documentText(guest.doc_type, guest.doc_number)}
        />
        <DetailRow
          label={t("guests.docIssuing")}
          value={guest.doc_issuing_country ?? "—"}
        />
        <DetailRow
          label={t("guests.docExpiry")}
          value={guest.doc_expiry_date ? formatDate(guest.doc_expiry_date, locale) : "—"}
        />
      </dl>
      <div className="mt-4 border-t border-navy-800 pt-3">
        <h4 className="text-xs uppercase tracking-wide text-navy-400">
          {t("documents.title")}
        </h4>
        {documents.length === 0 ? (
          <p className="mt-2 text-sm text-navy-300">{t("documents.none")}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-navy-800 bg-navy-950/60 px-3 py-2 text-sm"
              >
                <span className="text-champagne">
                  {documentText(doc.doc_type, doc.doc_number)}
                </span>
                <span className="text-xs text-navy-400">
                  {t("documents.uploadedAt")}{" "}
                  {doc.uploaded_at ? formatDateTime(doc.uploaded_at, locale) : "—"}
                </span>
                <DocumentDownloadButton
                  documentId={doc.id}
                  label={t("documents.download")}
                  loadingLabel={t("download.loading")}
                  errorLabel={t("download.error")}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

/** "12 April 1985 · Roma" (or just the date when the place is unknown). */
function birthText(guest: GuestRow, locale: string): string {
  const date = guest.birth_date ? formatDate(guest.birth_date, locale) : "";
  const place = guest.birth_place ?? "";
  if (date && place) return `${date} · ${place}`;
  return date || place || "—";
}

/** "Carta d'identità CA12345AB" from the two nullable columns. */
function documentText(docType: string | null, docNumber: string | null): string {
  const text = `${docType ?? ""} ${docNumber ?? ""}`.trim();
  return text || "—";
}
