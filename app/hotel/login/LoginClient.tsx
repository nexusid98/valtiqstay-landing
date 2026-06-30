"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const C = {
  midnight: "#050B17",
  navy: "#0A1931",
  navyDeep: "#0d2040",
  gold: "#D4B483",
  champagne: "#F5E9D3",
  dim: "rgba(245,233,211,0.45)",
  border: "rgba(212,180,131,0.18)",
  borderFocus: "rgba(212,180,131,0.6)",
  input: "rgba(255,255,255,0.04)",
  err: "rgba(220,38,38,0.1)",
  errBorder: "rgba(220,38,38,0.28)",
};

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [hoverBtn, setHoverBtn] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (authError) {
      setError("Credenziali non valide. Controlla email e password.");
      setLoading(false);
      return;
    }
    router.push("/hotel");
    router.refresh();
  }

  function inputStyle(name: string): React.CSSProperties {
    const f = focused === name;
    return {
      background: f ? "rgba(212,180,131,0.04)" : C.input,
      border: `1px solid ${f ? C.borderFocus : C.border}`,
      color: C.champagne,
      borderRadius: 9,
      padding: "13px 16px",
      width: "100%",
      fontSize: 15,
      outline: "none",
      boxSizing: "border-box" as const,
      transition: "border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
      boxShadow: f ? "0 0 0 3px rgba(212,180,131,0.07)" : "none",
      lineHeight: 1.4,
    };
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "rgba(245,233,211,0.35)",
    marginBottom: 8,
    fontWeight: 600,
  };

  return (
    <>
      <style>{`
        @keyframes vq-fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(ellipse at 50% 0%, rgba(13,32,64,0.9) 0%, ${C.midnight} 70%)`,
          padding: 24,
        }}
      >
        {/* Subtle grid texture overlay */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(212,180,131,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: "100%",
            maxWidth: 400,
            animation: "vq-fade-in 0.5s ease both",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: 30,
                fontWeight: 300,
                letterSpacing: "0.22em",
                color: C.gold,
                textTransform: "uppercase",
                display: "block",
              }}
            >
              ValtiqStay
            </span>
            {/* Ornamental line */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px auto 0", maxWidth: 200 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(212,180,131,0.3))" }} />
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(212,180,131,0.4)" }} />
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(212,180,131,0.3), transparent)" }} />
            </div>
            <p
              style={{
                fontSize: 11,
                color: "rgba(245,233,211,0.3)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              Accesso staff
            </p>
          </div>

          {/* Card */}
          <form
            onSubmit={handleSubmit}
            style={{
              background: "linear-gradient(145deg, #0d2040 0%, #0A1931 100%)",
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              boxShadow: "0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,180,131,0.06)",
            }}
          >
            {error && (
              <div
                style={{
                  padding: "12px 15px",
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

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle("email")}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={inputStyle("password")}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={() => !loading && setHoverBtn(true)}
              onMouseLeave={() => setHoverBtn(false)}
              style={{
                marginTop: 6,
                background: loading ? "rgba(212,180,131,0.45)" : hoverBtn ? "#c9a76a" : C.gold,
                color: C.midnight,
                border: "none",
                borderRadius: 9,
                padding: "14px 24px",
                fontSize: 12,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                transition: "background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease",
                boxShadow: loading ? "none" : hoverBtn ? "0 6px 24px rgba(212,180,131,0.32)" : "0 4px 16px rgba(212,180,131,0.18)",
                transform: hoverBtn && !loading ? "translateY(-1px)" : "none",
              }}
            >
              {loading ? "Accesso in corso…" : "Accedi"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(245,233,211,0.2)", marginTop: 28, letterSpacing: "0.04em" }}>
            Accesso riservato al personale autorizzato
          </p>
        </div>
      </div>
    </>
  );
}
