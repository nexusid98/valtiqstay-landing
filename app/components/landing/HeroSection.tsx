"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const HEADLINE = "The Operating System\nfor Modern Hospitality";
const SUB = "Digital check-in, guest verification, and privacy-first hotel intelligence in one platform.";

export default function HeroSection({
  openDemo,
}: {
  openDemo: () => void;
}) {
  const textRef = useRef<HTMLDivElement>(null);

  /* entrance animation */
  useEffect(() => {
    const els = textRef.current?.querySelectorAll<HTMLElement>("[data-hero-in]");
    if (!els?.length) return;
    els.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(32px)";
      const timer = setTimeout(() => {
        el.style.transition = "opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 200 + i * 130);
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 700,
        background: "radial-gradient(ellipse 110% 80% at 55% 40%, rgba(29,78,216,0.18) 0%, transparent 65%), #050816",
        overflow: "hidden",
      }}
    >
      {/* 3D Canvas — fills the whole section */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <HeroScene />
      </div>

      {/* Bottom gradient fade so content below reads cleanly */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "35%",
          background: "linear-gradient(to top, #050816, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Text overlay */}
      <div
        ref={textRef}
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          textAlign: "center",
          width: "100%",
          padding: "0 24px",
        }}
      >
        {/* Eyebrow */}
        <div
          data-hero-in
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
            padding: "6px 14px",
            borderRadius: 100,
            border: "1px solid rgba(59,130,246,0.35)",
            background: "rgba(59,130,246,0.08)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#3B82F6",
            boxShadow: "0 0 8px #3B82F6",
            animation: "hPulse 2s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: "var(--font-space-mono, monospace)",
            fontSize: 11.5,
            letterSpacing: ".12em",
            color: "#93C5FD",
          }}>
            NEXT-GEN HOSPITALITY OS
          </span>
        </div>

        {/* H1 */}
        <h1
          data-hero-in
          style={{
            margin: "0 auto 20px",
            maxWidth: 820,
            fontSize: "clamp(38px,6.5vw,86px)",
            fontWeight: 700,
            lineHeight: 1.0,
            letterSpacing: "-.04em",
            color: "#fff",
            whiteSpace: "pre-line",
          }}
        >
          {HEADLINE.split("\n").map((line, i) => (
            <span key={i} style={{ display: "block" }}>
              {i === 1
                ? <span style={{ background: "linear-gradient(90deg,#60A5FA,#3B82F6 50%,#93C5FD)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{line}</span>
                : line
              }
            </span>
          ))}
        </h1>

        {/* Subheadline */}
        <p
          data-hero-in
          style={{
            margin: "0 auto 36px",
            maxWidth: 560,
            fontSize: "clamp(15px,1.6vw,18px)",
            lineHeight: 1.65,
            color: "#A1A1AA",
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
              padding: "15px 28px", borderRadius: 14,
              background: "linear-gradient(135deg,#3B82F6,#2563EB)",
              color: "#fff", border: "none", cursor: "pointer",
              fontSize: 15.5, fontWeight: 700, fontFamily: "inherit",
              boxShadow: "0 14px 40px rgba(59,130,246,0.45)",
              transition: "transform .25s, box-shadow .25s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 50px rgba(59,130,246,0.55)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(59,130,246,0.45)";
            }}
          >
            Request Demo
            <span style={{ fontSize: 18 }}>→</span>
          </button>

          <a
            href="#analytics"
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              padding: "15px 28px", borderRadius: 14,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#E2E8F0", textDecoration: "none",
              fontSize: 15.5, fontWeight: 600,
              backdropFilter: "blur(10px)",
              transition: "background .25s, border-color .25s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
            }}
          >
            Watch Platform Tour
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 32, left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: 0.5,
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: ".12em", color: "#A1A1AA", fontFamily: "var(--font-space-mono,monospace)" }}>SCROLL</span>
        <div style={{
          width: 1, height: 40,
          background: "linear-gradient(to bottom, rgba(59,130,246,0.6), transparent)",
        }} />
      </div>

      <style>{`
        @keyframes hPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #3B82F6; }
          50% { opacity: 0.5; box-shadow: 0 0 14px #3B82F6; }
        }
      `}</style>
    </section>
  );
}
