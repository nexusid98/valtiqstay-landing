"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Reservation = {
  id: string;
  guest_name: string;
  arrival: string;
  departure: string;
  room_label: string | null;
  party_size: number;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "In attesa",
  checked_in: "Check-in",
  cancelled: "Annullata",
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending: { bg: "rgba(212,180,131,0.12)", color: "#D4B483" },
  checked_in: { bg: "rgba(34,197,94,0.12)", color: "#4ade80" },
  cancelled: { bg: "rgba(220,38,38,0.08)", color: "#fca5a5" },
};

type FilterStatus = "all" | "pending" | "checked_in" | "cancelled";

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function nightsBetween(a: string, d: string) {
  return Math.round((new Date(d).getTime() - new Date(a).getTime()) / 86_400_000);
}

export default function ReservationsTable({
  reservations,
}: {
  reservations: Reservation[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [inputFocused, setInputFocused] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (q && !r.guest_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [reservations, query, filter]);

  const tabs: { key: FilterStatus; label: string; count: number }[] = [
    { key: "all", label: "Tutti", count: reservations.length },
    {
      key: "pending",
      label: "In attesa",
      count: reservations.filter((r) => r.status === "pending").length,
    },
    {
      key: "checked_in",
      label: "Check-in",
      count: reservations.filter((r) => r.status === "checked_in").length,
    },
    {
      key: "cancelled",
      label: "Annullate",
      count: reservations.filter((r) => r.status === "cancelled").length,
    },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(180deg, #0c1f38 0%, #0A1931 100%)",
        border: "1px solid rgba(212,180,131,0.15)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 4px 32px rgba(0,0,0,0.2)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 26px 0",
          borderBottom: "1px solid rgba(212,180,131,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
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

          {/* Search */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(212,180,131,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Cerca ospite…"
              style={{
                background: inputFocused ? "rgba(212,180,131,0.04)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${inputFocused ? "rgba(212,180,131,0.5)" : "rgba(212,180,131,0.18)"}`,
                borderRadius: 7,
                padding: "8px 12px 8px 32px",
                color: "#F5E9D3",
                fontSize: 13,
                outline: "none",
                width: 200,
                transition: "border-color 0.18s ease",
              }}
            />
          </div>
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${filter === tab.key ? "#D4B483" : "transparent"}`,
                color:
                  filter === tab.key
                    ? "#D4B483"
                    : "rgba(245,233,211,0.35)",
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: filter === tab.key ? 600 : 400,
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "color 0.15s ease, border-color 0.15s ease",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tab.label}
              <span
                style={{
                  fontSize: 10,
                  background: filter === tab.key ? "rgba(212,180,131,0.15)" : "rgba(255,255,255,0.06)",
                  color: filter === tab.key ? "#D4B483" : "rgba(245,233,211,0.3)",
                  borderRadius: 10,
                  padding: "1px 6px",
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ padding: "48px 32px", textAlign: "center" }}>
          <p style={{ color: "rgba(245,233,211,0.35)", fontSize: 14, margin: 0 }}>
            {query ? `Nessun ospite trovato per "${query}"` : "Nessuna prenotazione in questa categoria"}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
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
              {filtered.map((r) => {
                const badge = STATUS_COLOR[r.status] ?? STATUS_COLOR.pending;
                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid rgba(212,180,131,0.06)",
                      opacity: r.status === "cancelled" ? 0.55 : 1,
                    }}
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
  );
}
