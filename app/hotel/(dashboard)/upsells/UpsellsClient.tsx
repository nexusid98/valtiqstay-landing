"use client";

import { useState } from "react";

type Upsell = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  active: boolean;
};

const C = {
  gold: "#D4B483",
  champagne: "#F5E9D3",
  midnight: "#050B17",
  border: "rgba(212,180,131,0.18)",
  borderFocus: "rgba(212,180,131,0.55)",
  input: "rgba(255,255,255,0.04)",
};

const CATEGORIES = [
  "Colazione", "Cena", "Bevande", "Spa & Benessere",
  "Trasporti", "Esperienze", "Camera", "Altro",
];

function fmtEur(n: number) {
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(245,233,211,0.4)", marginBottom: 6, fontWeight: 600 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value, onChange, placeholder, type = "text",
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [f, setF] = useState(false);
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
      step={type === "number" ? "0.01" : undefined}
      style={{
        width: "100%",
        background: f ? "rgba(212,180,131,0.04)" : C.input,
        border: `1px solid ${f ? C.borderFocus : C.border}`,
        borderRadius: 8,
        padding: "10px 12px",
        color: C.champagne,
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box" as const,
        transition: "border-color 0.18s ease, box-shadow 0.18s ease",
        boxShadow: f ? "0 0 0 3px rgba(212,180,131,0.07)" : "none",
      }}
    />
  );
}

function SelectInput({
  value, onChange, options,
}: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  const [f, setF] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setF(true)}
      onBlur={() => setF(false)}
      style={{
        width: "100%",
        background: f ? "rgba(212,180,131,0.04)" : C.input,
        border: `1px solid ${f ? C.borderFocus : C.border}`,
        borderRadius: 8,
        padding: "10px 12px",
        color: C.champagne,
        fontSize: 14,
        outline: "none",
        boxSizing: "border-box" as const,
        colorScheme: "dark",
        cursor: "pointer",
      }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const BLANK_FORM = { name: "", category: "Colazione", description: "", price: "" };

function UpsellForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<typeof BLANK_FORM>;
  onSave: (data: typeof BLANK_FORM) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({ ...BLANK_FORM, ...initial });
  const [err, setErr] = useState("");

  function set(k: keyof typeof BLANK_FORM) {
    return (v: string) => { setForm((f) => ({ ...f, [k]: v })); setErr(""); };
  }

  function handleSave() {
    if (!form.name.trim()) { setErr("Il nome è obbligatorio."); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      setErr("Inserisci un prezzo valido."); return;
    }
    onSave(form);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Nome *">
          <TextInput value={form.name} onChange={set("name")} placeholder="Colazione in camera" />
        </Field>
        <Field label="Categoria *">
          <SelectInput value={form.category} onChange={set("category")} options={CATEGORIES} />
        </Field>
      </div>
      <Field label="Descrizione">
        <TextInput value={form.description} onChange={set("description")} placeholder="Opzionale" />
      </Field>
      <Field label="Prezzo (€) *">
        <TextInput type="number" value={form.price} onChange={set("price")} placeholder="0.00" />
      </Field>

      {err && <p style={{ margin: 0, fontSize: 13, color: "#f87171" }}>{err}</p>}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onCancel}
          style={{ flex: 1, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px", color: "rgba(245,233,211,0.5)", fontSize: 13, cursor: "pointer" }}
        >
          Annulla
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 2, background: saving ? "rgba(212,180,131,0.45)" : C.gold,
            color: C.midnight, border: "none", borderRadius: 8, padding: "10px",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Salvataggio…" : "Salva"}
        </button>
      </div>
    </div>
  );
}

export default function UpsellsClient({ initialUpsells }: { initialUpsells: Upsell[] }) {
  const [upsells, setUpsells] = useState<Upsell[]>(initialUpsells);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = upsells.reduce<Record<string, Upsell[]>>((acc, u) => {
    (acc[u.category] ??= []).push(u);
    return acc;
  }, {});

  async function handleAdd(form: typeof BLANK_FORM) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/hotel/upsells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      const j = await res.json();
      if (!res.ok) { setError(j.error ?? "Errore nel salvataggio."); return; }
      setUpsells((prev) => [...prev, j.upsell].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)));
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(id: string, form: typeof BLANK_FORM) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/hotel/upsells/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      if (!res.ok) { setError("Errore nel salvataggio."); return; }
      setUpsells((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, name: form.name, category: form.category, description: form.description || null, price: Number(form.price) }
            : u
        )
      );
      setEditId(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    setToggling(id);
    try {
      const res = await fetch(`/api/hotel/upsells/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (res.ok) {
        setUpsells((prev) => prev.map((u) => u.id === id ? { ...u, active: !currentActive } : u));
      }
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: string) {
    setConfirmDelete(null);
    setDeleting(id);
    try {
      const res = await fetch(`/api/hotel/upsells/${id}`, { method: "DELETE" });
      const j = await res.json();
      if (!res.ok) { setError("Errore nell'eliminazione."); return; }
      if (j.deleted) {
        setUpsells((prev) => prev.filter((u) => u.id !== id));
      } else {
        // deactivated (had orders)
        setUpsells((prev) => prev.map((u) => u.id === id ? { ...u, active: false } : u));
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {error && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.22)", color: "#fca5a5", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Add form */}
      <div style={{ background: "linear-gradient(145deg, #0d2040 0%, #0A1931 100%)", border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 26px", boxShadow: "0 4px 32px rgba(0,0,0,0.2)" }}>
        {showAdd ? (
          <>
            <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: 20, fontWeight: 300, color: C.champagne, margin: "0 0 18px" }}>
              Nuovo servizio
            </h3>
            <UpsellForm onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} />
          </>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            style={{
              width: "100%", padding: "12px",
              background: "transparent", border: `1px dashed ${C.border}`,
              borderRadius: 8, color: "rgba(212,180,131,0.65)",
              fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "border-color 0.18s ease, color 0.18s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,180,131,0.45)"; (e.currentTarget as HTMLButtonElement).style.color = C.gold; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; (e.currentTarget as HTMLButtonElement).style.color = "rgba(212,180,131,0.65)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Aggiungi servizio
          </button>
        )}
      </div>

      {/* Grouped list */}
      {Object.keys(grouped).sort().map((category) => (
        <div
          key={category}
          style={{ background: "linear-gradient(180deg, #0c1f38 0%, #0A1931 100%)", border: "1px solid rgba(212,180,131,0.15)", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 32px rgba(0,0,0,0.2)" }}
        >
          <div style={{ padding: "14px 22px", borderBottom: "1px solid rgba(212,180,131,0.1)", background: "rgba(0,0,0,0.1)" }}>
            <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,233,211,0.4)", fontWeight: 600 }}>
              {category}
            </span>
          </div>
          {grouped[category].map((u) => (
            <div key={u.id} style={{ borderBottom: "1px solid rgba(212,180,131,0.06)", opacity: u.active ? 1 : 0.5 }}>
              {editId === u.id ? (
                <div style={{ padding: "18px 22px" }}>
                  <UpsellForm
                    initial={{ name: u.name, category: u.category, description: u.description ?? "", price: String(u.price) }}
                    onSave={(form) => handleEdit(u.id, form)}
                    onCancel={() => setEditId(null)}
                    saving={saving}
                  />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, color: C.champagne, fontWeight: 500 }}>{u.name}</p>
                    {u.description && (
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(245,233,211,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.description}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: 15, color: C.gold, fontFamily: "var(--font-cormorant)", fontWeight: 300, flexShrink: 0 }}>
                    {fmtEur(u.price)}
                  </span>

                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggle(u.id, u.active)}
                    disabled={toggling === u.id}
                    title={u.active ? "Disattiva" : "Attiva"}
                    style={{
                      flexShrink: 0,
                      width: 36, height: 20,
                      borderRadius: 10,
                      background: u.active ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.1)",
                      border: `1px solid ${u.active ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.15)"}`,
                      cursor: toggling === u.id ? "not-allowed" : "pointer",
                      position: "relative",
                      transition: "background 0.2s ease, border-color 0.2s ease",
                      padding: 0,
                    }}
                  >
                    <span style={{
                      position: "absolute",
                      top: 2, left: u.active ? 16 : 2,
                      width: 14, height: 14,
                      borderRadius: "50%",
                      background: u.active ? "#4ade80" : "rgba(245,233,211,0.35)",
                      transition: "left 0.2s ease, background 0.2s ease",
                    }} />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => { setEditId(u.id); setError(null); }}
                    style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 12px", fontSize: 11, color: "rgba(212,180,131,0.7)", cursor: "pointer", letterSpacing: "0.05em", flexShrink: 0 }}
                  >
                    Modifica
                  </button>

                  {/* Delete */}
                  {confirmDelete === u.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "rgba(245,233,211,0.45)" }}>Confermi?</span>
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                        style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.4)", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#fca5a5", cursor: "pointer" }}
                      >
                        {deleting === u.id ? "…" : "Sì"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "rgba(245,233,211,0.45)", cursor: "pointer" }}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(u.id)}
                      style={{ background: "transparent", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 7, padding: "5px 12px", fontSize: 11, color: "rgba(220,38,38,0.55)", cursor: "pointer", flexShrink: 0 }}
                    >
                      Elimina
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {upsells.length === 0 && !showAdd && (
        <div style={{ textAlign: "center", padding: "40px 32px", color: "rgba(245,233,211,0.3)", fontSize: 14 }}>
          Nessun servizio configurato. Aggiungine uno con il pulsante qui sopra.
        </div>
      )}
    </div>
  );
}
