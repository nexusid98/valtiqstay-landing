"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Reservation = {
  id: string;
  guest_name: string;
  arrival: string;
  departure: string;
  room_label: string | null;
  party_size: number;
};

const C = {
  gold: "#D4B483",
  champagne: "#F5E9D3",
  border: "rgba(212,180,131,0.2)",
  borderFocus: "rgba(212,180,131,0.6)",
  input: "rgba(255,255,255,0.04)",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(245,233,211,0.4)",
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  min,
  max,
  placeholder,
}: {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  min?: string | number;
  max?: string | number;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      min={min}
      max={max}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        background: focused ? "rgba(212,180,131,0.04)" : C.input,
        border: `1px solid ${focused ? C.borderFocus : C.border}`,
        borderRadius: 8,
        padding: "10px 12px",
        color: C.champagne,
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
        boxShadow: focused ? "0 0 0 3px rgba(212,180,131,0.07)" : "none",
        colorScheme: "dark",
      }}
    />
  );
}

export default function EditReservationButton({
  reservation,
}: {
  reservation: Reservation;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    guest_name: reservation.guest_name,
    arrival: reservation.arrival,
    departure: reservation.departure,
    room_label: reservation.room_label ?? "",
    party_size: String(reservation.party_size),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function set(key: keyof typeof form) {
    return (v: string) => setForm((f) => ({ ...f, [key]: v }));
  }

  function handleOpen() {
    setForm({
      guest_name: reservation.guest_name,
      arrival: reservation.arrival,
      departure: reservation.departure,
      room_label: reservation.room_label ?? "",
      party_size: String(reservation.party_size),
    });
    setError("");
    setOpen(true);
  }

  async function handleSave() {
    if (!form.guest_name.trim() || !form.arrival || !form.departure) {
      setError("Compila tutti i campi obbligatori.");
      return;
    }
    if (form.arrival >= form.departure) {
      setError("La data di arrivo deve precedere quella di partenza.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/hotel/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          party_size: parseInt(form.party_size, 10) || 1,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error === "invalid_dates" ? "Date non valide." : "Errore nel salvataggio. Riprova.");
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        style={{
          background: "rgba(212,180,131,0.07)",
          color: "rgba(212,180,131,0.75)",
          border: "1px solid rgba(212,180,131,0.22)",
          borderRadius: 8,
          padding: "10px 18px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          transition: "all 0.2s ease",
          whiteSpace: "nowrap",
        }}
      >
        Modifica
      </button>
    );
  }

  return (
    <>
      <div
        onClick={() => !loading && setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 50,
        }}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 51,
          background: "linear-gradient(135deg, #0A1931 0%, #050B17 100%)",
          border: "1px solid rgba(212,180,131,0.22)",
          borderRadius: 16,
          padding: "28px 28px 24px",
          width: "min(480px, 92vw)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.65)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Chiudi"
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            color: "rgba(245,233,211,0.35)",
            cursor: "pointer",
            fontSize: 22,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>

        <h3
          style={{
            margin: "0 0 22px",
            fontFamily: "var(--font-cormorant)",
            fontSize: 22,
            fontWeight: 400,
            color: C.gold,
            letterSpacing: "0.06em",
          }}
        >
          Modifica prenotazione
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Nome ospite *">
            <Input value={form.guest_name} onChange={set("guest_name")} placeholder="Mario Rossi" />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Arrivo *">
              <Input type="date" value={form.arrival} max={form.departure} onChange={set("arrival")} />
            </Field>
            <Field label="Partenza *">
              <Input type="date" value={form.departure} min={form.arrival} onChange={set("departure")} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Camera">
              <Input value={form.room_label} onChange={set("room_label")} placeholder="Camera 201" />
            </Field>
            <Field label="N° ospiti">
              <Input type="number" value={form.party_size} min={1} max={20} onChange={set("party_size")} />
            </Field>
          </div>
        </div>

        {error && (
          <p style={{ margin: "14px 0 0", fontSize: 13, color: "#f87171" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button
            onClick={() => setOpen(false)}
            disabled={loading}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid rgba(212,180,131,0.2)",
              borderRadius: 8,
              padding: "11px",
              color: "rgba(245,233,211,0.5)",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              flex: 2,
              background: loading ? "rgba(212,180,131,0.45)" : C.gold,
              color: "#050B17",
              border: "none",
              borderRadius: 8,
              padding: "11px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Salvataggio…" : "Salva modifiche"}
          </button>
        </div>
      </div>
    </>
  );
}
