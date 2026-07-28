"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "@/app/hooks/useIsMobile";

gsap.registerPlugin(ScrollTrigger);

/* ── Brand palette ── */
const GOLD   = "#C4A850";
const GOLD_L = "#D9C089";

const NODES = [
  { label: "Grand Azure",       x: 50, y: 10, primary: true },
  { label: "Hotel Montis",      x: 82, y: 35 },
  { label: "Palazzo Sereno",    x: 72, y: 72 },
  { label: "The Meridian",      x: 28, y: 72 },
  { label: "Villa Bianca",      x: 18, y: 35 },
  { label: "Le Grand Palais",   x: 50, y: 48, inner: true },
];

const EDGES = [
  [0, 1], [0, 4], [0, 5],
  [1, 2], [1, 5],
  [2, 3], [2, 5],
  [3, 4], [3, 5],
  [4, 5],
];

const PILLARS = [
  { icon: "🔒", title: "Zero-knowledge reputation", body: "Hotels share pattern signals, never PII. Guests are represented as encrypted identifiers only." },
  { icon: "🧩", title: "Privacy by design", body: "GDPR Article 25 compliant. Data minimisation baked in from day one — not bolted on after." },
  { icon: "📡", title: "Federated intelligence", body: "Every member hotel improves the network. No centralised data lake. No single point of failure." },
];

export default function PrivacySection() {
  const isMobile   = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const circles = svgRef.current?.querySelectorAll("circle.node-dot") ?? [];
      const labels  = svgRef.current?.querySelectorAll("text.node-label") ?? [];
      const lines   = svgRef.current?.querySelectorAll("line.edge-line") ?? [];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(textRef.current, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" })
        .from(lines, { strokeDashoffset: 200, opacity: 0, duration: 1, stagger: 0.08, ease: "power2.out" }, "-=0.3")
        .from(circles, { scale: 0, transformOrigin: "center", stagger: 0.09, duration: 0.6, ease: "back.out(1.6)" }, "-=0.7")
        .from(labels,  { opacity: 0, y: 4, stagger: 0.07, duration: 0.5 }, "-=0.4")
        .from(pillarsRef.current?.children ?? [], {
          y: 30, opacity: 0, stagger: 0.14, duration: 0.7, ease: "power3.out",
        }, "-=0.5");

      gsap.to(svgRef.current?.querySelector("circle.central-glow") ?? {}, {
        r: 32, opacity: 0, duration: 1.8, repeat: -1, ease: "power1.out",
      });
    });

    return () => ctx.revert();
  }, []);

  const vb = 100;

  return (
    <section
      ref={sectionRef}
      id="privacy"
      style={{
        padding: isMobile ? "80px 24px" : "140px 48px",
        background: "linear-gradient(180deg,#060D1C,#04091A 50%,#060D1C)",
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
            03 / PRIVACY NETWORK
          </div>
          <h2 style={{
            margin: "0 auto 18px", maxWidth: 700,
            fontSize: "clamp(28px,3.2vw,46px)", fontWeight: 700,
            letterSpacing: "-.035em", lineHeight: 1.12, color: "#fff",
          }}>
            Hotels gain operational insight{" "}
            <span style={{
              background: `linear-gradient(90deg,${GOLD},${GOLD_L})`,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>
              without compromising guest privacy.
            </span>
          </h2>
          <p style={{
            margin: "0 auto", maxWidth: 560,
            color: "rgba(240,228,184,0.6)", fontSize: 16.5, lineHeight: 1.7,
          }}>
            A federated reputation layer that connects properties, not profiles.
            Intelligence flows without personal data ever leaving the property.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 40 : 80,
          alignItems: "center",
          marginBottom: isMobile ? 40 : 80,
        }}>
          {/* Network SVG */}
          <div style={{
            position: "relative",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(196,168,80,0.12)",
            borderRadius: 20,
            padding: 24,
            aspectRatio: "1",
          }}>
            <svg ref={svgRef} viewBox={`0 0 ${vb} ${vb}`} style={{ width: "100%", height: "100%" }}>
              {/* edge lines */}
              {EDGES.map(([a, b], i) => {
                const na = NODES[a], nb = NODES[b];
                return (
                  <line
                    key={i}
                    className="edge-line"
                    x1={na.x} y1={na.y}
                    x2={nb.x} y2={nb.y}
                    stroke="rgba(196,168,80,0.3)"
                    strokeWidth="0.5"
                    strokeDasharray="200"
                    strokeDashoffset="0"
                  />
                );
              })}

              {/* node dots */}
              {NODES.map((n, i) => (
                <g key={i}>
                  {n.primary && (
                    <>
                      <circle className="central-glow" cx={n.x} cy={n.y} r={14} fill="rgba(196,168,80,0.15)" />
                      <circle cx={n.x} cy={n.y} r={8} fill="rgba(196,168,80,0.2)" />
                    </>
                  )}
                  {n.inner && (
                    <circle cx={n.x} cy={n.y} r={6} fill="rgba(217,192,137,0.1)" />
                  )}
                  <circle
                    className="node-dot"
                    cx={n.x} cy={n.y}
                    r={n.primary ? 5 : n.inner ? 3.5 : 2.8}
                    fill={n.primary ? GOLD : n.inner ? GOLD_L : "#9C8438"}
                    stroke={n.primary ? GOLD_L : "rgba(196,168,80,0.5)"}
                    strokeWidth={n.primary ? 0.8 : 0.4}
                  />
                  <text
                    className="node-label"
                    x={n.x}
                    y={n.y + (n.primary ? 9 : n.inner ? 7 : 6.5)}
                    textAnchor="middle"
                    fontSize={n.primary ? 3.5 : 3}
                    fill={n.primary ? GOLD_L : GOLD}
                    fontFamily="var(--font-space-mono,monospace)"
                  >
                    {n.label}
                  </text>
                </g>
              ))}

              {/* animated travel dots */}
              {[0, 1, 2].map(i => (
                <circle key={`t${i}`} r={0.8} fill={GOLD_L} opacity={0.7}>
                  <animateMotion
                    dur={`${2.5 + i * 0.7}s`}
                    repeatCount="indefinite"
                    begin={`${i * 0.9}s`}
                  >
                    <mpath xlinkHref={`#edge-path-${i}`} />
                  </animateMotion>
                </circle>
              ))}

              {/* hidden paths for animateMotion */}
              <defs>
                {[[0,1],[2,5],[3,4]].map(([a, b], i) => (
                  <path
                    key={i}
                    id={`edge-path-${i}`}
                    d={`M ${NODES[a].x} ${NODES[a].y} L ${NODES[b].x} ${NODES[b].y}`}
                    fill="none"
                  />
                ))}
              </defs>
            </svg>

            {/* Corner label */}
            <div style={{
              position: "absolute", top: 16, left: 16,
              fontFamily: "var(--font-space-mono,monospace)",
              fontSize: 9, color: GOLD, letterSpacing: ".1em",
            }}>
              LIVE NETWORK
            </div>
            <div style={{
              position: "absolute", bottom: 16, right: 16,
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 10, color: "#10B981",
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
              {NODES.length} hotels connected
            </div>
          </div>

          {/* Text */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div style={{
              padding: "18px 22px", borderRadius: 14,
              background: "rgba(16,185,129,0.06)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#10B981", marginBottom: 6 }}>
                🛡️ No personal data shared between hotels
              </div>
              <div style={{ fontSize: 13.5, color: "rgba(240,228,184,0.55)", lineHeight: 1.6 }}>
                Guest identity is hashed before any signal leaves your property.
                Participating hotels see risk patterns — never names, never documents.
              </div>
            </div>
            <div style={{
              padding: "18px 22px", borderRadius: 14,
              background: "rgba(196,168,80,0.04)",
              border: "1px solid rgba(196,168,80,0.15)",
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: GOLD_L, marginBottom: 6 }}>
                📋 Fully GDPR Art. 25 compliant
              </div>
              <div style={{ fontSize: 13.5, color: "rgba(240,228,184,0.55)", lineHeight: 1.6 }}>
                Privacy Impact Assessment completed. DPA-ready data processing agreements included for every member hotel.
              </div>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div ref={pillarsRef} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 16 }}>
          {PILLARS.map(p => (
            <div
              key={p.title}
              style={{
                padding: "28px 26px", borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(196,168,80,0.1)",
                transition: "border-color .25s, transform .25s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,168,80,0.28)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,168,80,0.1)";
                (e.currentTarget as HTMLElement).style.transform = "";
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 14 }}>{p.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#E8DFC8", marginBottom: 8 }}>{p.title}</div>
              <div style={{ color: "rgba(240,228,184,0.55)", fontSize: 14, lineHeight: 1.65 }}>{p.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
