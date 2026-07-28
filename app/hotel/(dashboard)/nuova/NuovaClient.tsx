"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeImage } from "../QRCodeImage";

// Brand palette
const C = {
  midnight: "#050B17",
  navy: "#0A1931",
  navyDeep: "#0d2040",
  gold: "#D4B483",          // oro
  champagne: "#F5E9D3",     // oro champagne
  dim: "rgba(245,233,211,0.5)",
  dimMore: "rgba(245,233,211,0.35)",
  border: "rgba(212,180,131,0.18)",
  borderHover: "rgba(212,180,131,0.4)",
  borderFocus: "rgba(212,180,131,0.6)",
  input: "rgba(255,255,255,0.04)",
  err: "rgba(220,38,38,0.1)",
  errBorder: "rgba(220,38,38,0.3)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: C.dimMore,
  marginBottom: 7,
  fontWeight: 600,
};

type SuccessData = { id: string; token: string };

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: copied
          ? "rgba(34,197,94,0.1)"
          : hover
          ? "rgba(212,180,131,0.12)"
          : "rgba(212,180,131,0.06)",
        border: `1px solid ${copied ? "rgba(34,197,94,0.35)" : hover ? C.borderHover : C.border}`,
        color: copied ? "#4ade80" : C.gold,
        borderRadius: 8,
        padding: "10px 18px",
        fontSize: 11,
        cursor: "pointer",
        transition: "all 0.18s ease",
        flexShrink: 0,
        whiteSpace: "nowrap",
        fontWeight: 600,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copiato
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          Copia link
        </>
      )}
    </button>
  );
}

export default function NuovaClient({ siteUrl }: { siteUrl: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    guest_name: "",
    arrival: "",
    departure: "",
    room_label: "",
    party_size: "1",
    source: "direct",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [hoverSubmit, setHoverSubmit] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function inputStyle(name: string): React.CSSProperties {
    const isFocused = focused === name;
    return {
      background: isFocused ? "rgba(212,180,131,0.04)" : C.input,
      border: `1px solid ${isFocused ? C.borderFocus : C.border}`,
      color: C.champagne,
      borderRadius: 8,
      padding: "11px 14px",
      width: "100%",
      fontSize: 14,
      outline: "none",
      boxSizing: "border-box" as const,
      transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
      boxShadow: isFocused ? "0 0 0 3px rgba(212,180,131,0.07)" : "none",
      lineHeight: 1.4,
    };
  }

  const fp = (name: string) => ({
    onFocus: () => setFocused(name),
    onBlur: () => setFocused(null),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hotel/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          party_size: parseInt(form.party_size, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msgs: Record<string, string> = {
          missing_fields: "Compila tutti i campi obbligatori.",
          invalid_dates: "La data di partenza deve essere successiva all'arrivo.",
          no_hotel: "Nessun hotel associato a questo account.",
        };
        throw new Error(msgs[data.error] ?? "Errore imprevisto.");
      }
      setSuccess({ id: data.id, token: data.token });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const checkInUrl = `${siteUrl}/s/${success.token}`;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
        {/* Success header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.1)",
              border: "1.5px solid rgba(34,197,94,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: 28,
                fontWeight: 300,
                color: C.champagne,
                margin: "0 0 4px",
                letterSpacing: "0.02em",
              }}
            >
              Prenotazione creata
            </h2>
            <p style={{ fontSize: 13, color: C.dim, margin: 0, lineHeight: 1.5 }}>
              Invia il link o il QR code all&apos;ospite prima dell&apos;arrivo
            </p>
          </div>
        </div>

        {/* QR + link card */}
        <div
          style={{
            background: `linear-gradient(145deg, ${C.navyDeep} 0%, ${C.navy} 100%)`,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            boxShadow: "0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,180,131,0.06)",
          }}
        >
          {/* QR — generato lato client, nessun servizio esterno */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div
              style={{
                padding: 14,
                background: C.champagne,
                borderRadius: 12,
                boxShadow: "0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,180,131,0.2)",
                lineHeight: 0,
              }}
            >
              <QRCodeImage url={checkInUrl} size={200} />
            </div>
            <p style={{ fontSize: 10, color: C.dimMore, margin: 0, textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              QR check-in ospite
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.border}, transparent)` }} />

          {/* URL */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 8 }}>Link check-in</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  flex: 1,
                  padding: "10px 13px",
                  background: "rgba(0,0,0,0.2)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                  color: C.dim,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "monospace",
                  letterSpacing: "0.01em",
                }}
                title={checkInUrl}
              >
                {checkInUrl}
              </div>
              <CopyButton url={checkInUrl} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={{
              flex: 1,
              background: C.gold,
              color: C.midnight,
              border: "none",
              borderRadius: 8,
              padding: "13px 24px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
            onClick={() => router.push(`/hotel/r/${success.id}`)}
          >
            Vai al dettaglio
          </button>
          <button
            style={{
              flex: 1,
              background: "transparent",
              border: `1px solid ${C.border}`,
              color: C.dim,
              borderRadius: 8,
              padding: "13px 24px",
              fontSize: 12,
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
            onClick={() => {
              setSuccess(null);
              setForm({ guest_name: "", arrival: "", departure: "", room_label: "", party_size: "1", source: "direct" });
            }}
          >
            Crea un&apos;altra
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes vq-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}
      >
        {error && (
          <div
            style={{
              padding: "13px 16px",
              borderRadius: 8,
              background: C.err,
              border: `1px solid ${C.errBorder}`,
              color: "#fca5a5",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
              lineHeight: 1.4,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <div
          style={{
            background: `linear-gradient(145deg, ${C.navyDeep} 0%, ${C.navy} 100%)`,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 26,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            boxShadow: "0 4px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(212,180,131,0.05)",
          }}
        >
          {/* Nome ospite */}
          <div>
            <label style={labelStyle}>Nome ospite *</label>
            <input
              type="text"
              value={form.guest_name}
              onChange={(e) => set("guest_name", e.target.value)}
              required
              placeholder="Es. Marco Bianchi"
              style={inputStyle("guest_name")}
              {...fp("guest_name")}
            />
          </div>

          {/* Date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Arrivo *</label>
              <input
                type="date"
                value={form.arrival}
                onChange={(e) => set("arrival", e.target.value)}
                required
                style={inputStyle("arrival")}
                {...fp("arrival")}
              />
            </div>
            <div>
              <label style={labelStyle}>Partenza *</label>
              <input
                type="date"
                value={form.departure}
                onChange={(e) => set("departure", e.target.value)}
                required
                style={inputStyle("departure")}
                {...fp("departure")}
              />
            </div>
          </div>

          {/* Camera + Ospiti */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Camera</label>
              <input
                type="text"
                value={form.room_label}
                onChange={(e) => set("room_label", e.target.value)}
                placeholder="Es. 101"
                style={inputStyle("room_label")}
                {...fp("room_label")}
              />
            </div>
            <div>
              <label style={labelStyle}>N° ospiti</label>
              <select
                value={form.party_size}
                onChange={(e) => set("party_size", e.target.value)}
                style={{ ...inputStyle("party_size"), appearance: "none" as const, cursor: "pointer" }}
                {...fp("party_size")}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n} style={{ background: C.navy }}>
                    {n} {n === 1 ? "ospite" : "ospiti"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Canale */}
          <div>
            <label style={labelStyle}>Canale di prenotazione</label>
            <select
              value={form.source}
              onChange={(e) => set("source", e.target.value)}
              style={{ ...inputStyle("source"), appearance: "none" as const, cursor: "pointer" }}
              {...fp("source")}
            >
              <option value="direct" style={{ background: C.navy }}>Diretto</option>
              <option value="ota" style={{ background: C.navy }}>OTA (Booking, Expedia…)</option>
              <option value="other" style={{ background: C.navy }}>Altro</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          onMouseEnter={() => !loading && setHoverSubmit(true)}
          onMouseLeave={() => setHoverSubmit(false)}
          style={{
            background: loading
              ? "rgba(212,180,131,0.45)"
              : hoverSubmit
              ? "#c9a76a"
              : C.gold,
            color: C.midnight,
            border: "none",
            borderRadius: 8,
            padding: "14px 24px",
            fontSize: 12,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
            boxShadow: loading
              ? "none"
              : hoverSubmit
              ? "0 6px 24px rgba(212,180,131,0.32)"
              : "0 4px 16px rgba(212,180,131,0.18)",
            transform: hoverSubmit && !loading ? "translateY(-1px)" : "none",
          }}
        >
          {loading ? (
            <>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: "vq-spin 0.9s linear infinite" }}
              >
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              Creazione in corso…
            </>
          ) : (
            "Crea prenotazione"
          )}
        </button>
      </form>
    </>
  );
}
