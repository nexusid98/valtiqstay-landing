"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ── Brand palette ── */
const GOLD   = "#C4A850";
const GOLD_L = "#D9C089";
const NAVY   = "#1B2A4A";

const FEATURES = [
  {
    icon: "🔐",
    title: "Encrypted ID upload",
    body: "Documents never leave the secure enclave. AES-256 at rest, TLS 1.3 in transit.",
  },
  {
    icon: "⚡",
    title: "Instant verification",
    body: "Real-time cross-check with the reservation. Average processing: 8 seconds.",
  },
  {
    icon: "🌐",
    title: "Any device, any OS",
    body: "Progressive Web App. Works on every browser — no installs, no friction.",
  },
  {
    icon: "♿",
    title: "Fully accessible",
    body: "WCAG 2.1 AA. Screen-reader ready. High-contrast mode. Multiple languages.",
  },
];

const MOCK_STEPS = [
  { label: "Welcome", done: true,  active: false },
  { label: "Guests",  done: true,  active: false },
  { label: "ID Doc",  done: false, active: true  },
  { label: "Upsells", done: false, active: false },
  { label: "Done",    done: false, active: false },
];

export default function CheckInSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef   = useRef<HTMLDivElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(textRef.current, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" })
        .from(phoneRef.current, { y: 60, opacity: 0, scale: 0.92, duration: 1, ease: "power3.out" }, "-=0.5")
        .from(cardsRef.current?.children ?? [], {
          y: 30, opacity: 0, stagger: 0.12, duration: 0.7, ease: "power3.out",
        }, "-=0.6");
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="checkin"
      style={{
        padding: "140px 48px",
        background: "linear-gradient(180deg,#060D1C,#080F22 50%,#060D1C)",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Header */}
        <div ref={textRef} style={{ textAlign: "center", marginBottom: 80 }}>
          <div style={{
            fontFamily: "var(--font-space-mono,monospace)",
            fontSize: 11.5, letterSpacing: ".14em", color: GOLD, marginBottom: 16,
          }}>
            02 / DIGITAL CHECK-IN
          </div>
          <h2 style={{
            margin: "0 auto 18px", maxWidth: 700,
            fontSize: "clamp(28px,3.2vw,46px)", fontWeight: 700,
            letterSpacing: "-.035em", lineHeight: 1.1, color: "#fff",
          }}>
            Check in from anywhere{" "}
            <span style={{
              background: `linear-gradient(90deg,${GOLD},${GOLD_L})`,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>
              before reaching the lobby.
            </span>
          </h2>
          <p style={{
            margin: "0 auto", maxWidth: 520,
            color: "rgba(240,228,184,0.6)", fontSize: 16.5, lineHeight: 1.7,
          }}>
            A five-step guided flow. Guests complete it from their phone.
            Staff get clean, verified data in their dashboard.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 60, alignItems: "start",
        }}>
          {/* Left feature cards */}
          <div ref={cardsRef} style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 40 }}>
            {FEATURES.slice(0, 2).map(f => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>

          {/* Phone mockup — center */}
          <div ref={phoneRef}>
            <PhoneMockup />
          </div>

          {/* Right feature cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingTop: 40 }}>
            {FEATURES.slice(2).map(f => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div
      style={{
        padding: "22px 24px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(196,168,80,0.12)",
        backdropFilter: "blur(8px)",
        transition: "border-color .25s, background .25s, transform .25s",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(196,168,80,0.32)";
        el.style.background = "rgba(196,168,80,0.05)";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "rgba(196,168,80,0.12)";
        el.style.background = "rgba(255,255,255,0.03)";
        el.style.transform = "";
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 15, color: "#E8DFC8", marginBottom: 6 }}>{title}</div>
      <div style={{ color: "rgba(240,228,184,0.55)", fontSize: 13.5, lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div style={{
      width: 240,
      borderRadius: 32,
      background: "#090F1E",
      border: `6px solid ${NAVY}`,
      boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,168,80,0.18), inset 0 0 0 1px rgba(255,255,255,0.04)`,
      overflow: "hidden",
      padding: "20px 0 28px",
    }}>
      {/* Notch */}
      <div style={{ width: 80, height: 20, borderRadius: "0 0 14px 14px", background: "#090F1E", margin: "0 auto 16px", border: `1px solid ${NAVY}`, borderTop: "none" }} />

      {/* Progress steps */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {MOCK_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              display: "grid", placeItems: "center",
              background: s.done ? "#10B981" : s.active ? GOLD : "rgba(255,255,255,0.08)",
              border: s.active ? `2px solid ${GOLD_L}` : "none",
              fontSize: 9, color: s.active ? NAVY : "#fff", fontWeight: 700,
              boxShadow: s.active ? `0 0 10px rgba(196,168,80,0.5)` : "none",
            }}>
              {s.done ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 7.5, color: s.active ? GOLD_L : s.done ? "#10B981" : "#4B5563" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Screen content */}
      <div style={{ padding: "18px 16px" }}>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: ".1em", marginBottom: 10, fontFamily: "var(--font-space-mono,monospace)" }}>IDENTITY VERIFICATION</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Upload your ID</div>
        <div style={{ fontSize: 11, color: "rgba(240,228,184,0.4)", marginBottom: 16 }}>Front of passport or ID card</div>

        {/* Upload zone */}
        <div style={{
          border: `2px dashed rgba(196,168,80,0.4)`,
          borderRadius: 12, padding: "20px 12px",
          textAlign: "center", marginBottom: 14,
          background: "rgba(196,168,80,0.04)",
        }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>📷</div>
          <div style={{ fontSize: 10, color: "rgba(240,228,184,0.4)" }}>Tap to photograph</div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginBottom: 16, overflow: "hidden" }}>
          <div style={{ width: "40%", height: "100%", background: `linear-gradient(90deg,${GOLD},${GOLD_L})`, borderRadius: 2 }} />
        </div>

        {/* CTA */}
        <div style={{
          padding: "10px", borderRadius: 10, textAlign: "center",
          background: `linear-gradient(135deg,${GOLD},#9C8438)`,
          color: NAVY, fontSize: 11, fontWeight: 700,
        }}>
          Continue →
        </div>
      </div>
    </div>
  );
}
