"use client";

import { useState, useEffect, useRef } from "react";

const LINKS = [
  ["#arrival",   "Platform"],
  ["#checkin",   "Check-in"],
  ["#privacy",   "Privacy"],
  ["#analytics", "Analytics"],
];

export default function Navigation({ openDemo }: { openDemo: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* magnetic button */
  useEffect(() => {
    const btn = navRef.current?.querySelector<HTMLElement>("[data-magnetic]");
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
      ref={navRef}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 48px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        background: scrolled ? "rgba(5,8,22,0.88)" : "rgba(5,8,22,0.45)",
        borderBottom: `1px solid ${scrolled ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.05)"}`,
        transition: "background 0.4s, border-color 0.4s",
      }}
    >
      {/* Logo */}
      <a
        href="#hero"
        style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: "linear-gradient(135deg,#3B82F6,#1D4ED8)",
          display: "grid", placeItems: "center",
          boxShadow: "0 6px 20px rgba(59,130,246,0.4)",
        }}>
          <div style={{ width: 12, height: 12, background: "#fff", borderRadius: 3, transform: "rotate(45deg)" }} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-.03em", color: "#fff" }}>
          ValtiqStay
        </span>
      </a>

      {/* Links */}
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {LINKS.map(([href, label]) => (
          <a
            key={href}
            href={href}
            style={{
              color: "rgba(161,161,170,0.9)",
              textDecoration: "none",
              fontSize: 14.5,
              fontWeight: 500,
              transition: "color .25s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(161,161,170,0.9)")}
          >
            {label}
          </a>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <a
          href="/hotel/login"
          style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14.5, fontWeight: 600 }}
        >
          Sign in
        </a>
        <button
          data-magnetic
          onClick={openDemo}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 22px", borderRadius: 12,
            background: "linear-gradient(135deg,#3B82F6,#2563EB)",
            color: "#fff", border: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 700, fontFamily: "inherit",
            boxShadow: "0 8px 26px rgba(59,130,246,0.4)",
            transition: "box-shadow .25s, transform .25s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(59,130,246,0.55)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 26px rgba(59,130,246,0.4)";
            (e.currentTarget as HTMLElement).style.transform = "";
          }}
        >
          Request Demo
        </button>
      </div>
    </nav>
  );
}
