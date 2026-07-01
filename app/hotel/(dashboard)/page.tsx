import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: "noindex, nofollow",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "In attesa",
  checked_in: "Check-in",
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending: { bg: "rgba(212,180,131,0.12)", color: "#D4B483" },
  checked_in: { bg: "rgba(34,197,94,0.12)", color: "#4ade80" },
};

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nightsBetween(a: string, d: string) {
  return Math.round(
    (new Date(d).getTime() - new Date(a).getTime()) / 86_400_000
  );
}

function fmtEur(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: reservations }, { data: orders }, { data: hotelData }] = await Promise.all([
    supabase
      .from("reservations")
      .select("id, guest_name, arrival, departure, room_label, party_size, status, check_in_token, created_at")
      .order("arrival", { ascending: true }),
    supabase
      .from("upsell_orders")
      .select("quantity, unit_price"),
    supabase
      .from("hotels")
      .select("id, name, api_key")
      .single(),
  ]);

  const all = reservations ?? [];
  const pending = all.filter((r) => r.status === "pending").length;
  const checkedIn = all.filter((r) => r.status === "checked_in").length;
  const conversionRate = all.length > 0 ? Math.round((checkedIn / all.length) * 100) : 0;

  const upsellRevenue = (orders ?? []).reduce(
    (s, o) => s + (o.quantity ?? 1) * Number(o.unit_price ?? 0),
    0
  );

  const avgNights =
    all.length > 0
      ? (all.reduce((s, r) => s + nightsBetween(r.arrival, r.departure), 0) / all.length).toFixed(1)
      : "—";

  const now = new Date();
  const in7 = new Date(now.getTime() + 7 * 86_400_000);
  const upcomingArrivals = all.filter((r) => {
    const a = new Date(r.arrival + "T12:00:00");
    return a >= now && a <= in7;
  }).length;

  return (
    <>
      <style>{`
        .vq-stat-card {
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .vq-stat-card:hover {
          border-color: rgba(212,180,131,0.35) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,180,131,0.06);
          transform: translateY(-2px);
        }
        .vq-metric-card {
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .vq-metric-card:hover {
          border-color: rgba(212,180,131,0.3) !important;
          box-shadow: 0 6px 24px rgba(0,0,0,0.3);
          transform: translateY(-1px);
        }
        .vq-res-row {
          transition: background 0.15s ease;
        }
        .vq-res-row:hover {
          background: rgba(212,180,131,0.03);
        }
        .vq-detail-link {
          transition: color 0.15s ease, letter-spacing 0.15s ease;
        }
        .vq-detail-link:hover {
          color: #F5E9D3 !important;
          letter-spacing: 0.03em;
        }
        .vq-nuova-btn {
          transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .vq-nuova-btn:hover {
          background: #c9a76a !important;
          box-shadow: 0 4px 20px rgba(212,180,131,0.28);
          transform: translateY(-1px);
        }
        @keyframes vq-bar-fill {
          from { width: 0; }
          to { width: var(--bar-w); }
        }
        .vq-bar-fill {
          animation: vq-bar-fill 0.9s cubic-bezier(0.22,1,0.36,1) both;
          animation-delay: 0.1s;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: 34,
                fontWeight: 300,
                color: "#F5E9D3",
                margin: 0,
                letterSpacing: "0.01em",
              }}
            >
              Dashboard
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "rgba(245,233,211,0.35)", letterSpacing: "0.02em" }}>
              Panoramica prenotazioni
            </p>
          </div>
          <Link
            href="/hotel/nuova"
            className="vq-nuova-btn"
            style={{
              background: "#D4B483",
              color: "#050B17",
              borderRadius: 8,
              padding: "10px 22px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              textTransform: "uppercase",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuova prenotazione
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { label: "Totali", value: all.length, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { label: "In attesa", value: pending, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Check-in completato", value: checkedIn, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map((s) => (
            <div
              key={s.label}
              className="vq-stat-card"
              style={{
                background: "linear-gradient(135deg, #0A1931 0%, #0d1f3c 100%)",
                border: "1px solid rgba(212,180,131,0.15)",
                borderRadius: 12,
                padding: "20px 24px",
                flex: "1 1 150px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 36, fontWeight: 600, color: "#D4B483", margin: 0, lineHeight: 1, fontFamily: "var(--font-cormorant)", letterSpacing: "-0.01em" }}>
                  {s.value}
                </p>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(212,180,131,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(212,180,131,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={s.icon} />
                  </svg>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "rgba(245,233,211,0.45)", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Metrics */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 18,
              fontWeight: 300,
              color: "rgba(245,233,211,0.55)",
              margin: "0 0 12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Metriche
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>

            {/* Check-in rate */}
            <div
              className="vq-metric-card"
              style={{
                background: "#0A1931",
                border: "1px solid rgba(212,180,131,0.12)",
                borderRadius: 12,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,233,211,0.35)", fontWeight: 600 }}>
                  Tasso check-in
                </span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(212,180,131,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <p style={{ fontSize: 30, fontWeight: 600, color: "#F5E9D3", margin: 0, lineHeight: 1, fontFamily: "var(--font-cormorant)" }}>
                {conversionRate}<span style={{ fontSize: 16, color: "rgba(245,233,211,0.5)", fontFamily: "inherit" }}>%</span>
              </p>
              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 2, background: "rgba(212,180,131,0.1)", overflow: "hidden" }}>
                <div
                  className="vq-bar-fill"
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    background: "linear-gradient(90deg, #D4B483, #c9a76a)",
                    ["--bar-w" as string]: `${conversionRate}%`,
                    width: `${conversionRate}%`,
                  } as React.CSSProperties}
                />
              </div>
              <p style={{ fontSize: 11, color: "rgba(245,233,211,0.3)", margin: 0 }}>
                {checkedIn} su {all.length} prenotazioni
              </p>
            </div>

            {/* Upsell revenue */}
            <div
              className="vq-metric-card"
              style={{
                background: "#0A1931",
                border: "1px solid rgba(212,180,131,0.12)",
                borderRadius: 12,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,233,211,0.35)", fontWeight: 600 }}>
                  Ricavi upsell
                </span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(212,180,131,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <p style={{ fontSize: 28, fontWeight: 600, color: "#4ade80", margin: 0, lineHeight: 1, fontFamily: "var(--font-cormorant)" }}>
                {upsellRevenue > 0 ? fmtEur(upsellRevenue) : "—"}
              </p>
              <p style={{ fontSize: 11, color: "rgba(245,233,211,0.3)", margin: 0 }}>
                {(orders ?? []).length} ordini totali
              </p>
            </div>

            {/* Average stay */}
            <div
              className="vq-metric-card"
              style={{
                background: "#0A1931",
                border: "1px solid rgba(212,180,131,0.12)",
                borderRadius: 12,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,233,211,0.35)", fontWeight: 600 }}>
                  Soggiorno medio
                </span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(212,180,131,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p style={{ fontSize: 30, fontWeight: 600, color: "#F5E9D3", margin: 0, lineHeight: 1, fontFamily: "var(--font-cormorant)" }}>
                {avgNights}<span style={{ fontSize: 14, color: "rgba(245,233,211,0.45)", marginLeft: 4 }}>notti</span>
              </p>
              <p style={{ fontSize: 11, color: "rgba(245,233,211,0.3)", margin: 0 }}>
                su {all.length} {all.length === 1 ? "prenotazione" : "prenotazioni"}
              </p>
            </div>

            {/* Upcoming arrivals */}
            <div
              className="vq-metric-card"
              style={{
                background: "#0A1931",
                border: "1px solid rgba(212,180,131,0.12)",
                borderRadius: 12,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,233,211,0.35)", fontWeight: 600 }}>
                  Arrivi prossimi 7 gg
                </span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(212,180,131,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <p style={{ fontSize: 30, fontWeight: 600, color: upcomingArrivals > 0 ? "#D4B483" : "rgba(245,233,211,0.3)", margin: 0, lineHeight: 1, fontFamily: "var(--font-cormorant)" }}>
                {upcomingArrivals}
              </p>
              <p style={{ fontSize: 11, color: "rgba(245,233,211,0.3)", margin: 0 }}>
                {upcomingArrivals === 0 ? "Nessun arrivo in programma" : upcomingArrivals === 1 ? "ospite in arrivo" : "ospiti in arrivo"}
              </p>
            </div>

          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: "linear-gradient(180deg, #0c1f38 0%, #0A1931 100%)",
            border: "1px solid rgba(212,180,131,0.15)",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 4px 32px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ padding: "20px 26px", borderBottom: "1px solid rgba(212,180,131,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: 22,
                fontWeight: 300,
                margin: 0,
                color: "#F5E9D3",
                letterSpacing: "0.03em",
              }}
            >
              Prenotazioni
            </h2>
            {all.length > 0 && (
              <span style={{ fontSize: 12, color: "rgba(245,233,211,0.3)", letterSpacing: "0.05em" }}>
                {all.length} {all.length === 1 ? "record" : "record"}
              </span>
            )}
          </div>

          {all.length === 0 ? (
            <div style={{ padding: "48px 32px", textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(212,180,131,0.06)", border: "1px solid rgba(212,180,131,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(212,180,131,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p style={{ color: "rgba(245,233,211,0.4)", fontSize: 14, margin: "0 0 4px" }}>Nessuna prenotazione trovata</p>
              <p style={{ color: "rgba(245,233,211,0.25)", fontSize: 12, margin: 0 }}>Crea la prima prenotazione per iniziare</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(212,180,131,0.08)" }}>
                    {["Ospite", "Camera", "Arrivo", "Partenza", "Notti", "Ospiti", "Stato", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "11px 16px",
                          textAlign: "left",
                          fontSize: 10,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "rgba(245,233,211,0.35)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          background: "rgba(0,0,0,0.1)",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {all.map((r) => {
                    const badge = STATUS_COLOR[r.status] ?? STATUS_COLOR.pending;
                    return (
                      <tr
                        key={r.id}
                        className="vq-res-row"
                        style={{ borderBottom: "1px solid rgba(212,180,131,0.06)" }}
                      >
                        <td style={{ padding: "15px 16px", color: "#F5E9D3", fontWeight: 500, lineHeight: 1.3 }}>
                          {r.guest_name}
                        </td>
                        <td style={{ padding: "15px 16px", color: "rgba(245,233,211,0.55)", fontSize: 13 }}>
                          {r.room_label ?? "—"}
                        </td>
                        <td style={{ padding: "15px 16px", color: "rgba(245,233,211,0.75)", whiteSpace: "nowrap", fontSize: 13 }}>
                          {fmtDate(r.arrival)}
                        </td>
                        <td style={{ padding: "15px 16px", color: "rgba(245,233,211,0.75)", whiteSpace: "nowrap", fontSize: 13 }}>
                          {fmtDate(r.departure)}
                        </td>
                        <td style={{ padding: "15px 16px", color: "rgba(245,233,211,0.5)", textAlign: "center", fontSize: 13 }}>
                          {nightsBetween(r.arrival, r.departure)}
                        </td>
                        <td style={{ padding: "15px 16px", color: "rgba(245,233,211,0.5)", textAlign: "center", fontSize: 13 }}>
                          {r.party_size}
                        </td>
                        <td style={{ padding: "15px 16px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              padding: "4px 11px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                              background: badge.bg,
                              color: badge.color,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: badge.color, flexShrink: 0 }} />
                            {STATUS_LABEL[r.status] ?? r.status}
                          </span>
                        </td>
                        <td style={{ padding: "15px 16px" }}>
                          <Link
                            href={`/hotel/r/${r.id}`}
                            className="vq-detail-link"
                            style={{
                              fontSize: 12,
                              color: "#D4B483",
                              textDecoration: "none",
                              whiteSpace: "nowrap",
                              letterSpacing: "0.05em",
                              fontWeight: 500,
                            }}
                          >
                            Dettaglio →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* OTA Integration */}
        {hotelData?.api_key && (
          <div
            style={{
              background: "linear-gradient(180deg, #0c1f38 0%, #0A1931 100%)",
              border: "1px solid rgba(212,180,131,0.15)",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 4px 32px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ padding: "20px 26px", borderBottom: "1px solid rgba(212,180,131,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(212,180,131,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(212,180,131,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 300, margin: 0, color: "#F5E9D3", letterSpacing: "0.03em" }}>
                Integrazione OTA / Webhook
              </h2>
            </div>
            <div style={{ padding: "24px 26px", display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 13, color: "rgba(245,233,211,0.5)", margin: 0, lineHeight: 1.65 }}>
                Invia prenotazioni OTA automaticamente a ValtiqStay tramite HTTP POST. Il sistema genera il link check-in e lo restituisce nella risposta.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,233,211,0.35)", margin: "0 0 7px", fontWeight: 600 }}>
                    Endpoint
                  </p>
                  <code style={{ display: "block", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(212,180,131,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#4ade80", letterSpacing: "0.03em", fontFamily: "monospace", wordBreak: "break-all" }}>
                    POST https://www.valtiqstay.com/api/webhooks/reservation
                  </code>
                </div>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,233,211,0.35)", margin: "0 0 7px", fontWeight: 600 }}>
                    API Key (header: x-valtiqstay-key)
                  </p>
                  <code style={{ display: "block", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(212,180,131,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#D4B483", letterSpacing: "0.04em", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {hotelData.api_key}
                  </code>
                </div>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,233,211,0.35)", margin: "0 0 7px", fontWeight: 600 }}>
                    Payload esempio
                  </p>
                  <code style={{ display: "block", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(212,180,131,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 11, color: "rgba(245,233,211,0.65)", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
{`{
  "guest_name": "Mario Rossi",
  "arrival": "2026-08-15",
  "departure": "2026-08-18",
  "room_label": "Camera 201",
  "party_size": 2,
  "source": "booking_com",
  "guest_email": "mario@example.com",
  "external_id": "BK-12345"
}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
