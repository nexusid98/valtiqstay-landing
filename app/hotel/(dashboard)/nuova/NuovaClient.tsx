"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const C = {
  bg: "#050B17",
  card: "#0A1931",
  border: "rgba(212,180,131,0.18)",
  gold: "#D4B483",
  ivory: "#F5E9D3",
  dim: "rgba(245,233,211,0.55)",
  input: "rgba(255,255,255,0.04)",
  err: "rgba(220,38,38,0.12)",
  errBorder: "rgba(220,38,38,0.3)",
};

const S = {
  input: {
    background: C.input,
    border: `1px solid ${C.border}`,
    color: C.ivory,
    borderRadius: 8,
    padding: "10px 14px",
    width: "100%",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: 11,
    letterSpacing: "0.09em",
    textTransform: "uppercase" as const,
    color: C.dim,
    marginBottom: 6,
  } as React.CSSProperties,
  btnPrimary: {
    background: C.gold,
    color: "#050B17",
    border: "none",
    borderRadius: 8,
    padding: "13px 24px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.04em",
  } as React.CSSProperties,
};

type SuccessData = { id: string; token: string };

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? "rgba(34,197,94,0.12)" : C.input,
        border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : C.border}`,
        color: copied ? "#4ade80" : C.gold,
        borderRadius: 8,
        padding: "9px 18px",
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.2s",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {copied ? "✓ Copiato" : "Copia link"}
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

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

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
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(checkInUrl)}&margin=12&format=png`;

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.12)",
              border: "1.5px solid rgba(34,197,94,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: 26,
                fontWeight: 300,
                color: C.ivory,
                margin: 0,
              }}
            >
              Prenotazione creata
            </h2>
            <p style={{ fontSize: 13, color: C.dim, margin: "2px 0 0" }}>
              Invia il link o il QR all&apos;ospite prima dell&apos;arrivo.
            </p>
          </div>
        </div>

        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* QR code */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="QR check-in"
              width={200}
              height={200}
              style={{ borderRadius: 8, background: "#fff", padding: 4 }}
            />
            <p style={{ fontSize: 12, color: C.dim, margin: 0, textAlign: "center" }}>
              QR da stampare o inviare all&apos;ospite
            </p>
          </div>

          {/* URL + copy */}
          <div>
            <p style={S.label}>Link check-in</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  background: C.input,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 13,
                  color: C.dim,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={checkInUrl}
              >
                {checkInUrl}
              </div>
              <CopyButton url={checkInUrl} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={{ ...S.btnPrimary, flex: 1 }}
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
              fontSize: 15,
              cursor: "pointer",
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
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}
    >
      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            background: C.err,
            border: `1px solid ${C.errBorder}`,
            color: "#fca5a5",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <label style={S.label}>Nome ospite *</label>
          <input
            type="text"
            value={form.guest_name}
            onChange={(e) => set("guest_name", e.target.value)}
            required
            placeholder="Es. Marco Bianchi"
            style={S.input}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={S.label}>Arrivo *</label>
            <input
              type="date"
              value={form.arrival}
              onChange={(e) => set("arrival", e.target.value)}
              required
              style={S.input}
            />
          </div>
          <div>
            <label style={S.label}>Partenza *</label>
            <input
              type="date"
              value={form.departure}
              onChange={(e) => set("departure", e.target.value)}
              required
              style={S.input}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={S.label}>Camera</label>
            <input
              type="text"
              value={form.room_label}
              onChange={(e) => set("room_label", e.target.value)}
              placeholder="Es. Camera 101"
              style={S.input}
            />
          </div>
          <div>
            <label style={S.label}>N° ospiti</label>
            <select
              value={form.party_size}
              onChange={(e) => set("party_size", e.target.value)}
              style={{ ...S.input, appearance: "none" as const }}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n} style={{ background: "#0A1931" }}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={S.label}>Canale</label>
          <select
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            style={{ ...S.input, appearance: "none" as const }}
          >
            <option value="direct" style={{ background: "#0A1931" }}>Diretto</option>
            <option value="ota" style={{ background: "#0A1931" }}>OTA (Booking, Expedia…)</option>
            <option value="other" style={{ background: "#0A1931" }}>Altro</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ ...S.btnPrimary, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Creazione…" : "Crea prenotazione"}
      </button>
    </form>
  );
}
