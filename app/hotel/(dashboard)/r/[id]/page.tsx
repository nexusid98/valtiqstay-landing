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

const STATUS_COLOR: Record<string, string> = {
  pending: "#D4B483",
  checked_in: "#4ade80",
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

  // Generate signed URLs for document images (service_role, short TTL)
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

  const C = {
    card: { background: "#0A1931", border: "1px solid rgba(212,180,131,0.18)", borderRadius: 12, padding: 24 } as React.CSSProperties,
    label: { fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(245,233,211,0.4)" } as React.CSSProperties,
    value: { fontSize: 15, color: "#F5E9D3" } as React.CSSProperties,
    h3: { fontFamily: "var(--font-cormorant)", fontSize: 20, fontWeight: 300, color: "#F5E9D3", margin: "0 0 16px" } as React.CSSProperties,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Back + header */}
      <div>
        <Link
          href="/hotel"
          style={{ fontSize: 13, color: "#D4B483", textDecoration: "none" }}
        >
          ← Dashboard
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 32,
              fontWeight: 300,
              margin: 0,
              color: "#F5E9D3",
            }}
          >
            {reservation.guest_name}
          </h1>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              background: reservation.status === "checked_in"
                ? "rgba(34,197,94,0.12)"
                : "rgba(212,180,131,0.12)",
              color: STATUS_COLOR[reservation.status] ?? "#D4B483",
            }}
          >
            {STATUS_LABEL[reservation.status] ?? reservation.status}
          </span>
        </div>
      </div>

      {/* Reservation info */}
      <div style={C.card}>
        <h3 style={C.h3}>Prenotazione</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
          {[
            { label: "Arrivo", value: fmtDate(reservation.arrival) },
            { label: "Partenza", value: fmtDate(reservation.departure) },
            { label: "Camera", value: reservation.room_label ?? "—" },
            { label: "Ospiti", value: String(reservation.party_size) },
            { label: "Canale", value: reservation.source ?? "direct" },
            { label: "Token QR", value: reservation.check_in_token },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={C.label}>{label}</p>
              <p style={{ ...C.value, marginTop: 4, wordBreak: "break-all" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Check-in link */}
      {reservation.status !== "checked_in" && (
        <div style={C.card}>
          <h3 style={C.h3}>Link check-in ospite</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${siteUrl}/s/${reservation.check_in_token}`)}&margin=10&format=png`}
                alt="QR check-in"
                width={160}
                height={160}
                style={{ borderRadius: 8, background: "#fff", padding: 4 }}
              />
              <p style={{ fontSize: 12, color: "rgba(245,233,211,0.4)", margin: 0, textAlign: "center" }}>
                Scansiona o invia il link all&apos;ospite
              </p>
            </div>
            <div>
              <p style={C.label}>URL</p>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
                <div
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(212,180,131,0.18)",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "rgba(245,233,211,0.55)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={`${siteUrl}/s/${reservation.check_in_token}`}
                >
                  {`${siteUrl}/s/${reservation.check_in_token}`}
                </div>
                <SendLinkButton url={`${siteUrl}/s/${reservation.check_in_token}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guests */}
      {guests && guests.length > 0 && (
        <div style={C.card}>
          <h3 style={C.h3}>Ospiti registrati</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {guests.map((g, i) => (
              <div
                key={g.id}
                style={{
                  paddingTop: i > 0 ? 20 : 0,
                  borderTop: i > 0 ? "1px solid rgba(212,180,131,0.12)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#F5E9D3", margin: 0 }}>
                    {g.first_name} {g.last_name}
                  </p>
                  {g.is_lead && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#D4B483",
                        border: "1px solid rgba(212,180,131,0.3)",
                        borderRadius: 4,
                        padding: "1px 7px",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Intestatario
                    </span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                  {[
                    { label: "Data nascita", value: g.dob ?? "—" },
                    { label: "Sesso", value: g.sex ?? "—" },
                    { label: "Cittadinanza", value: g.citizenship ?? "—" },
                    { label: "Luogo nascita", value: g.birth_place ?? "—" },
                    { label: "Documento", value: g.document_type ?? "—" },
                    { label: "N° documento", value: g.document_number ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={C.label}>{label}</p>
                      <p style={{ ...C.value, fontSize: 14, marginTop: 3 }}>{value}</p>
                    </div>
                  ))}
                </div>
                {signedUrls[g.id] && (
                  <div style={{ marginTop: 14 }}>
                    <p style={{ ...C.label, marginBottom: 8 }}>Documento ID</p>
                    <a href={signedUrls[g.id]} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={signedUrls[g.id]}
                        alt="Documento ID"
                        style={{ maxHeight: 200, borderRadius: 8, border: "1px solid rgba(212,180,131,0.2)", objectFit: "contain" }}
                      />
                    </a>
                    <p style={{ fontSize: 12, color: "rgba(245,233,211,0.35)", marginTop: 6 }}>
                      Link valido 5 minuti · <a href={signedUrls[g.id]} target="_blank" rel="noreferrer" style={{ color: "#D4B483" }}>Apri</a>
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
        <div style={C.card}>
          <h3 style={C.h3}>Servizi richiesti</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orders.map((o) => {
              const upsell = o.upsells as unknown as { name: string; category: string } | null;
              return (
                <div
                  key={o.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid rgba(212,180,131,0.08)",
                    gap: 12,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 14, color: "#F5E9D3", margin: "0 0 2px", fontWeight: 500 }}>
                      {upsell?.name ?? "Servizio"}
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(245,233,211,0.4)", margin: 0 }}>
                      {upsell?.category} · qty {o.quantity}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 15, color: "#D4B483", margin: 0, fontWeight: 600 }}>
                      € {(o.unit_price * o.quantity).toFixed(2)}
                    </p>
                    <p style={{ fontSize: 12, color: "rgba(245,233,211,0.4)", margin: "2px 0 0" }}>
                      {o.status === "fulfilled" ? "✓ Evaso" : "In attesa"}
                    </p>
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
              <span style={{ fontSize: 14, color: "rgba(245,233,211,0.5)" }}>Totale</span>
              <span style={{ fontSize: 17, color: "#D4B483", fontWeight: 700 }}>
                € {totalUpsells.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Contact */}
      {contact && (
        <div style={C.card}>
          <h3 style={C.h3}>Contatti</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
            {[
              { label: "Email", value: contact.email ?? "—" },
              { label: "Telefono", value: contact.phone ?? "—" },
              { label: "Marketing", value: contact.marketing_consent ? "Sì" : "No" },
              { label: "Consenso il", value: contact.consent_timestamp ? fmtTs(contact.consent_timestamp) : "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={C.label}>{label}</p>
                <p style={{ ...C.value, fontSize: 14, marginTop: 4, wordBreak: "break-all" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
