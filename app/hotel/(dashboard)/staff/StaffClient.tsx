"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const C = {
  midnight: "#050B17",
  navy: "#0A1931",
  gold: "#D4B483",
  champagne: "#F5E9D3",
  border: "rgba(212,180,131,0.18)",
  borderFocus: "rgba(212,180,131,0.6)",
  input: "rgba(255,255,255,0.04)",
};

type StaffMember = {
  user_id: string;
  email: string | null;
  last_sign_in: string | null;
  invited_at: string | null;
  confirmed: boolean;
};

export default function StaffClient({
  staff: initial,
  currentUserId,
}: {
  staff: StaffMember[];
  currentUserId: string;
}) {
  const [staff, setStaff] = useState<StaffMember[]>(initial);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);
  const router = useRouter();

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/hotel/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });
    const json = await res.json();

    if (!res.ok) {
      const msgs: Record<string, string> = {
        invalid_email: "Email non valida.",
        already_staff: "Questo utente è già membro dello staff.",
        hotel_not_found: "Hotel non trovato.",
      };
      setError(msgs[json.error] ?? json.error ?? "Errore nell'invito.");
    } else {
      setSuccess(
        json.invited
          ? `Invito inviato a ${email.trim()}. L'utente riceverà un link per impostare la password.`
          : `${email.trim()} aggiunto allo staff (account già esistente).`
      );
      setEmail("");
      router.refresh();
      // Optimistically add to list (will be updated on refresh)
      setStaff((prev) => [
        ...prev,
        {
          user_id: json.user_id,
          email: email.trim(),
          last_sign_in: null,
          invited_at: new Date().toISOString(),
          confirmed: !json.invited,
        },
      ]);
    }
    setLoading(false);
  }

  async function handleRemove(uid: string, memberEmail: string | null) {
    if (!confirm(`Rimuovere ${memberEmail ?? uid} dallo staff?`)) return;
    setRemoving(uid);
    const res = await fetch(`/api/hotel/staff/${uid}`, { method: "DELETE" });
    if (res.ok) {
      setStaff((prev) => prev.filter((s) => s.user_id !== uid));
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Errore nella rimozione.");
    }
    setRemoving(null);
  }

  function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Invite form */}
      <div
        style={{
          background: "linear-gradient(145deg, #0d2040 0%, #0A1931 100%)",
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: "24px 28px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(212,180,131,0.05)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 20,
            fontWeight: 300,
            color: C.champagne,
            margin: "0 0 18px",
          }}
        >
          Invita membro dello staff
        </h3>

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

        {success && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              color: "#4ade80",
              fontSize: 13,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleInvite} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); setSuccess(null); }}
              placeholder="staff@example.com"
              required
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                background: focused ? "rgba(212,180,131,0.04)" : C.input,
                border: `1px solid ${focused ? C.borderFocus : C.border}`,
                color: C.champagne,
                borderRadius: 8,
                padding: "11px 14px",
                fontSize: 14,
                outline: "none",
                width: "100%",
                boxSizing: "border-box" as const,
                transition: "border-color 0.18s ease, box-shadow 0.18s ease",
                boxShadow: focused ? "0 0 0 3px rgba(212,180,131,0.07)" : "none",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => !loading && setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            style={{
              background: loading ? "rgba(212,180,131,0.45)" : hoverBtn ? "#c9a76a" : C.gold,
              color: C.midnight,
              border: "none",
              borderRadius: 8,
              padding: "11px 20px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
              boxShadow: loading ? "none" : hoverBtn ? "0 5px 20px rgba(212,180,131,0.28)" : "0 3px 12px rgba(212,180,131,0.15)",
              transform: hoverBtn && !loading ? "translateY(-1px)" : "none",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            {loading ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "vq-spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Invio…
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Invia invito
              </>
            )}
          </button>
        </form>
        <p style={{ fontSize: 11, color: "rgba(245,233,211,0.25)", margin: "12px 0 0", lineHeight: 1.5 }}>
          L&apos;utente riceverà un&apos;email con il link per impostare la password e accedere al portale.
        </p>
      </div>

      {/* Staff list */}
      <div
        style={{
          background: "linear-gradient(180deg, #0c1f38 0%, #0A1931 100%)",
          border: "1px solid rgba(212,180,131,0.15)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 4px 32px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid rgba(212,180,131,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 20,
              fontWeight: 300,
              color: C.champagne,
              margin: 0,
            }}
          >
            Membri staff
          </h3>
          <span style={{ fontSize: 12, color: "rgba(245,233,211,0.3)" }}>
            {staff.length} {staff.length === 1 ? "utente" : "utenti"}
          </span>
        </div>

        {staff.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "rgba(245,233,211,0.3)", fontSize: 13 }}>
            Nessun membro dello staff.
          </div>
        ) : (
          <div>
            {staff.map((member) => (
              <div
                key={member.user_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 24px",
                  borderBottom: "1px solid rgba(212,180,131,0.06)",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Avatar placeholder */}
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "rgba(212,180,131,0.1)",
                      border: "1px solid rgba(212,180,131,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.gold,
                      fontFamily: "var(--font-cormorant)",
                    }}
                  >
                    {(member.email?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, color: C.champagne, fontWeight: 500 }}>
                      {member.email ?? member.user_id}
                      {member.user_id === currentUserId && (
                        <span style={{ marginLeft: 8, fontSize: 10, color: "rgba(212,180,131,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          Tu
                        </span>
                      )}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(245,233,211,0.3)" }}>
                      {!member.confirmed ? (
                        <span style={{ color: "rgba(212,180,131,0.5)" }}>
                          Invito inviato il {fmtDate(member.invited_at)} — in attesa di conferma
                        </span>
                      ) : (
                        <>Ultimo accesso: {fmtDate(member.last_sign_in)}</>
                      )}
                    </p>
                  </div>
                </div>

                {member.user_id !== currentUserId && (
                  <button
                    onClick={() => handleRemove(member.user_id, member.email)}
                    disabled={removing === member.user_id}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(220,38,38,0.2)",
                      borderRadius: 7,
                      padding: "6px 12px",
                      fontSize: 11,
                      color: "rgba(220,38,38,0.6)",
                      cursor: removing === member.user_id ? "not-allowed" : "pointer",
                      letterSpacing: "0.05em",
                      transition: "border-color 0.15s, color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220,38,38,0.5)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220,38,38,0.2)";
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(220,38,38,0.6)";
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    {removing === member.user_id ? "Rimozione…" : "Rimuovi"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
