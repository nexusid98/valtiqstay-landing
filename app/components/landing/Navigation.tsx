"use client";

import { useState, useEffect, useRef } from "react";
import { VLogoMark } from "./LogoMark";
import { useIsMobile } from "@/app/hooks/useIsMobile";

/* ── Brand palette ── */
const GOLD   = "#C4A850";
const GOLD_L = "#D9C089";
const NAVY   = "#1B2A4A";

const LINKS = [
  ["#arrival",   "Platform"],
  ["#checkin",   "Check-in"],
  ["#privacy",   "Privacy"],
  ["#analytics", "Analytics"],
];

export default function Navigation({ openDemo }: { openDemo: () => void }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const isMobile = useIsMobile();
  const btnRef   = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close menu on resize to desktop */
  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  /* magnetic effect on desktop CTA */
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || isMobile) return;
    const move = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    };
    const leave = () => { btn.style.transform = ""; };
    btn.addEventListener("mousemove", move);
    btn.addEventListener("mouseleave", leave);
    return () => { btn.removeEventListener("mousemove", move); btn.removeEventListener("mouseleave", leave); };
  }, [isMobile]);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "14px 20px" : "16px 48px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: scrolled || menuOpen ? "rgba(6,13,28,0.96)" : "rgba(6,13,28,0.55)",
          borderBottom: `1px solid ${scrolled ? "rgba(196,168,80,0.18)" : "rgba(196,168,80,0.07)"}`,
          transition: "background 0.4s, border-color 0.4s",
        }}
      >
        {/* Logo */}
        <a href="#hero" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }} aria-label="ValtiqStay home">
          <VLogoMark size={isMobile ? 28 : 34} />
          <span style={{ fontFamily: "var(--font-cormorant,Georgia,serif)", fontSize: isMobile ? 17 : 20, fontWeight: 600, letterSpacing: "-.01em", lineHeight: 1 }}>
            <span style={{ color: "#ffffff" }}>Valtiq</span>
            <span style={{ color: GOLD }}>Stay</span>
          </span>
        </a>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {LINKS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 14.5, fontWeight: 500, letterSpacing: ".01em", transition: "color .25s" }}
                onMouseEnter={e => (e.currentTarget.style.color = GOLD_L)}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
              >
                {label}
              </a>
            ))}
          </div>
        )}

        {/* Desktop right CTAs */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a
              href="/hotel/login"
              style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14.5, fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              Sign in
            </a>
            <button
              ref={btnRef}
              onClick={openDemo}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 22px", borderRadius: 10,
                background: `linear-gradient(135deg,${GOLD},#9C8438)`,
                color: NAVY, border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                letterSpacing: ".01em",
                boxShadow: "0 8px 26px rgba(196,168,80,0.35)",
                transition: "box-shadow .25s, transform .25s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 36px rgba(196,168,80,0.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 26px rgba(196,168,80,0.35)"; }}
            >
              Request Demo
            </button>
          </div>
        )}

        {/* Mobile: CTA + hamburger */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={openDemo}
              style={{
                padding: "9px 16px", borderRadius: 9,
                background: `linear-gradient(135deg,${GOLD},#9C8438)`,
                color: NAVY, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 700, fontFamily: "inherit",
              }}
            >
              Demo
            </button>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}
            >
              {[0,1,2].map(i => (
                <span key={i} style={{
                  display: "block", width: 22, height: 2, borderRadius: 2,
                  background: GOLD_L,
                  transition: "transform .3s, opacity .3s",
                  transform: menuOpen
                    ? i === 0 ? "translateY(7px) rotate(45deg)"
                    : i === 2 ? "translateY(-7px) rotate(-45deg)"
                    : "scaleX(0)"
                    : "none",
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        )}
      </nav>

      {/* Mobile drawer */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: 57, left: 0, right: 0,
          zIndex: 99,
          background: "rgba(6,13,28,0.97)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(196,168,80,0.12)",
          padding: "20px 24px 28px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {LINKS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: "rgba(255,255,255,0.7)", textDecoration: "none",
                fontSize: 17, fontWeight: 500,
                padding: "13px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                transition: "color .2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = GOLD_L)}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              {label}
            </a>
          ))}
          <a
            href="/hotel/login"
            style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: 15, paddingTop: 16 }}
          >
            Hotel Staff Login →
          </a>
        </div>
      )}
    </>
  );
}
