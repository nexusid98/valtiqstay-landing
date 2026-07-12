"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { icon: "📲", title: "Guest scans QR code", sub: "Or opens the secure link on any device — no app install required." },
  { icon: "🪪", title: "Identity verified in 60 s", sub: "Encrypted document upload. Checked against your reservation. Done." },
  { icon: "🏨", title: "Room access granted", sub: "Digital key delivered instantly. No queues. No paper forms." },
];

export default function ArrivalSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const hotelRef    = useRef<HTMLDivElement>(null);
  const phoneRef    = useRef<HTMLDivElement>(null);
  const qrRef       = useRef<HTMLDivElement>(null);
  const textRef     = useRef<HTMLDivElement>(null);
  const stepsRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* entrance: hotel scales up, phone slides in, QR pulses */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(hotelRef.current, { scale: 0.7, opacity: 0, y: 60, duration: 1, ease: "power3.out" })
        .from(phoneRef.current, { x: 80, opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.6")
        .from(qrRef.current,    { scale: 0, opacity: 0, rotation: -20, duration: 0.8, ease: "back.out(1.4)" }, "-=0.5")
        .from(textRef.current,  { x: -50, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.9")
        .from(stepsRef.current?.children ?? [], {
          y: 30, opacity: 0, stagger: 0.14, duration: 0.7, ease: "power3.out",
        }, "-=0.5");
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="arrival"
      style={{
        position: "relative",
        padding: "140px 48px",
        background: "linear-gradient(180deg,#050816 0%,#060C1E 50%,#050816 100%)",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 900, height: 600,
        background: "radial-gradient(ellipse, rgba(29,78,216,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: 1180, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80, alignItems: "center",
      }}>
        {/* Visual side — hotel icon + phone + QR */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 440 }}>
          {/* Hotel silhouette */}
          <div ref={hotelRef} style={{ position: "relative", zIndex: 2 }}>
            <HotelIcon />
          </div>

          {/* Floating phone */}
          <div ref={phoneRef} style={{ position: "absolute", right: -20, top: 60, zIndex: 3 }}>
            <PhoneCard />
          </div>

          {/* QR card */}
          <div ref={qrRef} style={{ position: "absolute", bottom: 30, left: 0, zIndex: 3 }}>
            <QRCard />
          </div>

          {/* Grid lines */}
          <div style={{
            position: "absolute", inset: 0,
            background: `
              linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            borderRadius: 16,
            mask: "radial-gradient(circle, black 30%, transparent 75%)",
            WebkitMask: "radial-gradient(circle, black 30%, transparent 75%)",
          }} />
        </div>

        {/* Text side */}
        <div>
          <div ref={textRef}>
            <div style={{
              fontFamily: "var(--font-space-mono,monospace)",
              fontSize: 11.5, letterSpacing: ".14em",
              color: "#60A5FA", marginBottom: 18,
            }}>
              01 / ARRIVAL
            </div>
            <h2 style={{
              margin: "0 0 16px", fontSize: "clamp(28px,3.2vw,44px)",
              fontWeight: 700, letterSpacing: "-.035em", lineHeight: 1.1, color: "#fff",
            }}>
              Guests arrive.<br />
              <span style={{
                background: "linear-gradient(90deg,#60A5FA,#93C5FD)",
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              }}>
                ValtiqStay handles the rest.
              </span>
            </h2>
            <p style={{ margin: "0 0 40px", color: "#A1A1AA", fontSize: 16.5, lineHeight: 1.7, maxWidth: 420 }}>
              From the moment they scan the QR code to the moment they open their room door — zero friction, zero paperwork.
            </p>
          </div>

          <div ref={stepsRef} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {STEPS.map((s) => (
              <div key={s.title} style={{
                display: "flex", gap: 16,
                padding: "20px 22px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(59,130,246,0.12)",
                backdropFilter: "blur(8px)",
                transition: "border-color .25s, background .25s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.3)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(59,130,246,0.06)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.12)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#E2E8F0", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ color: "#A1A1AA", fontSize: 13.5, lineHeight: 1.55 }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Sub-components ── */
function HotelIcon() {
  return (
    <div style={{ position: "relative", width: 220, height: 320 }}>
      {/* tower */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: 100, height: 260,
        background: "linear-gradient(180deg,#1E3A8A,#0A1931)",
        borderRadius: "4px 4px 0 0",
        border: "1px solid rgba(59,130,246,0.3)",
        overflow: "hidden",
      }}>
        {/* windows grid */}
        {Array.from({ length: 30 }, (_, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          const lit = [0,2,5,7,9,11,15,18,22,25,27,29].includes(i);
          return (
            <div key={i} style={{
              position: "absolute",
              left: 14 + col * 28, top: 14 + row * 24,
              width: 16, height: 14, borderRadius: 2,
              background: lit ? "rgba(96,165,250,0.85)" : "rgba(30,58,138,0.5)",
              boxShadow: lit ? "0 0 6px rgba(96,165,250,0.5)" : "none",
            }} />
          );
        })}
      </div>
      {/* wings */}
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        width: 72, height: 160,
        background: "linear-gradient(180deg,#1E3A8A,#0B1C3A)",
        border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: "4px 4px 0 0",
      }} />
      <div style={{
        position: "absolute", bottom: 0, right: 0,
        width: 72, height: 160,
        background: "linear-gradient(180deg,#1E3A8A,#0B1C3A)",
        border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: "4px 4px 0 0",
      }} />
      {/* roof glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 100, height: 3,
        background: "#3B82F6",
        boxShadow: "0 0 16px 4px rgba(59,130,246,0.6)",
      }} />
    </div>
  );
}

function PhoneCard() {
  return (
    <div style={{
      width: 130, borderRadius: 18, overflow: "hidden",
      background: "#0F172A",
      border: "1px solid rgba(59,130,246,0.3)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.1)",
      padding: "14px 12px",
    }}>
      <div style={{ fontSize: 9, color: "#60A5FA", letterSpacing: ".1em", marginBottom: 8, fontFamily: "var(--font-space-mono,monospace)" }}>CHECK-IN</div>
      <div style={{ width: "80%", height: 5, borderRadius: 3, background: "#fff", marginBottom: 6 }} />
      <div style={{ width: "55%", height: 4, borderRadius: 3, background: "rgba(161,161,170,0.4)", marginBottom: 12 }} />
      <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>✓ Verified</div>
      </div>
      <div style={{ width: "100%", height: 32, borderRadius: 8, background: "linear-gradient(135deg,#3B82F6,#2563EB)", display: "grid", placeItems: "center" }}>
        <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>Access Room</span>
      </div>
    </div>
  );
}

function QRCard() {
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 14,
      background: "rgba(5,8,22,0.85)",
      border: "1px solid rgba(59,130,246,0.3)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,10px)", gap: 2 }}>
        {Array.from({ length: 49 }, (_, i) => {
          const qr = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,48,
            10,11,16,17,24,25,32,33,38,39].includes(i);
          return (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: 1,
              background: qr ? "#3B82F6" : "rgba(59,130,246,0.08)",
              boxShadow: qr ? "0 0 4px rgba(59,130,246,0.4)" : "none",
            }} />
          );
        })}
      </div>
      <div style={{ marginTop: 8, fontSize: 9, color: "#60A5FA", textAlign: "center", fontFamily: "var(--font-space-mono,monospace)", letterSpacing: ".08em" }}>
        SCAN TO CHECK IN
      </div>
    </div>
  );
}
