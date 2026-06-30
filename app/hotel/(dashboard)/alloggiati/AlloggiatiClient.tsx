"use client";

import { useState } from "react";

const C = {
  midnight: "#050B17",
  navy: "#0A1931",
  gold: "#D4B483",
  champagne: "#F5E9D3",
  dim: "rgba(245,233,211,0.45)",
  border: "rgba(212,180,131,0.18)",
  borderFocus: "rgba(212,180,131,0.6)",
  input: "rgba(255,255,255,0.04)",
};

function toISO(d: Date): string {
  return d.toISOString().substring(0, 10);
}

const PRESETS = [
  { label: "Oggi", getDates: () => { const t = toISO(new Date()); return { from: t, to: t }; } },
  {
    label: "Ultimi 7 giorni",
    getDates: () => {
      const to = new Date();
      const from = new Date(to.getTime() - 6 * 86_400_000);
      return { from: toISO(from), to: toISO(to) };
    },
  },
  {
    label: "Questo mese",
    getDates: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: toISO(from), to: toISO(now) };
    },
  },
  {
    label: "Mese scorso",
    getDates: () => {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last  = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: toISO(first), to: toISO(last) };
    },
  },
];

export default function AlloggiatiClient() {
  const today = toISO(new Date());
  const [from, setFrom] = useState(today);
  const [to, setTo]     = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [hoverBtn, setHoverBtn] = useState(false);

  function inputStyle(name: string): React.CSSProperties {
    const f = focused === name;
    return {
      background: f ? "rgba(212,180,131,0.04)" : C.input,
      border: `1px solid ${f ? C.borderFocus : C.border}`,
      color: C.champagne,
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 14,
      outline: "none",
      width: "100%",
      boxSizing: "border-box" as const,
      transition: "border-color 0.18s ease, box-shadow 0.18s ease",
      boxShadow: f ? "0 0 0 3px rgba(212,180,131,0.07)" : "none",
      colorScheme: "dark" as const,
    };
  }

  async function handleDownload() {
    if (!from || !to || from > to) {
      setError("Verifica le date: la data di inizio deve precedere quella di fine.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hotel/alloggiati?from=${from}&to=${to}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Errore nella generazione del file.");
        return;
      }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `alloggiati_${from}_${to}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Errore di rete. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "linear-gradient(145deg, #0d2040 0%, #0A1931 100%)",
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: "24px 28px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(212,180,131,0.05)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 22 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 9,
            background: "rgba(212,180,131,0.08)",
            border: "1px solid rgba(212,180,131,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(212,180,131,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div>
          <h3
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 20,
              fontWeight: 300,
              color: C.champagne,
              margin: "0 0 3px",
              letterSpacing: "0.02em",
            }}
          >
            Esporta Alloggiati Web
          </h3>
          <p style={{ fontSize: 12, color: "rgba(245,233,211,0.35)", margin: 0, lineHeight: 1.5 }}>
            File .txt in formato Polizia di Stato — solo prenotazioni con check-in completato
          </p>
        </div>
      </div>

      {/* Presets */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => { const d = p.getDates(); setFrom(d.from); setTo(d.to); setError(null); }}
            style={{
              background: "rgba(212,180,131,0.07)",
              border: "1px solid rgba(212,180,131,0.15)",
              borderRadius: 6,
              color: "rgba(245,233,211,0.65)",
              fontSize: 11,
              letterSpacing: "0.05em",
              padding: "5px 12px",
              cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,180,131,0.4)";
              (e.currentTarget as HTMLButtonElement).style.color = C.gold;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,180,131,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(245,233,211,0.65)";
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Date inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <div>
          <label
            style={{
              display: "block",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(245,233,211,0.35)",
              marginBottom: 7,
              fontWeight: 600,
            }}
          >
            Dal
          </label>
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => { setFrom(e.target.value); setError(null); }}
            onFocus={() => setFocused("from")}
            onBlur={() => setFocused(null)}
            style={inputStyle("from")}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(245,233,211,0.35)",
              marginBottom: 7,
              fontWeight: 600,
            }}
          >
            Al
          </label>
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => { setTo(e.target.value); setError(null); }}
            onFocus={() => setFocused("to")}
            onBlur={() => setFocused(null)}
            style={inputStyle("to")}
          />
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.22)",
            color: "#fca5a5",
            fontSize: 13,
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={loading}
        onMouseEnter={() => !loading && setHoverBtn(true)}
        onMouseLeave={() => setHoverBtn(false)}
        style={{
          background: loading ? "rgba(212,180,131,0.45)" : hoverBtn ? "#c9a76a" : C.gold,
          color: C.midnight,
          border: "none",
          borderRadius: 8,
          padding: "11px 22px",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
          boxShadow: loading ? "none" : hoverBtn ? "0 5px 20px rgba(212,180,131,0.28)" : "0 3px 12px rgba(212,180,131,0.15)",
          transform: hoverBtn && !loading ? "translateY(-1px)" : "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {loading ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "vq-spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Generazione…
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Scarica .txt
          </>
        )}
      </button>

      {/* Legal note */}
      <p
        style={{
          fontSize: 11,
          color: "rgba(245,233,211,0.22)",
          margin: "14px 0 0",
          lineHeight: 1.6,
        }}
      >
        I codici ISTAT per comuni/stati esteri sono approssimativi. Verifica il file prima
        della trasmissione tramite il portale Alloggiati Web della Polizia di Stato.
      </p>
    </div>
  );
}
