import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import SendLinkButton from "./SendLinkButton";

export const metadata: Metadata = {
  title: "Dettaglio prenotazione",
  robots: "noindex, nofollow",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "In attesa",
  checked_in: "Check-in completato",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; glow: string }> = {
  pending: {
    bg: "rgba(212,180,131,0.1)",
    color: "#D4B483",
    glow: "0 0 12px rgba(212,180,131,0.15)",
  },
  checked_in: {
    bg: "rgba(34,197,94,0.1)",
    color: "#4ade80",
    glow: "0 0 12px rgba(74,222,128,0.15)",
  },
};

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtTs(iso: string) {
  return new Date(iso).toLocaleString("it-IT");
}

// Brand colors
const P = {
  midnight: "#050B17",
  navy: "#0A1931",
  navyDeep: "#0d2040",
  gold: "#D4B483",
  champagne: "#F5E9D3",
  border: "rgba(212,180,131,0.15)",
  dim: "rgba(245,233,211,0.45)",
  dimMore: "rgba(245,233,211,0.3)",
};

const cardStyle: React.CSSProperties = {
  background: `linear-gradient(145deg, ${P.navyDeep} 0%, ${P.navy} 100%)`,
  border: `1px solid ${P.border}`,
  borderRadius: 14,
  padding: 26,
  boxShadow: "0 4px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(212,180,131,0.05)",
};

const sectionHeading: React.CSSProperties = {
  fontFamily: "var(--font-cormorant)",
  fontSize: 19,
  fontWeight: 300,
  color: P.champagne,
  margin: "0 0 20px",
  letterSpacing: "0.04em",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: P.dimMore,
  marginBottom: 4,
  fontWeight: 600,
};

const valueStyle: React.CSSProperties = {
  fontSize: 14,
  color: P.champagne,
  lineHeight: 1.4,
};

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, guest_name, arrival, departure, room_label, party_size, status, check_in_token, source, created_at, hotel_id")
    .eq("id", id)
    .single();

  if (!reservation) notFound();

  const [{ data: guests }, { data: orders }, { data: contact }] =
    await Promise.all([
      supabase
        .from("guests")
        .select("id, first_name, last_name, dob, sex, citizenship, birth_place, document_type, document_number, document_image_path, is_lead")
        .eq("reservation_id", id)
        .order("is_lead", { ascending: false }),
      supabase
        .from("upsell_orders")
        .select("id, quantity, unit_price, status, upsells(name, category)")
        .eq("reservation_id", id),
      supabase
        .from("contacts")
        .select("email, phone, marketing_consent, consent_timestamp")
        .eq("reservation_id", id)
        .single(),
    ]);

  const signedUrls: Record<string, string> = {};
  for (const g of guests ?? []) {
    if (g.document_image_path) {
      const { data } = await admin.storage
        .from("guest-documents")
        .createSignedUrl(g.document_image_path, 300);
      if (data?.signedUrl) signedUrls[g.id] = data.signedUrl;
    }
  }

  const totalUpsells = (orders ?? []).reduce(
    (s, o) => s + o.unit_price * o.quantity,
    0
  );

  const statusStyle = STATUS_STYLE[reservation.status] ?? STATUS_STYLE.pending;
  const checkInUrl = `${siteUrl}/s/${reservation.check_in_token}`;

  return (
    <>
      <style>{`
        .vq-back:hover { color: ${P.champagne} !important; letter-spacing: 0.05em; }
        .vq-back { transition: color 0.15s ease, letter-spacing 0.15s ease; }
        .vq-field:hover p:last-child { color: ${P.champagne} !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Back + header */}
        <div>
          <Link href="/hotel" className="vq-back" style={{ fontSize: 12, color: P.gold, textDecoration: "none", letterSpacing: "0.03em", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: 34,
                fontWeight: 300,
                margin: 0,
                color: P.champagne,
                letterSpacing: "0.01em",
              }}
            >
              {reservation.guest_name}
            </h1>
            <span
              style={{
                padding: "5px 13px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                background: statusStyle.bg,
                color: statusStyle.color,
                boxShadow: statusStyle.glow,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: statusStyle.color, flexShrink: 0 }} />
              {STATUS_LABEL[reservation.status] ?? reservation.status}
            </span>
          </div>
        </div>

        {/* Reservation info */}
        <div style={cardStyle}>
          <h3 style={sectionHeading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Prenotazione
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 18 }}>
            {[
              { label: "Arrivo", value: fmtDate(reservation.arrival) },
              { label: "Partenza", value: fmtDate(reservation.departure) },
              { label: "Camera", value: reservation.room_label ?? "—" },
              { label: "N° ospiti", value: String(reservation.party_size) },
              { label: "Canale", value: reservation.source ?? "direct" },
              { label: "Token", value: reservation.check_in_token },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={labelStyle}>{label}</p>
                <p style={{ ...valueStyle, marginTop: 3, wordBreak: "break-all" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Check-in link — only if not yet checked in */}
        {reservation.status !== "checked_in" && (
          <div style={cardStyle}>
            <h3 style={sectionHeading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              Link check-in ospite
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* QR */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ padding: 12, background: P.champagne, borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInUrl)}&margin=10&format=png`}
                    alt="QR check-in"
                    width={160}
                    height={160}
                    style={{ display: "block", borderRadius: 4 }}
                  />
                </div>
                <p style={{ fontSize: 10, color: P.dimMore, margin: 0, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Scansiona o invia all&apos;ospite
                </p>
              </div>
              {/* Link */}
              <div>
                <p style={{ ...labelStyle, marginBottom: 8 }}>URL</p>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div
                    style={{
                      flex: 1,
                      padding: "10px 13px",
                      background: "rgba(0,0,0,0.2)",
                      border: `1px solid ${P.border}`,
                      borderRadius: 8,
                      fontSize: 12,
                      color: P.dim,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: "monospace",
                    }}
                    title={checkInUrl}
                  >
                    {checkInUrl}
                  </div>
                  <SendLinkButton url={checkInUrl} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guests */}
        {guests && guests.length > 0 && (
          <div style={cardStyle}>
            <h3 style={sectionHeading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              Ospiti registrati
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {guests.map((g, i) => (
                <div
                  key={g.id}
                  style={{
                    paddingTop: i > 0 ? 22 : 0,
                    borderTop: i > 0 ? `1px solid ${P.border}` : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(212,180,131,0.08)", border: `1px solid ${P.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: P.champagne, margin: 0 }}>
                      {g.first_name} {g.last_name}
                    </p>
                    {g.is_lead && (
                      <span
                        style={{
                          fontSize: 10,
                          color: P.gold,
                          border: `1px solid rgba(212,180,131,0.25)`,
                          borderRadius: 4,
                          padding: "2px 8px",
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        Intestatario
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
                    {[
                      { label: "Data nascita", value: g.dob ?? "—" },
                      { label: "Sesso", value: g.sex ?? "—" },
                      { label: "Cittadinanza", value: g.citizenship ?? "—" },
                      { label: "Luogo nascita", value: g.birth_place ?? "—" },
                      { label: "Documento", value: g.document_type ?? "—" },
                      { label: "N° documento", value: g.document_number ?? "—" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p style={labelStyle}>{label}</p>
                        <p style={{ ...valueStyle, fontSize: 13, marginTop: 3 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                  {signedUrls[g.id] && (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ ...labelStyle, marginBottom: 10 }}>Documento ID</p>
                      <a href={signedUrls[g.id]} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={signedUrls[g.id]}
                          alt="Documento ID"
                          style={{ maxHeight: 200, borderRadius: 8, border: `1px solid ${P.border}`, objectFit: "contain", display: "block" }}
                        />
                      </a>
                      <p style={{ fontSize: 11, color: P.dimMore, marginTop: 8 }}>
                        Link valido 5 min ·{" "}
                        <a href={signedUrls[g.id]} target="_blank" rel="noreferrer" style={{ color: P.gold, textDecoration: "none" }}>
                          Apri in nuova scheda
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upsell orders */}
        {orders && orders.length > 0 && (
          <div style={cardStyle}>
            <h3 style={sectionHeading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Servizi richiesti
            </h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {orders.map((o) => {
                const upsell = o.upsells as unknown as { name: string; category: string } | null;
                return (
                  <div
                    key={o.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: `1px solid rgba(212,180,131,0.07)`,
                      gap: 12,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 14, color: P.champagne, margin: "0 0 3px", fontWeight: 500 }}>
                        {upsell?.name ?? "Servizio"}
                      </p>
                      <p style={{ fontSize: 11, color: P.dimMore, margin: 0, letterSpacing: "0.03em" }}>
                        {upsell?.category} · qty {o.quantity}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 15, color: P.gold, margin: 0, fontWeight: 600 }}>
                        € {(o.unit_price * o.quantity).toFixed(2)}
                      </p>
                      <p style={{ fontSize: 11, color: o.status === "fulfilled" ? "#4ade80" : P.dimMore, margin: "3px 0 0" }}>
                        {o.status === "fulfilled" ? "✓ Evaso" : "In attesa"}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14 }}>
                <span style={{ fontSize: 12, color: P.dim, letterSpacing: "0.05em", textTransform: "uppercase" }}>Totale</span>
                <span style={{ fontSize: 18, color: P.gold, fontWeight: 700, fontFamily: "var(--font-cormorant)" }}>
                  € {totalUpsells.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Contact */}
        {contact && (
          <div style={cardStyle}>
            <h3 style={sectionHeading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              Contatti
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 16 }}>
              {[
                { label: "Email", value: contact.email ?? "—" },
                { label: "Telefono", value: contact.phone ?? "—" },
                { label: "Marketing", value: contact.marketing_consent ? "Consenso dato" : "Non consensito" },
                { label: "Consenso il", value: contact.consent_timestamp ? fmtTs(contact.consent_timestamp) : "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={labelStyle}>{label}</p>
                  <p style={{ ...valueStyle, fontSize: 13, marginTop: 4, wordBreak: "break-all" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
