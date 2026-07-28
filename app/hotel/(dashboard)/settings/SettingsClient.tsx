"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SettingsForm = {
  name: string;
  checkin_time: string;
  checkout_time: string;
  tourist_tax_per_person_night: number;
  tourist_tax_max_nights: number;
  inclusi: string[];
  location: string;
  wifi_rete: string;
  wifi_password: string;
  concierge_tel: string;
  concierge_orari: string;
};

const C = {
  gold: "#D4B483",
  champagne: "#F5E9D3",
  midnight: "#050B17",
  border: "rgba(212,180,131,0.18)",
  borderFocus: "rgba(212,180,131,0.55)",
  input: "rgba(255,255,255,0.04)",
  card: "linear-gradient(145deg, #0d2040 0%, #0A1931 100%)",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontFamily: "var(--font-cormorant)",
        fontSize: 20,
        fontWeight: 300,
        color: C.champagne,
        margin: "0 0 18px",
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </h3>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "rgba(245,233,211,0.4)",
        marginBottom: 7,
        fontWeight: 600,
      }}
    >
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  step,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
}) {
  const [f, setF] = useState(false);
  return (
    <input
      type={type}
      value={value}
      step={step}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
      style={{
        width: "100%",
        background: f ? "rgba(212,180,131,0.04)" : C.input,
        border: `1px solid ${f ? C.borderFocus : C.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        color: C.champagne,
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box" as const,
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
        boxShadow: f ? "0 0 0 3px rgba(212,180,131,0.07)" : "none",
        colorScheme: "dark" as const,
      }}
    />
  );
}

export default function SettingsClient({
  initial,
}: {
  hotelId: string;
  initial: SettingsForm;
}) {
  const [form, setForm] = useState<SettingsForm>(initial);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function set<K extends keyof SettingsForm>(key: K) {
    return (v: string) => {
      setForm((f) => ({
        ...f,
        [key]:
          key === "tourist_tax_per_person_night"
            ? Number(v) || 0
            : key === "tourist_tax_max_nights"
            ? parseInt(v, 10) || 0
            : v,
      }));
      setSaved(false);
      setError(null);
    };
  }

  function addItem() {
    const item = newItem.trim();
    if (!item) return;
    setForm((f) => ({ ...f, inclusi: [...f.inclusi, item] }));
    setNewItem("");
    setSaved(false);
  }

  function removeItem(i: number) {
    setForm((f) => ({ ...f, inclusi: f.inclusi.filter((_, idx) => idx !== i) }));
    setSaved(false);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Il nome dell'hotel è obbligatorio.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/hotel/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          checkin_time: form.checkin_time,
          checkout_time: form.checkout_time,
          tourist_tax_per_person_night: form.tourist_tax_per_person_night,
          tourist_tax_max_nights: form.tourist_tax_max_nights,
          welcome_info: {
            inclusi: form.inclusi,
            location: form.location,
            wifi_rete: form.wifi_rete,
            wifi_password: form.wifi_password,
            concierge_tel: form.concierge_tel,
            concierge_orari: form.concierge_orari,
          },
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error === "name_required" ? "Il nome è obbligatorio." : "Errore nel salvataggio. Riprova.");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 14,
    padding: "24px 28px",
    boxShadow: "0 4px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(212,180,131,0.05)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* General */}
      <div style={cardStyle}>
        <SectionTitle>Dati generali</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <Label>Nome hotel *</Label>
            <Input value={form.name} onChange={set("name")} placeholder="Hotel Leon d'Oro" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>Orario check-in</Label>
              <Input type="time" value={form.checkin_time} onChange={set("checkin_time")} />
            </div>
            <div>
              <Label>Orario check-out</Label>
              <Input type="time" value={form.checkout_time} onChange={set("checkout_time")} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>Tassa di soggiorno (€/pers./notte)</Label>
              <Input type="number" step="0.50" value={form.tourist_tax_per_person_night} onChange={set("tourist_tax_per_person_night")} placeholder="0.00" />
            </div>
            <div>
              <Label>Max notti tassabili</Label>
              <Input type="number" value={form.tourist_tax_max_nights} onChange={set("tourist_tax_max_nights")} placeholder="0" />
            </div>
          </div>
        </div>
      </div>

      {/* Wi-Fi & Concierge */}
      <div style={cardStyle}>
        <SectionTitle>Wi-Fi e Concierge</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>Nome rete Wi-Fi</Label>
              <Input value={form.wifi_rete} onChange={set("wifi_rete")} placeholder="HotelGuest" />
            </div>
            <div>
              <Label>Password Wi-Fi</Label>
              <Input value={form.wifi_password} onChange={set("wifi_password")} placeholder="••••••••" />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <Label>Telefono concierge</Label>
              <Input value={form.concierge_tel} onChange={set("concierge_tel")} placeholder="+39 0464 …" />
            </div>
            <div>
              <Label>Orari concierge</Label>
              <Input value={form.concierge_orari} onChange={set("concierge_orari")} placeholder="07:00–23:00" />
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div style={cardStyle}>
        <SectionTitle>Posizione e servizi inclusi</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <Label>Descrizione posizione</Label>
            <Input value={form.location} onChange={set("location")} placeholder="5 min a piedi dalla stazione · centro storico · …" />
          </div>

          <div>
            <Label>Servizi inclusi</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
              {form.inclusi.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(212,180,131,0.05)",
                    border: "1px solid rgba(212,180,131,0.12)",
                    borderRadius: 7,
                    padding: "8px 12px",
                  }}
                >
                  <span style={{ flex: 1, fontSize: 13, color: C.champagne }}>{item}</span>
                  <button
                    onClick={() => removeItem(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(220,38,38,0.55)", fontSize: 16, lineHeight: 1, padding: 0, flexShrink: 0 }}
                    aria-label="Rimuovi"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                placeholder="Aggiungi servizio incluso…"
                style={{
                  flex: 1,
                  background: C.input,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "9px 12px",
                  color: C.champagne,
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={addItem}
                style={{
                  background: "rgba(212,180,131,0.1)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: "9px 16px",
                  color: C.gold,
                  fontSize: 13,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                + Aggiungi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error / success */}
      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.22)", color: "#fca5a5", fontSize: 13, display: "flex", gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}
      {saved && !error && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 13, display: "flex", gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Impostazioni salvate con successo.
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: saving ? "rgba(212,180,131,0.45)" : C.gold,
          color: C.midnight,
          border: "none",
          borderRadius: 8,
          padding: "13px 28px",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: saving ? "not-allowed" : "pointer",
          alignSelf: "flex-start",
          transition: "background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
          boxShadow: saving ? "none" : "0 3px 12px rgba(212,180,131,0.2)",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {saving ? (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "vq-spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Salvataggio…
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            Salva impostazioni
          </>
        )}
      </button>
    </div>
  );
}
