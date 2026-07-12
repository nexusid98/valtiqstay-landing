"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import LenisProvider     from "./components/landing/LenisProvider";
import Navigation        from "./components/landing/Navigation";
import HeroSection       from "./components/landing/HeroSection";
import ArrivalSection    from "./components/landing/ArrivalSection";
import CheckInSection    from "./components/landing/CheckInSection";
import PrivacySection    from "./components/landing/PrivacySection";
import AnalyticsSection  from "./components/landing/AnalyticsSection";
import FinalSection      from "./components/landing/FinalSection";

/* ── Global CSS ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:auto}
  body{
    background:#050816;
    color:#fff;
    font-family:var(--font-manrope,system-ui,sans-serif);
    -webkit-font-smoothing:antialiased;
    overflow-x:hidden;
  }
  ::selection{background:rgba(59,130,246,0.28);color:#fff}
  ::-webkit-scrollbar{width:8px}
  ::-webkit-scrollbar-track{background:#050816}
  ::-webkit-scrollbar-thumb{background:#1E3A8A;border-radius:6px}
  ::-webkit-scrollbar-thumb:hover{background:#2563EB}
  @keyframes borderPulse{
    0%,100%{border-color:rgba(59,130,246,0.4)}
    50%{border-color:rgba(59,130,246,0.7)}
  }
`;

/* ── Demo Modal ─────────────────────────────────────────────────────────── */
function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fields, setFields] = useState({ name: "", hotel: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    track("form_submit", { category: "hotel", label: "demo" });
    try {
      const r = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, type: "demo" }),
      });
      if (!r.ok) throw new Error();
      setStatus("ok");
      track("form_success", { category: "hotel", label: "demo" });
    } catch {
      setStatus("err");
      track("form_error", { category: "hotel", label: "demo" });
    }
  }

  const inp: React.CSSProperties = {
    padding: "13px 16px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    fontSize: 15,
    color: "#fff",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    transition: "border-color .2s",
  };

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby="demo-title"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{
        background: "#0B1220",
        border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: 20, padding: 40,
        width: "100%", maxWidth: 480,
        position: "relative",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(59,130,246,0.08)",
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 16, right: 20,
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(255,255,255,0.4)", fontSize: 24, lineHeight: 1,
            fontFamily: "inherit",
          }}
        >
          ×
        </button>

        <div style={{
          fontFamily: "var(--font-space-mono,monospace)",
          fontSize: 11, letterSpacing: ".14em",
          color: "#60A5FA", marginBottom: 10,
        }}>
          BOOK A DEMO
        </div>
        <h2
          id="demo-title"
          style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700, letterSpacing: "-.03em", color: "#fff" }}
        >
          Talk to us about ValtiqStay
        </h2>
        <p style={{ margin: "0 0 28px", color: "#6B7280", fontSize: 14 }}>
          We&apos;ll get back to you within 24 hours to schedule a personalised demo.
        </p>

        {status === "ok" ? (
          <p
            role="status"
            aria-live="polite"
            style={{ color: "#10B981", fontWeight: 600, fontSize: 15, lineHeight: 1.6 }}
          >
            ✓ Request sent — we&apos;ll be in touch shortly!
          </p>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { k: "name",  label: "Full name *",        type: "text",  auto: "name" },
              { k: "hotel", label: "Hotel / property *",  type: "text",  auto: "organization" },
              { k: "email", label: "Business email *",    type: "email", auto: "email" },
              { k: "phone", label: "Phone (optional)",    type: "tel",   auto: "tel" },
            ].map(({ k, label, type, auto }) => (
              <input
                key={k}
                type={type}
                placeholder={label}
                autoComplete={auto}
                required={label.endsWith("*")}
                aria-required={label.endsWith("*")}
                value={fields[k as keyof typeof fields]}
                onChange={e => setFields(p => ({ ...p, [k]: e.target.value }))}
                style={inp}
                onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.5)"; }}
                onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            ))}
            {status === "err" && (
              <p role="alert" style={{ color: "#F87171", fontSize: 13 }}>
                Something went wrong — please try again.
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                marginTop: 6, padding: "15px",
                background: "linear-gradient(135deg,#3B82F6,#2563EB)",
                color: "#fff", fontWeight: 700,
                border: "none", borderRadius: 12,
                fontSize: 16, cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 10px 30px rgba(59,130,246,0.35)",
                transition: "opacity .2s",
                opacity: status === "sending" ? 0.65 : 1,
              }}
            >
              {status === "sending" ? "Sending…" : "Send Request →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Cursor light ───────────────────────────────────────────────────────── */
function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: 700, height: 700,
        marginLeft: -350, marginTop: -350,
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(59,130,246,0.06),transparent 60%)",
        pointerEvents: "none",
        zIndex: 0,
        willChange: "transform",
        transition: "transform 0.4s cubic-bezier(.16,1,.3,1)",
      }}
    />
  );
}

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function HomeClient() {
  const [demoOpen, setDemoOpen] = useState(false);

  const openDemo = useCallback(() => {
    track("cta_click", { category: "hotel", label: "book_demo" });
    setDemoOpen(true);
  }, []);

  return (
    <LenisProvider>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <CursorLight />

      <Navigation openDemo={openDemo} />

      <main style={{ position: "relative", background: "#050816", minHeight: "100vh" }}>
        <HeroSection    openDemo={openDemo} />
        <ArrivalSection />
        <CheckInSection />
        <PrivacySection />
        <AnalyticsSection />
        <FinalSection   openDemo={openDemo} />
      </main>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </LenisProvider>
  );
}
