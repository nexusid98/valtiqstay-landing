"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ── Brand palette ── */
const GOLD   = "#C4A850";
const GOLD_L = "#D9C089";
const NAVY   = "#1B2A4A";

const STEPS = [
  { icon: "📲", title: "Guest scans QR code",       sub: "Or opens the secure link on any device — no app install required." },
  { icon: "🪪", title: "Identity verified in 60 s",  sub: "Encrypted document upload. Checked against your reservation. Done." },
  { icon: "🏨", title: "Room access granted",        sub: "Digital key delivered instantly. No queues. No paper forms." },
];

export default function ArrivalSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hotelRef   = useRef<HTMLDivElement>(null);
  const phoneRef   = useRef<HTMLDivElement>(null);
  const qrRef      = useRef<HTMLDivElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const stepsRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 72%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(hotelRef.current, { scale: 0.75, opacity: 0, y: 60, duration: 1, ease: "power3.out" })
        .from(phoneRef.current, { x: 80,  opacity: 0, duration: 0.9, ease: "power3.out" }, "-=0.6")
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
        background: "linear-gradient(180deg,#060D1C 0%,#080F22 50%,#060D1C 100%)",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 900, height: 600,
        background: "radial-gradient(ellipse, rgba(196,168,80,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: 1180, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80, alignItems: "center",
      }}>
        {/* Visual */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 440 }}>
          <div ref={hotelRef} style={{ position: "relative", zIndex: 2 }}>
            <HotelIcon />
          </div>
          <div ref={phoneRef} style={{ position: "absolute", right: -20, top: 60, zIndex: 3 }}>
            <PhoneCard />
          </div>
          <div ref={qrRef} style={{ position: "absolute", bottom: 30, left: 0, zIndex: 3 }}>
            <QRCard />
          </div>
          {/* Grid lines */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 16,
            background: `linear-gradient(rgba(196,168,80,0.05) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(196,168,80,0.05) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            mask: "radial-gradient(circle, black 30%, transparent 75%)",
            WebkitMask: "radial-gradient(circle, black 30%, transparent 75%)",
          }} />
        </div>

        {/* Text */}
        <div>
          <div ref={textRef}>
            <div style={{
              fontFamily: "var(--font-space-mono,monospace)",
              fontSize: 11.5, letterSpacing: ".14em",
              color: GOLD, marginBottom: 18,
            }}>
              01 / ARRIVAL
            </div>
            <h2 style={{
              margin: "0 0 16px",
              fontSize: "clamp(28px,3.2vw,44px)",
              fontWeight: 700, letterSpacing: "-.035em", lineHeight: 1.1, color: "#fff",
            }}>
              Guests arrive.<br />
              <span style={{
                background: `linear-gradient(90deg,${GOLD},${GOLD_L})`,
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              }}>
                ValtiqStay handles the rest.
              </span>
            </h2>
            <p style={{ margin: "0 0 40px", color: "rgba(240,228,184,0.6)", fontSize: 16.5, lineHeight: 1.7, maxWidth: 420 }}>
              From the moment they scan the QR code to the moment they open their room door — zero friction, zero paperwork.
            </p>
          </div>

          <div ref={stepsRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {STEPS.map(s => (
              <div
                key={s.title}
                style={{
                  display: "flex", gap: 16,
                  padding: "18px 20px", borderRadius: 14,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid rgba(196,168,80,0.12)`,
                  backdropFilter: "blur(8px)",
                  transition: "border-color .25s, background .25s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,168,80,0.32)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(196,168,80,0.05)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,168,80,0.12)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#E8DFC8", marginBottom: 4 }}>{s.title}</div>
                  <div style={{ color: "rgba(240,228,184,0.55)", fontSize: 13.5, lineHeight: 1.55 }}>{s.sub}</div>
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
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: 100, height: 260,
        background: `linear-gradient(180deg,${NAVY},#060D1C)`,
        borderRadius: "4px 4px 0 0",
        border: `1px solid rgba(196,168,80,0.25)`,
        overflow: "hidden",
      }}>
        {Array.from({ length: 30 }, (_, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          const lit = [0,2,5,7,9,11,15,18,22,25,27,29].includes(i);
          return (
            <div key={i} style={{
              position: "absolute",
              left: 14 + col * 28, top: 14 + row * 24,
              width: 16, height: 14, borderRadius: 2,
              background: lit ? "rgba(196,168,80,0.85)" : "rgba(27,42,74,0.5)",
              boxShadow: lit ? `0 0 6px rgba(196,168,80,0.5)` : "none",
            }} />
          );
        })}
      </div>
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        width: 72, height: 160,
        background: `linear-gradient(180deg,${NAVY},#060D1C)`,
        border: `1px solid rgba(196,168,80,0.15)`,
        borderRadius: "4px 4px 0 0",
      }} />
      <div style={{
        position: "absolute", bottom: 0, right: 0,
        width: 72, height: 160,
        background: `linear-gradient(180deg,${NAVY},#060D1C)`,
        border: `1px solid rgba(196,168,80,0.15)`,
        borderRadius: "4px 4px 0 0",
      }} />
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 100, height: 3,
        background: GOLD,
        boxShadow: `0 0 16px 4px rgba(196,168,80,0.6)`,
      }} />
    </div>
  );
}

function PhoneCard() {
  return (
    <div style={{
      width: 130, borderRadius: 18, overflow: "hidden",
      background: "#0C1526",
      border: `1px solid rgba(196,168,80,0.28)`,
      boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,168,80,0.08)`,
      padding: "14px 12px",
    }}>
      <div style={{
        fontSize: 9, color: GOLD, letterSpacing: ".1em", marginBottom: 8,
        fontFamily: "var(--font-space-mono,monospace)",
      }}>CHECK-IN</div>
      <div style={{ width: "80%", height: 5, borderRadius: 3, background: "#fff", marginBottom: 6 }} />
      <div style={{ width: "55%", height: 4, borderRadius: 3, background: "rgba(255,255,255,0.2)", marginBottom: 12 }} />
      <div style={{
        padding: "8px 10px", borderRadius: 8, marginBottom: 10,
        background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)",
      }}>
        <div style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>✓ Verified</div>
      </div>
      <div style={{
        width: "100%", height: 32, borderRadius: 8,
        background: `linear-gradient(135deg,${GOLD},#9C8438)`,
        display: "grid", placeItems: "center",
      }}>
        <span style={{ color: NAVY, fontSize: 10, fontWeight: 700 }}>Access Room</span>
      </div>
    </div>
  );
}

function QRCard() {
  return (
    <div style={{
      padding: "12px 14px", borderRadius: 14,
      background: "rgba(6,13,28,0.9)",
      border: `1px solid rgba(196,168,80,0.28)`,
      backdropFilter: "blur(12px)",
      boxShadow: "0 16px 40px rgba(0,0,0,0.4)",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,10px)", gap: 2 }}>
        {Array.from({ length: 49 }, (_, i) => {
          const qr = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,48,10,11,16,17,24,25,32,33,38,39].includes(i);
          return (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: 1,
              background: qr ? GOLD : "rgba(196,168,80,0.08)",
              boxShadow: qr ? `0 0 4px rgba(196,168,80,0.4)` : "none",
            }} />
          );
        })}
      </div>
      <div style={{
        marginTop: 8, fontSize: 9, color: GOLD_L, textAlign: "center",
        fontFamily: "var(--font-space-mono,monospace)", letterSpacing: ".08em",
      }}>
        SCAN TO CHECK IN
      </div>
    </div>
  );
}
