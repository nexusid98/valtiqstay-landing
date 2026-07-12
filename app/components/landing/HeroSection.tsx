"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { VLogoMark } from "./LogoMark";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/* ── Brand palette ── */
const GOLD      = "#C4A850";
const GOLD_L    = "#D9C089";
const CHAMPAGNE = "#F0E4B8";
const NAVY      = "#1B2A4A";

const HEADLINE  = "The Operating System\nfor Modern Hospitality";
const SUB       = "Digital check-in, guest verification, and privacy-first hotel intelligence in one platform.";
const TAGLINE   = "TRUST  ·  IDENTITY  ·  CONNECTION";

export default function HeroSection({ openDemo }: { openDemo: () => void }) {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = textRef.current?.querySelectorAll<HTMLElement>("[data-hero-in]");
    if (!els?.length) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    els.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(32px)";
      timers.push(setTimeout(() => {
        el.style.transition = "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 220 + i * 140));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 700,
        background:
          "radial-gradient(ellipse 110% 80% at 55% 38%, rgba(196,168,80,0.12) 0%, transparent 60%), #060D1C",
        overflow: "hidden",
      }}
    >
      {/* 3D canvas */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <HeroScene />
      </div>

      {/* Bottom fade */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "38%",
          background: "linear-gradient(to top, #060D1C, transparent)",
          zIndex: 2, pointerEvents: "none",
        }}
      />

      {/* Text overlay */}
      <div
        ref={textRef}
        style={{
          position: "absolute",
          bottom: "9%", left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          textAlign: "center",
          width: "100%",
          padding: "0 24px",
        }}
      >
        {/* Tagline pill */}
        <div
          data-hero-in
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            marginBottom: 26,
            padding: "7px 18px",
            borderRadius: 100,
            border: `1px solid rgba(196,168,80,0.35)`,
            background: "rgba(196,168,80,0.07)",
            backdropFilter: "blur(10px)",
          }}
        >
          <VLogoMark size={18} />
          <span style={{
            fontFamily: "var(--font-space-mono, monospace)",
            fontSize: 11,
            letterSpacing: ".14em",
            color: GOLD_L,
          }}>
            {TAGLINE}
          </span>
        </div>

        {/* H1 */}
        <h1
          data-hero-in
          style={{
            margin: "0 auto 20px",
            maxWidth: 840,
            fontSize: "clamp(38px,6.5vw,88px)",
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-.04em",
            color: "#fff",
            fontFamily: "var(--font-manrope, sans-serif)",
          }}
        >
          {HEADLINE.split("\n").map((line, i) => (
            <span key={i} style={{ display: "block" }}>
              {i === 1 ? (
                <span style={{
                  background: `linear-gradient(90deg,${GOLD},${GOLD_L} 50%,${CHAMPAGNE})`,
                  WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                }}>
                  {line}
                </span>
              ) : line}
            </span>
          ))}
        </h1>

        {/* Sub */}
        <p
          data-hero-in
          style={{
            margin: "0 auto 36px",
            maxWidth: 560,
            fontSize: "clamp(15px,1.6vw,18px)",
            lineHeight: 1.65,
            color: "rgba(240,228,184,0.65)",
          }}
        >
          {SUB}
        </p>

        {/* CTAs */}
        <div
          data-hero-in
          style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}
        >
          <button
            onClick={openDemo}
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "15px 30px", borderRadius: 12,
              background: `linear-gradient(135deg,${GOLD},#9C8438)`,
              color: NAVY, border: "none", cursor: "pointer",
              fontSize: 15.5, fontWeight: 700, fontFamily: "inherit",
              boxShadow: `0 14px 40px rgba(196,168,80,0.4)`,
              transition: "transform .25s, box-shadow .25s",
              letterSpacing: ".01em",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 52px rgba(196,168,80,0.55)`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "";
              (e.currentTarget as HTMLElement).style.boxShadow = `0 14px 40px rgba(196,168,80,0.4)`;
            }}
          >
            Request Demo <span style={{ fontSize: 17 }}>→</span>
          </button>

          <a
            href="#analytics"
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "15px 28px", borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              border: `1px solid rgba(196,168,80,0.2)`,
              color: CHAMPAGNE, textDecoration: "none",
              fontSize: 15.5, fontWeight: 600,
              backdropFilter: "blur(10px)",
              transition: "background .25s, border-color .25s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(196,168,80,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = `rgba(196,168,80,0.38)`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.borderColor = `rgba(196,168,80,0.2)`;
            }}
          >
            Watch Platform Tour
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%",
        transform: "translateX(-50%)",
        zIndex: 3,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        opacity: 0.45,
      }}>
        <span style={{
          fontSize: 10, letterSpacing: ".14em",
          color: GOLD_L,
          fontFamily: "var(--font-space-mono,monospace)",
        }}>
          SCROLL
        </span>
        <div style={{
          width: 1, height: 40,
          background: `linear-gradient(to bottom, ${GOLD}, transparent)`,
        }} />
      </div>
    </section>
  );
}
