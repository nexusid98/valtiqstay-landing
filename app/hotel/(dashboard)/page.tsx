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

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: reservations } = await supabase
    .from("reservations")
    .select(
      "id, guest_name, arrival, departure, room_label, party_size, status, check_in_token, created_at"
    )
    .order("arrival", { ascending: true });

  const all = reservations ?? [];
  const pending = all.filter((r) => r.status === "pending").length;
  const checkedIn = all.filter((r) => r.status === "checked_in").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Prenotazioni totali", value: all.length },
          { label: "In attesa", value: pending },
          { label: "Check-in completato", value: checkedIn },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#0A1931",
              border: "1px solid rgba(212,180,131,0.18)",
              borderRadius: 10,
              padding: "16px 24px",
              flex: "1 1 140px",
            }}
          >
            <p style={{ fontSize: 28, fontWeight: 600, color: "#D4B483", margin: 0 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 12, color: "rgba(245,233,211,0.5)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "#0A1931",
          border: "1px solid rgba(212,180,131,0.18)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(212,180,131,0.12)" }}>
          <h2
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 22,
              fontWeight: 300,
              margin: 0,
              color: "#F5E9D3",
            }}
          >
            Prenotazioni
          </h2>
        </div>

        {all.length === 0 ? (
          <p style={{ padding: 32, color: "rgba(245,233,211,0.4)", fontSize: 14 }}>
            Nessuna prenotazione trovata.
          </p>
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
                <tr style={{ borderBottom: "1px solid rgba(212,180,131,0.1)" }}>
                  {["Ospite", "Camera", "Arrivo", "Partenza", "Notti", "Ospiti", "Stato", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "rgba(245,233,211,0.4)",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
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
                      style={{ borderBottom: "1px solid rgba(212,180,131,0.07)" }}
                    >
                      <td style={{ padding: "14px 16px", color: "#F5E9D3", fontWeight: 500 }}>
                        {r.guest_name}
                      </td>
                      <td style={{ padding: "14px 16px", color: "rgba(245,233,211,0.6)" }}>
                        {r.room_label ?? "—"}
                      </td>
                      <td style={{ padding: "14px 16px", color: "rgba(245,233,211,0.8)", whiteSpace: "nowrap" }}>
                        {fmtDate(r.arrival)}
                      </td>
                      <td style={{ padding: "14px 16px", color: "rgba(245,233,211,0.8)", whiteSpace: "nowrap" }}>
                        {fmtDate(r.departure)}
                      </td>
                      <td style={{ padding: "14px 16px", color: "rgba(245,233,211,0.6)", textAlign: "center" }}>
                        {nightsBetween(r.arrival, r.departure)}
                      </td>
                      <td style={{ padding: "14px 16px", color: "rgba(245,233,211,0.6)", textAlign: "center" }}>
                        {r.party_size}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 500,
                            background: badge.bg,
                            color: badge.color,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <Link
                          href={`/hotel/r/${r.id}`}
                          style={{
                            fontSize: 13,
                            color: "#D4B483",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
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
    </div>
  );
}
