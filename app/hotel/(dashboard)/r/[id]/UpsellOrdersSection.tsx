"use client";

import { useState } from "react";

type Order = {
  id: string;
  quantity: number;
  unit_price: number;
  status: string;
  upsells: { name: string; category: string } | null;
};

const P = {
  gold: "#D4B483",
  champagne: "#F5E9D3",
  dim: "rgba(245,233,211,0.45)",
  border: "rgba(212,180,131,0.15)",
};

export default function UpsellOrdersSection({
  initialOrders,
}: {
  initialOrders: Order[];
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [toggling, setToggling] = useState<string | null>(null);

  async function toggleFulfilled(id: string, current: string) {
    const next = current === "fulfilled" ? "requested" : "fulfilled";
    setToggling(id);
    try {
      const res = await fetch(`/api/hotel/upsell-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
      }
    } finally {
      setToggling(null);
    }
  }

  const total = orders.reduce((s, o) => s + o.unit_price * o.quantity, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {orders.map((o) => {
        const upsell = o.upsells;
        const fulfilled = o.status === "fulfilled";
        const isToggling = toggling === o.id;
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
              opacity: fulfilled ? 0.75 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, color: P.champagne, margin: "0 0 3px", fontWeight: 500, textDecoration: fulfilled ? "line-through" : "none" }}>
                {upsell?.name ?? "Servizio"}
              </p>
              <p style={{ fontSize: 11, color: "rgba(245,233,211,0.3)", margin: 0, letterSpacing: "0.03em" }}>
                {upsell?.category} · qty {o.quantity}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 15, color: P.gold, margin: 0, fontWeight: 600 }}>
                  € {(o.unit_price * o.quantity).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => !isToggling && toggleFulfilled(o.id, o.status)}
                disabled={isToggling}
                title={fulfilled ? "Segna come da evadere" : "Segna come evaso"}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: `1px solid ${fulfilled ? "rgba(34,197,94,0.5)" : "rgba(212,180,131,0.25)"}`,
                  background: fulfilled ? "rgba(34,197,94,0.15)" : "rgba(212,180,131,0.06)",
                  color: fulfilled ? "#4ade80" : "rgba(212,180,131,0.5)",
                  cursor: isToggling ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                  fontSize: 14,
                }}
              >
                {isToggling ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "vq-spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                ) : fulfilled ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14 }}>
        <span style={{ fontSize: 12, color: P.dim, letterSpacing: "0.05em", textTransform: "uppercase" }}>Totale</span>
        <span style={{ fontSize: 18, color: P.gold, fontWeight: 700, fontFamily: "var(--font-cormorant)" }}>
          € {total.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
