"use client";

import { useState, useEffect, useRef } from "react";
import { VLogoMark } from "./LogoMark";

/* ── Brand palette ── */
const GOLD    = "#C4A850";
const GOLD_L  = "#D9C089";
const NAVY    = "#1B2A4A";

const LINKS = [
  ["#arrival",   "Platform"],
  ["#checkin",   "Check-in"],
  ["#privacy",   "Privacy"],
  ["#analytics", "Analytics"],
];

export default function Navigation({ openDemo }: { openDemo: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* magnetic effect on CTA */
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const move = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    };
    const leave = () => { btn.style.transform = ""; };
    btn.addEventListener("mousemove", move);
    btn.addEventListener("mouseleave", leave);
    return () => {
      btn.removeEventListener("mousemove", move);
      btn.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 48px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: scrolled ? "rgba(6,13,28,0.92)" : "rgba(6,13,28,0.55)",
        borderBottom: `1px solid ${scrolled ? "rgba(196,168,80,0.18)" : "rgba(196,168,80,0.07)"}`,
        transition: "background 0.4s, border-color 0.4s",
      }}
    >
      {/* Logo */}
      <a
        href="#hero"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
        }}
        aria-label="ValtiqStay home"
      >
        <VLogoMark size={34} />
        <span
          style={{
            fontFamily: "var(--font-cormorant, Georgia, serif)",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "-.01em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: "#ffffff" }}>Valtiq</span>
          <span style={{ color: GOLD }}>Stay</span>
        </span>
      </a>

      {/* Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {LINKS.map(([href, label]) => (
          <a
            key={href}
            href={href}
            style={{
              color: "rgba(255,255,255,0.55)",
              textDecoration: "none",
              fontSize: 14.5,
              fontWeight: 500,
              letterSpacing: ".01em",
              transition: "color .25s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = GOLD_L)}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Right CTAs */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a
          href="/hotel/login"
          style={{
            color: "rgba(255,255,255,0.6)",
            textDecoration: "none",
            fontSize: 14.5,
            fontWeight: 500,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
        >
          Sign in
        </a>
        <button
          ref={btnRef}
          onClick={openDemo}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 22px",
            borderRadius: 10,
            background: `linear-gradient(135deg,${GOLD},#9C8438)`,
            color: NAVY,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "inherit",
            letterSpacing: ".01em",
            boxShadow: "0 8px 26px rgba(196,168,80,0.35)",
            transition: "box-shadow .25s, transform .25s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(196,168,80,0.5)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 26px rgba(196,168,80,0.35)";
          }}
        >
          Request Demo
        </button>
      </div>
    </nav>
  );
}
