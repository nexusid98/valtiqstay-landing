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
  document_type: string;
  document_number: string;
};

// ── Design tokens ─────────────────────────────────────────────────────────────

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

// ── Shared style helpers ──────────────────────────────────────────────────────

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
    textTransform: "uppercase",
    color: C.dim,
    marginBottom: 6,
  } as React.CSSProperties,

  btnPrimary: {
    background: C.gold,
    color: "#050B17",
    border: "none",
    borderRadius: 8,
    padding: "14px 24px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    letterSpacing: "0.04em",
  } as React.CSSProperties,

  btnGhost: {
    background: "transparent",
    color: C.dim,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: "12px 24px",
    fontSize: 14,
    cursor: "pointer",
    width: "100%",
  } as React.CSSProperties,

  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: 24,
  } as React.CSSProperties,

  eyebrow: {
    fontSize: 12,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: C.gold,
    marginBottom: 8,
    margin: 0,
  } as React.CSSProperties,

  h2: {
    fontFamily: "var(--font-cormorant)",
    fontSize: 30,
    fontWeight: 300,
    margin: "8px 0 0",
    lineHeight: 1.15,
    color: C.ivory,
  } as React.CSSProperties,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const BLANK_GUEST: GuestForm = {
  first_name: "",
  last_name: "",
  dob: "",
  sex: "",
  citizenship: "IT",
  birth_place: "",
  document_type: "carta_identita",
  document_number: "",
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

// ── Root component ────────────────────────────────────────────────────────────

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
    <Flow
      token={token}
      reservation={reservation}
      hotel={hotel}
      upsells={upsells}
    />
  );
}

// ── Multi-step flow ───────────────────────────────────────────────────────────

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
        : {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        color: C.ivory,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 20,
            fontWeight: 300,
            letterSpacing: "0.15em",
            color: C.gold,
          }}
        >
          {hotel?.name ?? "ValtiqStay"}
        </span>
        {step > 0 && step < 5 && (
          <div style={{ display: "flex", gap: 5 }}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  height: 3,
                  width: 28,
                  borderRadius: 2,
                  background: s <= step ? C.gold : "rgba(212,180,131,0.15)",
                  transition: "background 0.4s",
                }}
              />
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 16px 48px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 520 }}>
          {error && (
            <div
              style={{
                marginBottom: 16,
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

          {step === 0 && (
            <WelcomeStep
              reservation={reservation}
              hotel={hotel}
              nights={nights}
              totalTax={totalTax}
              onStart={() => setStep(1)}
            />
          )}
          {step === 1 && (
            <GuestsStep
              forms={guestForms}
              onChange={setGuestForms}
              loading={loading}
              onSubmit={submitGuests}
            />
          )}
          {step === 2 && (
            <DocumentStep
              preview={docPreview}
              onFileChange={(f) => {
                setDocFile(f);
                if (f) {
                  const reader = new FileReader();
                  reader.onload = (ev) =>
                    setDocPreview(ev.target?.result as string);
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
                  if (prev[id]) {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                  }
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
  const wi = hotel?.welcome_info;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={S.eyebrow}>Benvenuto</p>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 40,
            fontWeight: 300,
            margin: "8px 0 0",
            lineHeight: 1.1,
            color: C.ivory,
          }}
        >
          {reservation.guest_name}
        </h1>
      </div>

      <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 14 }}>
        <InfoRow label="Check-in" value={fmtDate(reservation.arrival)} />
        <InfoRow label="Check-out" value={fmtDate(reservation.departure)} />
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <InfoRow label="Notti" value={String(nights)} />
          {reservation.room_label && (
            <InfoRow label="Camera" value={reservation.room_label} />
          )}
          <InfoRow label="Ospiti" value={String(reservation.party_size)} />
          {totalTax > 0 && (
            <InfoRow
              label="Tassa di soggiorno"
              value={`€ ${totalTax.toFixed(2)}`}
              dim
            />
          )}
        </div>
      </div>

      {wi?.inclusi && wi.inclusi.length > 0 && (
        <div style={S.card}>
          <p style={{ ...S.label, marginBottom: 12 }}>Incluso nel soggiorno</p>
          {wi.inclusi.map((item, i) => (
            <p
              key={i}
              style={{ fontSize: 14, color: C.ivory, margin: "0 0 6px", lineHeight: 1.6 }}
            >
              · {item}
            </p>
          ))}
        </div>
      )}

      <button style={S.btnPrimary} onClick={onStart}>
        Inizia il check-in
      </button>
    </div>
  );
}

// ── Step 1: Guest forms ───────────────────────────────────────────────────────

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
  function update(i: number, field: keyof GuestForm, value: string) {
    onChange(forms.map((g, idx) => (idx === i ? { ...g, [field]: value } : g)));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={S.eyebrow}>Passo 1 di 4</p>
        <h2 style={S.h2}>Dati degli ospiti</h2>
      </div>

      {forms.map((g, i) => (
        <div key={i} style={{ ...S.card, display: "flex", flexDirection: "column", gap: 14 }}>
          {forms.length > 1 && (
            <p
              style={{
                fontSize: 12,
                color: C.gold,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Ospite {i + 1}{i === 0 ? " — Intestatario" : ""}
            </p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Nome *" value={g.first_name} onChange={(v) => update(i, "first_name", v)} />
            <FormField label="Cognome *" value={g.last_name} onChange={(v) => update(i, "last_name", v)} />
          </div>
          <FormField label="Data di nascita" value={g.dob} type="date" onChange={(v) => update(i, "dob", v)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
            <FormField label="Cittadinanza" value={g.citizenship} onChange={(v) => update(i, "citizenship", v)} />
          </div>
          <FormField label="Luogo di nascita" value={g.birth_place} onChange={(v) => update(i, "birth_place", v)} />
          <FormSelect
            label="Tipo documento"
            value={g.document_type}
            options={DOC_TYPES}
            onChange={(v) => update(i, "document_type", v)}
          />
          <FormField label="Numero documento" value={g.document_number} onChange={(v) => update(i, "document_number", v)} />
        </div>
      ))}

      <button
        style={{ ...S.btnPrimary, opacity: loading ? 0.65 : 1 }}
        disabled={loading}
        onClick={onSubmit}
      >
        {loading ? "Salvataggio…" : "Continua"}
      </button>
    </div>
  );
}

// ── Step 2: Document upload ───────────────────────────────────────────────────

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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={S.eyebrow}>Passo 2 di 4</p>
        <h2 style={S.h2}>Documento d&apos;identità</h2>
        <p style={{ fontSize: 14, color: C.dim, marginTop: 8, lineHeight: 1.6 }}>
          Fotografa il documento dell&apos;ospite principale. Il file è conservato in modo cifrato.
        </p>
      </div>

      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          border: `2px dashed ${preview ? C.gold : C.border}`,
          borderRadius: 12,
          padding: 32,
          cursor: "pointer",
          background: C.input,
          position: "relative",
          overflow: "hidden",
          minHeight: 200,
        }}
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
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p style={{ fontSize: 14, color: C.dim, margin: 0, textAlign: "center", lineHeight: 1.5 }}>
              Tocca per fotografare o selezionare il documento
            </p>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "pointer",
          }}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
      </label>

      {preview && (
        <button
          style={S.btnGhost}
          onClick={() => onFileChange(null)}
        >
          Rimuovi
        </button>
      )}

      <button
        style={{ ...S.btnPrimary, opacity: loading ? 0.65 : 1 }}
        disabled={loading}
        onClick={onSubmit}
      >
        {loading ? "Caricamento…" : preview ? "Carica e continua" : "Salta"}
      </button>
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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={S.eyebrow}>Passo 3 di 4</p>
        <h2 style={S.h2}>Aggiunte al soggiorno</h2>
        <p style={{ fontSize: 14, color: C.dim, marginTop: 8 }}>
          Personalizza la tua esperienza. Puoi saltare questo passo.
        </p>
      </div>

      {upsells.length === 0 ? (
        <p style={{ fontSize: 14, color: C.dim }}>
          Nessun servizio aggiuntivo disponibile.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {upsells.map((u) => {
            const on = !!selected[u.id];
            return (
              <button
                key={u.id}
                onClick={() => onToggle(u.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: 10,
                  border: `1px solid ${on ? C.gold : C.border}`,
                  background: on ? "rgba(212,180,131,0.07)" : C.card,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border-color 0.2s, background 0.2s",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, color: C.ivory, margin: "0 0 3px", fontWeight: 500 }}>{u.name}</p>
                  {u.description && (
                    <p style={{ fontSize: 13, color: C.dim, margin: 0, lineHeight: 1.45 }}>{u.description}</p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 15, color: C.gold, fontWeight: 600 }}>€ {u.price}</span>
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
                      transition: "all 0.2s",
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
            padding: "12px 0",
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <span style={{ fontSize: 14, color: C.dim }}>Totale extra</span>
          <span style={{ fontSize: 17, color: C.gold, fontWeight: 600 }}>€ {total.toFixed(2)}</span>
        </div>
      )}

      <button
        style={{ ...S.btnPrimary, opacity: loading ? 0.65 : 1 }}
        disabled={loading}
        onClick={onSubmit}
      >
        {loading ? "Salvataggio…" : total > 0 ? "Aggiungi e continua" : "Continua"}
      </button>
    </div>
  );
}

// ── Step 4: Contact ───────────────────────────────────────────────────────────

function ContactStep({
  email,
  phone,
  marketing,
  setEmail,
  setPhone,
  setMarketing,
  loading,
  onSubmit,
}: {
  email: string;
  phone: string;
  marketing: boolean;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
  setMarketing: (v: boolean) => void;
  loading: boolean;
  onSubmit: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={S.eyebrow}>Passo 4 di 4</p>
        <h2 style={S.h2}>Contatti</h2>
        <p style={{ fontSize: 14, color: C.dim, marginTop: 8, lineHeight: 1.6 }}>
          Facoltativo. Ci permettono di inviarti informazioni utili.
        </p>
      </div>

      <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Email" value={email} type="email" onChange={setEmail} />
        <FormField label="Telefono" value={phone} type="tel" onChange={setPhone} />

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            cursor: "pointer",
            paddingTop: 12,
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <input
            type="checkbox"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
            style={{
              marginTop: 2,
              accentColor: C.gold,
              width: 16,
              height: 16,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 13, color: C.dim, lineHeight: 1.55 }}>
            Acconsento a ricevere comunicazioni commerciali da{" "}
            <span style={{ color: C.ivory }}>ValtiqStay</span>. Puoi revocare
            il consenso in qualsiasi momento.
          </span>
        </label>
      </div>

      <p style={{ fontSize: 12, color: C.dim, lineHeight: 1.6, margin: 0 }}>
        I tuoi dati sono trattati ai sensi del GDPR. Consulta la nostra{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          style={{ color: C.gold, textDecoration: "underline" }}
        >
          informativa sulla privacy
        </a>
        .
      </p>

      <button
        style={{ ...S.btnPrimary, opacity: loading ? 0.65 : 1 }}
        disabled={loading}
        onClick={onSubmit}
      >
        {loading ? "Completamento…" : "Completa il check-in"}
      </button>
    </div>
  );
}

// ── Step 5: Done ──────────────────────────────────────────────────────────────

function DoneStep({
  hotel,
  reservation,
}: {
  hotel: Hotel | null;
  reservation: Reservation;
}) {
  const wi = hotel?.welcome_info;
  const firstName = reservation.guest_name.split(" ")[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(212,180,131,0.1)",
            border: `1.5px solid ${C.gold}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 38,
            fontWeight: 300,
            margin: "0 0 8px",
            color: C.ivory,
          }}
        >
          Check-in completato
        </h2>
        <p style={{ fontSize: 15, color: C.dim, margin: 0 }}>
          Ti aspettiamo, {firstName}.
        </p>
      </div>

      {(wi?.wifi || wi?.concierge || wi?.location) && (
        <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ ...S.label, margin: "0 0 4px" }}>Informazioni utili</p>
          {wi?.location && <InfoRow label="Come raggiungerci" value={wi.location} />}
          {wi?.wifi && (
            <>
              <InfoRow label="Wi-Fi" value={wi.wifi.rete} />
              <InfoRow label="Password" value={wi.wifi.password} />
            </>
          )}
          {wi?.concierge && (
            <>
              <InfoRow label="Concierge" value={wi.concierge.telefono} />
              <InfoRow label="Orari" value={wi.concierge.orari} />
            </>
          )}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <InfoRow label="Check-in ore" value={hotel?.checkin_time ?? ""} />
            <InfoRow label="Check-out ore" value={hotel?.checkout_time ?? ""} />
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
        background: C.bg,
        color: C.ivory,
        padding: 32,
        textAlign: "center",
        gap: 16,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 22,
          fontWeight: 300,
          letterSpacing: "0.15em",
          color: C.gold,
        }}
      >
        {hotelName ?? "ValtiqStay"}
      </span>
      <h1
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 32,
          fontWeight: 300,
          margin: 0,
          color: C.ivory,
        }}
      >
        Check-in già completato
      </h1>
      <p style={{ fontSize: 15, color: C.dim, maxWidth: 340, lineHeight: 1.6, margin: 0 }}>
        La prenotazione risulta già registrata. Ci vediamo all&apos;arrivo!
      </p>
    </div>
  );
}

// ── Shared UI primitives ──────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  dim,
}: {
  label: string;
  value: string;
  dim?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
      <span style={{ fontSize: 13, color: C.dim, flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          color: dim ? C.dim : C.ivory,
          fontWeight: dim ? 400 : 500,
          textAlign: "right",
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
  return (
    <div>
      <label style={S.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={S.input}
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
  return (
    <div>
      <label style={S.label}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...S.input, appearance: "none" as const }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#0A1931" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
