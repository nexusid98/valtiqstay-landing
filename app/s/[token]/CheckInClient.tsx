"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Hotel = {
  name: string;
  logo_url: string | null;
  checkin_time: string;
  checkout_time: string;
  tourist_tax_per_person_night: number;
  tourist_tax_max_nights: number;
  welcome_info: {
    inclusi?: string[];
    location?: string;
    wifi?: { rete: string; password: string };
    concierge?: { telefono: string; orari: string };
  };
};

type Upsell = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
};

type Reservation = {
  id: string;
  guest_name: string;
  arrival: string;
  departure: string;
  room_label: string | null;
  party_size: number;
  status: string;
};

type GuestForm = {
  first_name: string;
  last_name: string;
  dob: string;
  sex: string;
  citizenship: string;
  birth_place: string;
  birth_country: string;
  residence_place: string;
  residence_country: string;
  document_type: string;
  document_number: string;
  document_issue_place: string;
  document_issue_date: string;
  document_expiry_date: string;
};

// ── Brand palette ─────────────────────────────────────────────────────────────

const C = {
  midnight: "#050B17",
  navy: "#0A1931",
  navyDeep: "#0d2040",
  gold: "#D4B483",
  champagne: "#F5E9D3",
  dim: "rgba(245,233,211,0.5)",
  dimMore: "rgba(245,233,211,0.33)",
  border: "rgba(212,180,131,0.18)",
  borderFocus: "rgba(212,180,131,0.6)",
  input: "rgba(255,255,255,0.04)",
  err: "rgba(220,38,38,0.1)",
  errBorder: "rgba(220,38,38,0.28)",
};

// ── Shared style constants ────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: `linear-gradient(145deg, ${C.navyDeep} 0%, ${C.navy} 100%)`,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: 22,
  boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(212,180,131,0.05)",
};

const eyebrow: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: C.gold,
  margin: 0,
  fontWeight: 600,
};

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-cormorant)",
  fontSize: 30,
  fontWeight: 300,
  margin: "8px 0 0",
  lineHeight: 1.15,
  color: C.champagne,
  letterSpacing: "0.01em",
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

const inputBase: React.CSSProperties = {
  background: C.input,
  border: `1px solid ${C.border}`,
  color: C.champagne,
  borderRadius: 8,
  padding: "11px 14px",
  width: "100%",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
  lineHeight: 1.4,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const BLANK_GUEST: GuestForm = {
  first_name: "",
  last_name: "",
  dob: "",
  sex: "",
  citizenship: "Italia",
  birth_place: "",
  birth_country: "Italia",
  residence_place: "",
  residence_country: "Italia",
  document_type: "carta_identita",
  document_number: "",
  document_issue_place: "",
  document_issue_date: "",
  document_expiry_date: "",
};

const DOC_TYPES = [
  { value: "carta_identita", label: "Carta d'identità" },
  { value: "passaporto", label: "Passaporto" },
  { value: "patente", label: "Patente di guida" },
  { value: "permesso_soggiorno", label: "Permesso di soggiorno" },
];

function fmtDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function nightsBetween(a: string, d: string) {
  return Math.round(
    (new Date(d).getTime() - new Date(a).getTime()) / 86_400_000
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function CheckInClient({
  token,
  reservation,
  hotel,
  upsells,
}: {
  token: string;
  reservation: Reservation;
  hotel: Hotel | null;
  upsells: Upsell[];
}) {
  if (reservation.status === "checked_in") {
    return <AlreadyDone hotelName={hotel?.name} />;
  }
  return (
    <Flow token={token} reservation={reservation} hotel={hotel} upsells={upsells} />
  );
}

// ── Multi-step flow ───────────────────────────────────────────────────────────

const STEP_LABELS = ["Ospiti", "Documento", "Servizi", "Contatti"];

function Flow({
  token,
  reservation,
  hotel,
  upsells,
}: {
  token: string;
  reservation: Reservation;
  hotel: Hotel | null;
  upsells: Upsell[];
}) {
  const nights = nightsBetween(reservation.arrival, reservation.departure);
  const taxNights = hotel ? Math.min(nights, hotel.tourist_tax_max_nights) : 0;
  const totalTax = hotel
    ? taxNights * reservation.party_size * hotel.tourist_tax_per_person_night
    : 0;

  const [step, setStep] = useState(0);
  const [guestForms, setGuestForms] = useState<GuestForm[]>(
    Array.from({ length: reservation.party_size }, () => ({ ...BLANK_GUEST }))
  );
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(path: string, body: unknown, isForm = false) {
    const res = await fetch(`/api/s/${token}/${path}`, {
      method: "POST",
      ...(isForm
        ? { body: body as FormData }
        : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error((j.error as string | undefined) ?? "Errore imprevisto");
    }
    return res.json();
  }

  async function submitGuests() {
    for (let i = 0; i < guestForms.length; i++) {
      const g = guestForms[i];
      if (!g.first_name.trim() || !g.last_name.trim()) {
        setError(`Inserisci nome e cognome per l'ospite ${i + 1}`);
        return;
      }
    }
    setError(null);
    setLoading(true);
    try {
      await post("guests", guestForms);
      setStep(2);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function submitDoc() {
    if (!docFile) { setStep(3); return; }
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", docFile);
      form.append("guest_index", "0");
      await post("document", form, true);
      setStep(3);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function submitUpsells() {
    setError(null);
    setLoading(true);
    try {
      const orders = Object.entries(selected)
        .filter(([, q]) => q > 0)
        .map(([upsell_id, quantity]) => ({ upsell_id, quantity }));
      await post("upsell", orders);
      setStep(4);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function submitContact() {
    setError(null);
    setLoading(true);
    try {
      await post("contact", {
        email: email.trim() || null,
        phone: phone.trim() || null,
        marketing_consent: marketing,
      });
      await post("complete", {});
      setStep(5);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const upsellTotal = Object.entries(selected).reduce((sum, [id, qty]) => {
    const u = upsells.find((u) => u.id === id);
    return sum + (u ? u.price * qty : 0);
  }, 0);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.midnight, color: C.champagne }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          height: 58,
          borderBottom: `1px solid ${C.border}`,
          position: "sticky",
          top: 0,
          background: "rgba(5,11,23,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 10,
          boxShadow: "0 1px 0 rgba(212,180,131,0.07), 0 4px 24px rgba(0,0,0,0.25)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 20,
            fontWeight: 300,
            letterSpacing: "0.18em",
            color: C.gold,
            textTransform: "uppercase",
          }}
        >
          {hotel?.name ?? "ValtiqStay"}
        </span>

        {/* Step progress */}
        {step > 0 && step < 5 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {STEP_LABELS.map((label, i) => {
              const s = i + 1;
              const done = s < step;
              const active = s === step;
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div
                      style={{
                        width: active ? 28 : 20,
                        height: 3,
                        borderRadius: 2,
                        background: done || active ? C.gold : "rgba(212,180,131,0.15)",
                        transition: "all 0.35s ease",
                        boxShadow: active ? "0 0 6px rgba(212,180,131,0.4)" : "none",
                      }}
                    />
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div style={{ width: 4, height: 1, background: "rgba(212,180,131,0.1)" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 16px 56px" }}>
        <div style={{ width: "100%", maxWidth: 520 }}>
          {error && (
            <div
              style={{
                marginBottom: 18,
                padding: "12px 16px",
                borderRadius: 8,
                background: C.err,
                border: `1px solid ${C.errBorder}`,
                color: "#fca5a5",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 9,
                lineHeight: 1.4,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {step === 0 && (
            <WelcomeStep reservation={reservation} hotel={hotel} nights={nights} totalTax={totalTax} onStart={() => setStep(1)} />
          )}
          {step === 1 && (
            <GuestsStep forms={guestForms} onChange={setGuestForms} loading={loading} onSubmit={submitGuests} />
          )}
          {step === 2 && (
            <DocumentStep
              preview={docPreview}
              onFileChange={(f) => {
                setDocFile(f);
                if (f) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setDocPreview(ev.target?.result as string);
                  reader.readAsDataURL(f);
                } else {
                  setDocPreview(null);
                }
              }}
              loading={loading}
              onSubmit={submitDoc}
              onSkip={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <UpsellStep
              upsells={upsells}
              selected={selected}
              total={upsellTotal}
              onToggle={(id) =>
                setSelected((prev) => {
                  if (prev[id]) { const next = { ...prev }; delete next[id]; return next; }
                  return { ...prev, [id]: 1 };
                })
              }
              loading={loading}
              onSubmit={submitUpsells}
            />
          )}
          {step === 4 && (
            <ContactStep
              email={email}
              phone={phone}
              marketing={marketing}
              setEmail={setEmail}
              setPhone={setPhone}
              setMarketing={setMarketing}
              loading={loading}
              onSubmit={submitContact}
            />
          )}
          {step === 5 && <DoneStep hotel={hotel} reservation={reservation} />}
        </div>
      </main>
    </div>
  );
}

// ── Step 0: Welcome ───────────────────────────────────────────────────────────

function WelcomeStep({
  reservation,
  hotel,
  nights,
  totalTax,
  onStart,
}: {
  reservation: Reservation;
  hotel: Hotel | null;
  nights: number;
  totalTax: number;
  onStart: () => void;
}) {
  const [hover, setHover] = useState(false);
  const wi = hotel?.welcome_info;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <p style={eyebrow}>Benvenuto</p>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 42,
            fontWeight: 300,
            margin: "8px 0 0",
            lineHeight: 1.08,
            color: C.champagne,
            letterSpacing: "0.01em",
          }}
        >
          {reservation.guest_name}
        </h1>
        {/* Ornamental separator */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, marginBottom: 4 }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(212,180,131,0.3)" }} />
        </div>
      </div>

      {/* Booking card */}
      <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 14 }}>
        <InfoRow label="Check-in" value={fmtDate(reservation.arrival)} highlight />
        <InfoRow label="Check-out" value={fmtDate(reservation.departure)} highlight />
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 11 }}>
          <InfoRow label="Notti" value={String(nights)} />
          {reservation.room_label && <InfoRow label="Camera" value={reservation.room_label} />}
          <InfoRow label="Ospiti" value={String(reservation.party_size)} />
          {totalTax > 0 && (
            <InfoRow label="Tassa di soggiorno" value={`€ ${totalTax.toFixed(2)}`} dim />
          )}
        </div>
      </div>

      {/* Inclusi */}
      {wi?.inclusi && wi.inclusi.length > 0 && (
        <div style={cardStyle}>
          <p style={{ ...labelStyle, marginBottom: 12 }}>Incluso nel soggiorno</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {wi.inclusi.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.gold, flexShrink: 0, marginTop: 6, opacity: 0.7 }} />
                <p style={{ fontSize: 14, color: C.champagne, margin: 0, lineHeight: 1.55 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <PrimaryButton onClick={onStart} hover={hover} setHover={setHover}>
        Inizia il check-in
      </PrimaryButton>
    </div>
  );
}

// ── Step 1: Guests ────────────────────────────────────────────────────────────

function GuestsStep({
  forms,
  onChange,
  loading,
  onSubmit,
}: {
  forms: GuestForm[];
  onChange: (g: GuestForm[]) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  const [hover, setHover] = useState(false);

  function update(i: number, field: keyof GuestForm, value: string) {
    onChange(forms.map((g, idx) => (idx === i ? { ...g, [field]: value } : g)));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <p style={eyebrow}>Passo 1 di 4</p>
        <h2 style={h2Style}>Dati degli ospiti</h2>
      </div>

      {forms.map((g, i) => (
        <div key={i} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 15 }}>
          {forms.length > 1 && (
            <p style={{ fontSize: 10, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>
              Ospite {i + 1}{i === 0 ? " — Intestatario" : ""}
            </p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Nome *" value={g.first_name} onChange={(v) => update(i, "first_name", v)} />
            <FormField label="Cognome *" value={g.last_name} onChange={(v) => update(i, "last_name", v)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Data di nascita" value={g.dob} type="date" onChange={(v) => update(i, "dob", v)} />
            <FormSelect
              label="Sesso"
              value={g.sex}
              options={[
                { value: "", label: "—" },
                { value: "M", label: "Maschile" },
                { value: "F", label: "Femminile" },
              ]}
              onChange={(v) => update(i, "sex", v)}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Comune di nascita" value={g.birth_place} onChange={(v) => update(i, "birth_place", v)} />
            <FormField label="Stato di nascita" value={g.birth_country} onChange={(v) => update(i, "birth_country", v)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Comune di residenza" value={g.residence_place} onChange={(v) => update(i, "residence_place", v)} />
            <FormField label="Stato di residenza" value={g.residence_country} onChange={(v) => update(i, "residence_country", v)} />
          </div>
          <FormField label="Cittadinanza" value={g.citizenship} onChange={(v) => update(i, "citizenship", v)} />
          <FormSelect label="Tipo documento" value={g.document_type} options={DOC_TYPES} onChange={(v) => update(i, "document_type", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Numero documento" value={g.document_number} onChange={(v) => update(i, "document_number", v)} />
            <FormField label="Comune emissione" value={g.document_issue_place} onChange={(v) => update(i, "document_issue_place", v)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Data emissione" value={g.document_issue_date} type="date" onChange={(v) => update(i, "document_issue_date", v)} />
            <FormField label="Data scadenza" value={g.document_expiry_date} type="date" onChange={(v) => update(i, "document_expiry_date", v)} />
          </div>
        </div>
      ))}

      <PrimaryButton onClick={onSubmit} loading={loading} hover={hover} setHover={setHover}>
        {loading ? "Salvataggio…" : "Continua"}
      </PrimaryButton>
    </div>
  );
}

// ── Step 2: Document ──────────────────────────────────────────────────────────

function DocumentStep({
  preview,
  onFileChange,
  loading,
  onSubmit,
  onSkip,
}: {
  preview: string | null;
  onFileChange: (f: File | null) => void;
  loading: boolean;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [dropHover, setDropHover] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <p style={eyebrow}>Passo 2 di 4</p>
        <h2 style={h2Style}>Documento d&apos;identità</h2>
        <p style={{ fontSize: 13, color: C.dim, marginTop: 8, lineHeight: 1.65 }}>
          Fotografa il documento dell&apos;ospite principale. Il file è conservato in modo cifrato.
        </p>
      </div>

      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          border: `2px dashed ${preview ? C.gold : dropHover ? "rgba(212,180,131,0.45)" : C.border}`,
          borderRadius: 14,
          padding: 36,
          cursor: "pointer",
          background: dropHover ? "rgba(212,180,131,0.04)" : C.input,
          position: "relative",
          overflow: "hidden",
          minHeight: 200,
          transition: "border-color 0.2s ease, background 0.2s ease",
        }}
        onMouseEnter={() => setDropHover(true)}
        onMouseLeave={() => setDropHover(false)}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Anteprima documento"
            style={{ maxHeight: 220, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }}
          />
        ) : (
          <>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(212,180,131,0.07)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, color: C.champagne, margin: "0 0 4px", fontWeight: 500 }}>
                Tocca per fotografare
              </p>
              <p style={{ fontSize: 12, color: C.dim, margin: 0 }}>
                o seleziona un file (JPG, PNG, HEIC)
              </p>
            </div>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </label>

      {preview && (
        <button
          onClick={() => onFileChange(null)}
          style={{
            background: "transparent",
            color: C.dim,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "11px 24px",
            fontSize: 13,
            cursor: "pointer",
            width: "100%",
            transition: "color 0.15s ease, border-color 0.15s ease",
          }}
        >
          Rimuovi immagine
        </button>
      )}

      <PrimaryButton onClick={onSubmit} loading={loading} hover={hover} setHover={setHover}>
        {loading ? "Caricamento…" : preview ? "Carica e continua" : "Salta"}
      </PrimaryButton>
    </div>
  );
}

// ── Step 3: Upsells ───────────────────────────────────────────────────────────

function UpsellStep({
  upsells,
  selected,
  total,
  onToggle,
  loading,
  onSubmit,
}: {
  upsells: Upsell[];
  selected: Record<string, number>;
  total: number;
  onToggle: (id: string) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <p style={eyebrow}>Passo 3 di 4</p>
        <h2 style={h2Style}>Aggiunte al soggiorno</h2>
        <p style={{ fontSize: 13, color: C.dim, marginTop: 8, lineHeight: 1.6 }}>
          Personalizza la tua esperienza. Puoi saltare questo passo.
        </p>
      </div>

      {upsells.length === 0 ? (
        <p style={{ fontSize: 14, color: C.dim, padding: "20px 0" }}>
          Nessun servizio aggiuntivo disponibile.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {upsells.map((u) => {
            const on = !!selected[u.id];
            const hovered = hoveredCard === u.id;
            return (
              <button
                key={u.id}
                onClick={() => onToggle(u.id)}
                onMouseEnter={() => setHoveredCard(u.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: 12,
                  border: `1px solid ${on ? C.gold : hovered ? "rgba(212,180,131,0.35)" : C.border}`,
                  background: on
                    ? "rgba(212,180,131,0.08)"
                    : hovered
                    ? "rgba(212,180,131,0.04)"
                    : `linear-gradient(145deg, ${C.navyDeep} 0%, ${C.navy} 100%)`,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  gap: 14,
                  boxShadow: on ? "0 0 0 1px rgba(212,180,131,0.08)" : "none",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: C.champagne, margin: "0 0 3px", fontWeight: 500 }}>{u.name}</p>
                  {u.description && (
                    <p style={{ fontSize: 12, color: C.dim, margin: 0, lineHeight: 1.5 }}>{u.description}</p>
                  )}
                  <p style={{ fontSize: 11, color: C.dimMore, margin: "4px 0 0", letterSpacing: "0.04em", textTransform: "uppercase" }}>{u.category}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 15, color: C.gold, fontWeight: 600 }}>€ {u.price.toFixed(2)}</span>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: `1.5px solid ${on ? C.gold : C.dim}`,
                      background: on ? C.gold : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    {on && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#050B17" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {total > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "14px 0",
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <span style={{ fontSize: 13, color: C.dim }}>Totale extra</span>
          <span style={{ fontSize: 18, color: C.gold, fontWeight: 600, fontFamily: "var(--font-cormorant)" }}>
            € {total.toFixed(2)}
          </span>
        </div>
      )}

      <PrimaryButton onClick={onSubmit} loading={loading} hover={hover} setHover={setHover}>
        {loading ? "Salvataggio…" : total > 0 ? "Aggiungi e continua" : "Continua"}
      </PrimaryButton>
    </div>
  );
}

// ── Step 4: Contact ───────────────────────────────────────────────────────────

function ContactStep({
  email, phone, marketing, setEmail, setPhone, setMarketing, loading, onSubmit,
}: {
  email: string; phone: string; marketing: boolean;
  setEmail: (v: string) => void; setPhone: (v: string) => void; setMarketing: (v: boolean) => void;
  loading: boolean; onSubmit: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <p style={eyebrow}>Passo 4 di 4</p>
        <h2 style={h2Style}>Contatti</h2>
        <p style={{ fontSize: 13, color: C.dim, marginTop: 8, lineHeight: 1.65 }}>
          Facoltativo. Ci permettono di inviarti informazioni utili sul soggiorno.
        </p>
      </div>

      <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 15 }}>
        <FormField label="Email" value={email} type="email" onChange={setEmail} />
        <FormField label="Telefono" value={phone} type="tel" onChange={setPhone} />

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            cursor: "pointer",
            paddingTop: 14,
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              border: `1.5px solid ${marketing ? C.gold : C.border}`,
              background: marketing ? C.gold : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
              transition: "all 0.18s ease",
              cursor: "pointer",
            }}
            onClick={() => setMarketing(!marketing)}
          >
            {marketing && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#050B17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            style={{ display: "none" }}
          />
          <span style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>
            Acconsento a ricevere comunicazioni da{" "}
            <span style={{ color: C.champagne }}>ValtiqStay</span>. Revocabile in qualsiasi momento.
          </span>
        </label>
      </div>

      <p style={{ fontSize: 12, color: C.dimMore, lineHeight: 1.65, margin: 0 }}>
        I tuoi dati sono trattati ai sensi del GDPR. Consulta la nostra{" "}
        <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: C.gold, textDecoration: "underline" }}>
          informativa sulla privacy
        </a>
        .
      </p>

      <PrimaryButton onClick={onSubmit} loading={loading} hover={hover} setHover={setHover}>
        {loading ? "Completamento…" : "Completa il check-in"}
      </PrimaryButton>
    </div>
  );
}

// ── Step 5: Done ──────────────────────────────────────────────────────────────

function DoneStep({ hotel, reservation }: { hotel: Hotel | null; reservation: Reservation }) {
  const wi = hotel?.welcome_info;
  const firstName = reservation.guest_name.split(" ")[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
        {/* Gold circle check */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(212,180,131,0.08)",
            border: `1.5px solid ${C.gold}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 22px",
            boxShadow: "0 0 32px rgba(212,180,131,0.12)",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 40,
            fontWeight: 300,
            margin: "0 0 8px",
            color: C.champagne,
            letterSpacing: "0.01em",
          }}
        >
          Check-in completato
        </h2>
        <p style={{ fontSize: 15, color: C.dim, margin: 0, lineHeight: 1.5 }}>
          Benvenuto, {firstName}. Ti aspettiamo all&apos;arrivo.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px auto 0", maxWidth: 180 }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.border})` }} />
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(212,180,131,0.3)" }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
        </div>
      </div>

      {(wi?.wifi || wi?.concierge || wi?.location) && (
        <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ ...labelStyle, margin: "0 0 4px" }}>Informazioni utili</p>
          {wi?.location && <InfoRow label="Come raggiungerci" value={wi.location} />}
          {wi?.wifi && (
            <>
              <InfoRow label="Wi-Fi" value={wi.wifi.rete} />
              <InfoRow label="Password" value={wi.wifi.password} mono />
            </>
          )}
          {wi?.concierge && (
            <>
              <InfoRow label="Concierge" value={wi.concierge.telefono} />
              <InfoRow label="Orari" value={wi.concierge.orari} />
            </>
          )}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <InfoRow label="Check-in ore" value={hotel?.checkin_time ?? ""} highlight />
            <InfoRow label="Check-out ore" value={hotel?.checkout_time ?? ""} highlight />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Already done ──────────────────────────────────────────────────────────────

function AlreadyDone({ hotelName }: { hotelName?: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(ellipse at 50% 0%, rgba(13,32,64,0.8) 0%, ${C.midnight} 70%)`,
        color: C.champagne,
        padding: 32,
        textAlign: "center",
        gap: 18,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 22,
          fontWeight: 300,
          letterSpacing: "0.2em",
          color: C.gold,
          textTransform: "uppercase",
        }}
      >
        {hotelName ?? "ValtiqStay"}
      </span>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(212,180,131,0.07)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 32,
          fontWeight: 300,
          margin: 0,
          color: C.champagne,
        }}
      >
        Check-in già completato
      </h1>
      <p style={{ fontSize: 14, color: C.dim, maxWidth: 320, lineHeight: 1.65, margin: 0 }}>
        La prenotazione risulta già registrata. Ci vediamo all&apos;arrivo!
      </p>
    </div>
  );
}

// ── Shared UI primitives ──────────────────────────────────────────────────────

function PrimaryButton({
  children,
  onClick,
  loading,
  hover,
  setHover,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  hover: boolean;
  setHover: (v: boolean) => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => !loading && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: loading ? "rgba(212,180,131,0.45)" : hover ? "#c9a76a" : C.gold,
        color: C.midnight,
        border: "none",
        borderRadius: 9,
        padding: "15px 24px",
        fontSize: 12,
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        width: "100%",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        transition: "background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
        boxShadow: loading ? "none" : hover ? "0 6px 24px rgba(212,180,131,0.3)" : "0 4px 16px rgba(212,180,131,0.18)",
        transform: hover && !loading ? "translateY(-1px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function InfoRow({
  label,
  value,
  dim,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  dim?: boolean;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 14 }}>
      <span style={{ fontSize: 12, color: C.dimMore, flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          color: highlight ? C.gold : dim ? C.dim : C.champagne,
          fontWeight: highlight ? 600 : dim ? 400 : 500,
          textAlign: "right",
          fontFamily: mono ? "monospace" : undefined,
          letterSpacing: mono ? "0.05em" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function FormField({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputBase,
          borderColor: focused ? C.borderFocus : C.border,
          boxShadow: focused ? "0 0 0 3px rgba(212,180,131,0.07)" : "none",
          background: focused ? "rgba(212,180,131,0.04)" : C.input,
        }}
      />
    </div>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputBase,
          appearance: "none" as const,
          cursor: "pointer",
          borderColor: focused ? C.borderFocus : C.border,
          boxShadow: focused ? "0 0 0 3px rgba(212,180,131,0.07)" : "none",
          background: focused ? "rgba(212,180,131,0.04)" : C.input,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: C.navy }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
