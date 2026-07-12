"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useIsMobile } from "@/app/hooks/useIsMobile";

gsap.registerPlugin(ScrollTrigger);

/* ── Brand palette ── */
const GOLD   = "#C4A850";
const GOLD_L = "#D9C089";
const NAVY   = "#1B2A4A";

const METRICS = [
  { label: "Avg. check-in time",    from: 0, to: 8,   suffix: "s",  colour: "#10B981", note: "vs. 4–8 min at front desk" },
  { label: "Document completeness", from: 0, to: 99,  suffix: "%",  colour: GOLD,      note: "across all arrivals" },
  { label: "Guest satisfaction",    from: 0, to: 4.9, suffix: "★",  colour: GOLD_L,    note: "avg. post-stay rating" },
  { label: "Staff time saved",      from: 0, to: 3.2, suffix: "h",  colour: "#10B981", note: "per 10 arrivals" },
];

const BARS = [42, 57, 63, 48, 71, 65, 78, 69, 82, 74, 88, 91];

const TABS = ["Overview", "Arrivals", "Guests", "Upsells", "Reports"];

export default function AnalyticsSection() {
  const isMobile   = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const textRef    = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const dashRef    = useRef<HTMLDivElement>(null);
  const barsRef    = useRef<(HTMLDivElement | null)[]>([]);
  const numbersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(textRef.current, { y: 40, opacity: 0, duration: 0.8, ease: "power3.out" })
        .from(metricsRef.current?.children ?? [], {
          y: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out",
        }, "-=0.4")
        .from(dashRef.current, { y: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.5");

      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.from(bar, {
          scaleY: 0, transformOrigin: "bottom",
          duration: 0.7, delay: 0.4 + i * 0.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
        });
      });

      METRICS.forEach((m, i) => {
        const el = numbersRef.current[i];
        if (!el) return;
        gsap.to({ val: m.from }, {
          val: m.to,
          duration: 1.6,
          delay: 0.6 + i * 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
          onUpdate: function(this: gsap.core.Tween) {
            if (el) {
              const v = this.targets()[0] as { val: number };
              el.textContent = m.to < 10
                ? v.val.toFixed(1)
                : Math.round(v.val).toString();
            }
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="analytics"
      style={{
        padding: isMobile ? "80px 24px" : "140px 48px",
        background: "linear-gradient(180deg,#060D1C,#080F22 50%,#060D1C)",
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* Header */}
        <div ref={textRef} style={{ textAlign: "center", marginBottom: 70 }}>
          <div style={{
            fontFamily: "var(--font-space-mono,monospace)",
            fontSize: 11.5, letterSpacing: ".14em", color: GOLD, marginBottom: 16,
          }}>
            04 / ANALYTICS DASHBOARD
          </div>
          <h2 style={{
            margin: "0 auto 18px", maxWidth: 680,
            fontSize: "clamp(28px,3.2vw,46px)", fontWeight: 700,
            letterSpacing: "-.035em", lineHeight: 1.12, color: "#fff",
          }}>
            Turn every guest interaction into{" "}
            <span style={{
              background: `linear-gradient(90deg,${GOLD},${GOLD_L})`,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>
              operational clarity.
            </span>
          </h2>
          <p style={{
            margin: "0 auto", maxWidth: 520,
            color: "rgba(240,228,184,0.6)", fontSize: 16.5, lineHeight: 1.7,
          }}>
            Real-time dashboards, completion funnels, upsell attribution — all in one pane of glass.
          </p>
        </div>

        {/* Metric tiles */}
        <div
          ref={metricsRef}
          style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 32 : 52 }}
        >
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              style={{
                padding: "24px 22px", borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(196,168,80,0.1)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div style={{
                fontSize: "clamp(30px,3.2vw,42px)", fontWeight: 800,
                letterSpacing: "-.04em", lineHeight: 1, color: m.colour,
                marginBottom: 6,
              }}>
                <span ref={el => { numbersRef.current[i] = el; }}>{m.from}</span>
                <span style={{ fontSize: "0.55em", fontWeight: 600 }}>{m.suffix}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#E8DFC8", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 12, color: "rgba(240,228,184,0.4)" }}>{m.note}</div>
              <div style={{ marginTop: 12, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                <div style={{ width: "75%", height: "100%", background: `linear-gradient(90deg,${m.colour}44,${m.colour})`, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard mockup — hidden on mobile */}
        <div
          ref={dashRef}
          style={{
            display: isMobile ? "none" : undefined,
            borderRadius: 20,
            background: "#080F1E",
            border: "1px solid rgba(196,168,80,0.1)",
            boxShadow: "0 60px 140px rgba(0,0,0,0.6), inset 0 1px 0 rgba(196,168,80,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Browser chrome */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(255,255,255,0.02)",
          }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["#FF5F57","#FEBC2E","#28C840"].map(c => (
                <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
              ))}
            </div>
            <div style={{
              marginLeft: 12,
              fontFamily: "var(--font-space-mono,monospace)",
              fontSize: 11.5, color: "rgba(255,255,255,0.28)",
            }}>
              app.valtiqstay.com/dashboard
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#10B981" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
              Live sync
            </div>
          </div>

          {/* App layout */}
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
            {/* Sidebar */}
            <div style={{
              borderRight: "1px solid rgba(255,255,255,0.05)",
              padding: "16px 12px",
              display: "flex", flexDirection: "column", gap: 3,
            }}>
              <div style={{
                fontFamily: "var(--font-space-mono,monospace)",
                fontSize: 9.5, letterSpacing: ".12em",
                color: "rgba(255,255,255,0.22)",
                padding: "6px 10px 10px",
              }}>
                GRAND AZURE RESORT
              </div>
              {TABS.map((t, i) => (
                <div key={t} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 8,
                  background: i === 0 ? "rgba(196,168,80,0.12)" : "transparent",
                  color: i === 0 ? "#fff" : "rgba(255,255,255,0.4)",
                  fontSize: 13, fontWeight: i === 0 ? 600 : 400,
                }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: 2,
                    background: i === 0 ? GOLD : "rgba(255,255,255,0.18)",
                  }} />
                  {t}
                </div>
              ))}
            </div>

            {/* Main */}
            <div style={{ padding: "22px 26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Good morning, Elena</div>
                  <div style={{ fontSize: 12.5, color: "rgba(240,228,184,0.4)", marginTop: 3 }}>Thursday, 2 July · 148 rooms</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{
                    padding: "6px 12px", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 12, color: "rgba(255,255,255,0.45)",
                  }}>Today</span>
                  <span style={{
                    padding: "6px 12px", borderRadius: 8,
                    background: "rgba(196,168,80,0.14)", color: GOLD_L,
                    fontSize: 12, fontWeight: 600,
                  }}>+ New booking</span>
                </div>
              </div>

              {/* Chart */}
              <div style={{
                padding: "20px 22px", borderRadius: 14,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#E8DFC8" }}>
                    Occupancy · last 12 days
                  </span>
                  <span style={{ fontSize: 12, color: "#10B981" }}>↑ 8.4% vs last period</span>
                </div>
                <div style={{
                  display: "flex", alignItems: "flex-end", gap: 7,
                  height: 80,
                }}>
                  {BARS.map((h, i) => (
                    <div
                      key={i}
                      ref={el => { barsRef.current[i] = el; }}
                      style={{
                        flex: 1, height: `${h}%`,
                        background: i === BARS.length - 1 || i === BARS.length - 2
                          ? `linear-gradient(180deg,${GOLD},rgba(196,168,80,0.3))`
                          : `linear-gradient(180deg,rgba(196,168,80,0.45),rgba(196,168,80,0.12))`,
                        borderRadius: "3px 3px 0 0",
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  {["Jun 21","Jun 25","Jun 29","Jul 2"].map(d => (
                    <span key={d} style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
