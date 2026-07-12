"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Hotel Login",    href: "/hotel/login" },
  { label: "LinkedIn",       href: "https://linkedin.com/company/valtiqstay" },
];

export default function FinalSection({ openDemo }: { openDemo: () => void }) {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const textRef     = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const rafId       = useRef<number>(0);

  /* particle convergence canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let triggered = false;
    let progress  = 0;

    const BLUE = "#3B82F6";
    const N = 180;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* seed random */
    let s = 9876;
    const rng = () => { s = (s * 1664525 + 1013904223) | 0; return (s >>> 0) / 4294967296; };

    const particles = Array.from({ length: N }, () => ({
      x: rng() * canvas.width,
      y: rng() * canvas.height,
      vx: (rng() - 0.5) * 1.4,
      vy: (rng() - 0.5) * 1.4,
      size: rng() * 2.5 + 0.6,
      opacity: rng() * 0.6 + 0.2,
      phase: rng() * Math.PI * 2,
    }));

    const draw = (ts: number) => {
      const t = ts * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width  / 2;
      const cy = canvas.height / 2;

      if (triggered) progress = Math.min(1, progress + 0.008);

      particles.forEach((p) => {
        const ease = progress < 0.5
          ? 4 * progress ** 3
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (triggered) {
          p.x += (cx - p.x) * 0.02 * ease;
          p.y += (cy - p.y) * 0.02 * ease;
        } else {
          p.x += p.vx + Math.sin(t * 0.4 + p.phase) * 0.3;
          p.y += p.vy + Math.cos(t * 0.3 + p.phase) * 0.3;
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width)  p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        }

        const a = p.opacity * (0.6 + Math.sin(t + p.phase) * 0.2) * (1 - ease * 0.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + ease * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${a})`;
        ctx.fill();

        /* draw faint lines between close particles when converging */
        if (progress > 0.3) {
          particles.forEach(q => {
            const dx = q.x - p.x, dy = q.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 60 && dist > 0) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = `rgba(59,130,246,${(1 - dist / 60) * 0.12 * (progress - 0.3) / 0.7})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        }
      });

      /* central glow when converged */
      if (progress > 0.6) {
        const alpha = (progress - 0.6) / 0.4;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 * alpha);
        grad.addColorStop(0, `rgba(59,130,246,${0.35 * alpha})`);
        grad.addColorStop(1, "rgba(59,130,246,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      rafId.current = requestAnimationFrame(draw);
    };

    rafId.current = requestAnimationFrame(draw);

    /* trigger convergence on scroll */
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 60%",
      onEnter: () => { triggered = true; },
    });

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId.current);
      st.kill();
    };
  }, []);

  /* text reveals */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 55%",
          toggleActions: "play none none reverse",
        },
      });
      tl.from(textRef.current?.children ?? [], {
        y: 40, opacity: 0, stagger: 0.15, duration: 0.9, ease: "power3.out", delay: 0.4,
      })
        .from(ctaRef.current, { scale: 0.85, opacity: 0, duration: 0.8, ease: "back.out(1.6)" }, "-=0.4");
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        style={{
          position: "relative",
          padding: "160px 48px 120px",
          textAlign: "center",
          overflow: "hidden",
          background: "linear-gradient(180deg,#050816 0%,#04071A 40%,#050816 100%)",
        }}
      >
        {/* Particle canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            pointerEvents: "none", zIndex: 1,
          }}
        />

        {/* Background glow rings */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(29,78,216,0.18) 0%, transparent 65%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Text */}
          <div ref={textRef}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              border: "1px solid rgba(59,130,246,0.3)",
              background: "rgba(59,130,246,0.07)",
              fontFamily: "var(--font-space-mono,monospace)",
              fontSize: 11, letterSpacing: ".14em",
              color: "#60A5FA", marginBottom: 28,
            }}>
              ◆ EARLY ACCESS NOW OPEN
            </div>

            <h2 style={{
              margin: "0 auto 20px", maxWidth: 700,
              fontSize: "clamp(40px,6vw,80px)",
              fontWeight: 700, letterSpacing: "-.045em", lineHeight: 1.0,
              color: "#fff",
            }}>
              Hospitality,{" "}
              <span style={{
                background: "linear-gradient(90deg,#3B82F6,#60A5FA 50%,#93C5FD)",
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              }}>
                Reimagined.
              </span>
            </h2>

            <p style={{
              margin: "0 auto 52px", maxWidth: 480,
              color: "#A1A1AA", fontSize: 17, lineHeight: 1.7,
            }}>
              Join the hotels redefining the guest experience with
              ValtiqStay — the only platform built for the era of
              digital hospitality.
            </p>
          </div>

          {/* CTA */}
          <div ref={ctaRef} style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={openDemo}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "17px 36px", borderRadius: 14,
                background: "linear-gradient(135deg,#3B82F6,#2563EB)",
                color: "#fff", border: "none", cursor: "pointer",
                fontSize: 16.5, fontWeight: 700, fontFamily: "inherit",
                boxShadow: "0 16px 50px rgba(59,130,246,0.5)",
                transition: "transform .25s, box-shadow .25s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-3px) scale(1.02)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 24px 60px rgba(59,130,246,0.6)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 50px rgba(59,130,246,0.5)";
              }}
            >
              Request a Demo
              <span style={{ fontSize: 20 }}>→</span>
            </button>

            <a
              href="/hotel/login"
              style={{
                display: "inline-flex", alignItems: "center", gap: 9,
                padding: "17px 30px", borderRadius: 14,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#E2E8F0", textDecoration: "none",
                fontSize: 16, fontWeight: 600,
                backdropFilter: "blur(10px)",
                transition: "background .25s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
            >
              Sign in as Hotel Staff
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "32px 48px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
        background: "#050816",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: "linear-gradient(135deg,#3B82F6,#1D4ED8)",
            display: "grid", placeItems: "center",
          }}>
            <div style={{ width: 9, height: 9, background: "#fff", borderRadius: 2, transform: "rotate(45deg)" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "rgba(255,255,255,0.7)" }}>
            ValtiqStay
          </span>
        </div>

        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          © 2026 ValtiqStay S.r.l. — P.IVA IT12345678901
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          {FOOTER_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              style={{
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                fontSize: 13,
                transition: "color .2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}
