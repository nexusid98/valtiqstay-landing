"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

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

export default function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const inputStyle: React.CSSProperties = {
    background: C.input,
    border: `1px solid ${C.border}`,
    color: C.ivory,
    borderRadius: 8,
    padding: "12px 16px",
    width: "100%",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: C.bg,
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 28,
              fontWeight: 300,
              letterSpacing: "0.15em",
              color: C.gold,
            }}
          >
            ValtiqStay
          </span>
          <p
            style={{
              fontSize: 13,
              color: C.dim,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            Accesso staff
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
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

          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: C.dim,
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={inputStyle}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: C.dim,
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: C.gold,
              color: "#050B17",
              border: "none",
              borderRadius: 8,
              padding: "13px 24px",
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.65 : 1,
              letterSpacing: "0.04em",
            }}
          >
            {loading ? "Accesso…" : "Accedi"}
          </button>
        </form>
      </div>
    </div>
  );
}
