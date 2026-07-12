"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { track } from "@/lib/analytics";

/* ── CSS injected once into <head> ───────────────────────────────────────── */
const KEYFRAMES = `
@keyframes vsFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes vsFloatB{0%,100%{transform:translateY(0)}50%{transform:translateY(13px)}}
@keyframes vsBlink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes vsBar{from{transform:scaleY(.2)}to{transform:scaleY(1)}}
[data-reveal]{opacity:1!important;transform:none!important;filter:none!important}
[data-reveal].vs-anim{opacity:0!important;transform:translateY(26px)!important;filter:blur(9px)!important;transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1),filter .9s!important}
[data-reveal].vs-anim.vs-in{opacity:1!important;transform:none!important;filter:none!important}
.vs-nav-link{color:rgba(244,238,224,.62);text-decoration:none;font-size:14.5px;font-weight:500;transition:color .3s}
.vs-nav-link:hover{color:#F4EEE0}
.vs-feat-card:hover{border-color:rgba(217,192,137,.2)!important;transform:translateY(-2px);transition:all .3s cubic-bezier(.16,1,.3,1)}
.vs-why-card:hover{border-color:rgba(255,255,255,.12)!important;transform:translateY(-2px);transition:all .3s}
`;

/* ── Design tokens ───────────────────────────────────────────────────────── */
const BG     = "#0A1122";
const SURF   = "#101A32";
const SURF2  = "#141D37";
const SURF3  = "#17223E";
const SURFHI = "linear-gradient(160deg,#2C2413,#0E1730)";
const GOLD   = "#D9C089";
const GOLD2  = "#E9CD8C";
const IVORY  = "#F4EEE0";
const GRAD   = `linear-gradient(135deg,${GOLD},${GOLD2})`;

/* ── DemoModal ───────────────────────────────────────────────────────────── */
function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [fields, setFields] = useState({ name: "", hotel: "", email: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    track("form_submit", { category: "hotel", label: "demo" });
    try {
      const r = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, type: "demo" }),
      });
      if (!r.ok) throw new Error();
      setStatus("ok");
      track("form_success", { category: "hotel", label: "demo" });
    } catch {
      setStatus("err");
      track("form_error", { category: "hotel", label: "demo" });
    }
  }

  const inp: React.CSSProperties = {
    padding: "13px 16px",
    background: SURF2,
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: "10px",
    fontSize: "15px",
    color: IVORY,
    outline: "none",
    width: "100%",
  };

  return (
    <div
      role="dialog" aria-modal aria-labelledby="demo-title"
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      <div style={{ background: SURF, border: "1px solid rgba(255,255,255,.1)", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "480px", position: "relative", boxShadow: "0 40px 80px rgba(0,0,0,.6)" }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", cursor: "pointer", color: `rgba(${244},${238},${224},.4)`, fontSize: "24px", lineHeight: 1, fontFamily: "inherit" }}>×</button>
        <div style={{ fontFamily: "var(--font-space-mono, monospace)", fontSize: "11px", letterSpacing: ".14em", color: GOLD2, marginBottom: "12px" }}>BOOK A DEMO</div>
        <h2 id="demo-title" style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: 700, letterSpacing: "-.03em" }}>Talk to us about ValtiqStay</h2>
        <p style={{ margin: "0 0 28px", color: `rgba(${244},${238},${224},.55)`, fontSize: "14px" }}>We&apos;ll get back to you within 24 hours to schedule a personalised demo.</p>
        {status === "ok" ? (
          <p role="status" aria-live="polite" style={{ color: "#28c840", fontWeight: 600, fontSize: "15px" }}>Request sent — we&apos;ll be in touch shortly!</p>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { k: "name",  label: "Full name *",         type: "text",  auto: "name" },
              { k: "hotel", label: "Hotel / property *",   type: "text",  auto: "organization" },
              { k: "email", label: "Business email *",     type: "email", auto: "email" },
              { k: "phone", label: "Phone (optional)",     type: "tel",   auto: "tel" },
            ].map(({ k, label, type, auto }) => (
              <input
                key={k}
                type={type}
                placeholder={label}
                autoComplete={auto}
                required={label.endsWith("*")}
                aria-required={label.endsWith("*")}
                value={fields[k as keyof typeof fields]}
                onChange={e => setFields(p => ({ ...p, [k]: e.target.value }))}
                style={inp}
              />
            ))}
            {status === "err" && <p role="alert" style={{ color: "#ff5f57", fontSize: "13px", margin: 0 }}>Something went wrong — please try again.</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              style={{ marginTop: "4px", padding: "15px", background: GRAD, color: "#241802", fontWeight: 700, border: "none", borderRadius: "12px", fontSize: "16px", cursor: "pointer", boxShadow: "0 10px 30px rgba(217,192,137,.35)" }}
            >
              {status === "sending" ? "Sending…" : "Send Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ── Ecosystem canvas labels ─────────────────────────────────────────────── */
const ECO_LABELS = ["Reservations", "Housekeeping", "Guests", "Channels", "Staff", "Reports"];

/* ── Bar heights for hero chart ─────────────────────────────────────────── */
const HERO_BARS = [52, 64, 47, 72, 58, 80, 69, 84, 74, 91];

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function HomeClient() {
  const [scrolled, setScrolled]   = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq]     = useState<Set<number>>(new Set());
  const [demoOpen, setDemoOpen]   = useState(false);

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const lightRef   = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number>(0);
  const nodeRefs   = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useRef(false);

  /* ── FAQ toggle ── */
  const toggleFaq = useCallback((i: number) => {
    setOpenFaq(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }, []);

  /* ── Demo open ── */
  const openDemo = useCallback(() => {
    track("cta_click", { category: "hotel", label: "book_demo" });
    setDemoOpen(true);
  }, []);

  /* ── Global interaction effects ── */
  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion.current) return;

    /* nav scroll */
    const nav = document.getElementById("vsNav");
    const onScroll = () => {
      const past = window.scrollY > 20;
      setScrolled(past);
      if (nav) {
        nav.style.background = past ? "rgba(10,17,34,.82)" : "rgba(10,17,34,.55)";
        nav.style.borderColor = past ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.06)";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* cursor light */
    const onMove = (e: MouseEvent) => {
      if (lightRef.current) {
        lightRef.current.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
      }
      /* parallax */
      document.querySelectorAll<HTMLElement>("[data-parallax-scene]").forEach(scene => {
        const r = scene.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const cx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const cy = (e.clientY - (r.top + r.height / 2)) / r.height;
        scene.querySelectorAll<HTMLElement>("[data-depth]").forEach(el => {
          const d = parseFloat(el.dataset.depth || "0");
          el.style.transform = `translate3d(${cx * d}px,${cy * d}px,0)`;
        });
      });
    };
    window.addEventListener("mousemove", onMove);

    /* magnetic buttons */
    const magnets = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const magCleanup: (() => void)[] = [];
    magnets.forEach(btn => {
      const move = (ev: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(ev.clientX - r.left - r.width / 2) * 0.28}px,${(ev.clientY - r.top - r.height / 2) * 0.42}px)`;
      };
      const leave = () => { btn.style.transform = "translate(0,0)"; };
      btn.addEventListener("mousemove", move);
      btn.addEventListener("mouseleave", leave);
      magCleanup.push(() => {
        btn.removeEventListener("mousemove", move);
        btn.removeEventListener("mouseleave", leave);
      });
    });

    /* scroll reveals */
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92 && r.bottom > 0;
    };
    const show = (el: HTMLElement) => {
      if ((el as HTMLElement & { _shown?: boolean })._shown) return;
      (el as HTMLElement & { _shown?: boolean })._shown = true;
      const d = parseInt(el.dataset.delay || "0", 10);
      setTimeout(() => el.classList.add("vs-in"), d);
    };

    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;opacity:0;pointer-events:none";
    document.body.appendChild(probe);
    const anim = probe.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    let settled = false;
    const decide = (ok: boolean) => {
      if (settled) return; settled = true;
      probe.remove();
      if (!ok) return;
      els.forEach(el => { if (!inView(el)) el.classList.add("vs-anim"); });
      const check = () => els.forEach(el => { if (el.classList.contains("vs-anim") && inView(el)) show(el); });
      check();
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { show(en.target as HTMLElement); io.unobserve(en.target); } });
      }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
      els.forEach(el => { if (el.classList.contains("vs-anim")) io.observe(el); });
      window.addEventListener("scroll", check, { passive: true });
    };
    if (anim?.finished) anim.finished.then(() => decide(true)).catch(() => decide(false));
    const fallback = setTimeout(() => decide(false), 500);
    const safety   = setTimeout(() => els.forEach(el => el.classList.add("vs-in")), 2600);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      magCleanup.forEach(fn => fn());
      clearTimeout(fallback);
      clearTimeout(safety);
    };
  }, []);

  /* ── Ecosystem canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cxC: number, cyC: number, R: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width: cssW, height: cssH } = parent.getBoundingClientRect();
      if (!cssW || !cssH) return;
      canvas.width  = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width  = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      cxC = canvas.width / 2;
      cyC = canvas.height / 2;
      R   = Math.min(cssW, cssH) * 0.35 * dpr;
      const rad = Math.min(cssW, cssH) * 0.35;
      nodeRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = -Math.PI / 2 + i * (Math.PI * 2 / ECO_LABELS.length);
        el.style.left = `${cssW / 2 + Math.cos(a) * rad}px`;
        el.style.top  = `${cssH / 2 + Math.sin(a) * rad}px`;
      });
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      if (!canvas.width) { rafRef.current = requestAnimationFrame(draw); return; }
      t += 0.006;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const nodes = ECO_LABELS.map((_, i) => {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / ECO_LABELS.length);
        return { x: cxC + Math.cos(a) * R, y: cyC + Math.sin(a) * R };
      });
      nodes.forEach((n, i) => {
        ctx.strokeStyle = "rgba(217,192,137,0.16)";
        ctx.lineWidth   = 1 * dpr;
        ctx.beginPath(); ctx.moveTo(cxC, cyC); ctx.lineTo(n.x, n.y); ctx.stroke();
        const p  = (t * 0.75 + i / nodes.length) % 1;
        const px = n.x + (cxC - n.x) * p;
        const py = n.y + (cyC - n.y) * p;
        const g  = ctx.createRadialGradient(px, py, 0, px, py, 8 * dpr);
        g.addColorStop(0, "rgba(233,205,140,0.85)");
        g.addColorStop(1, "rgba(233,205,140,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px, py, 8 * dpr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(217,192,137,0.9)";
        ctx.beginPath(); ctx.arc(n.x, n.y, 3.2 * dpr, 0, Math.PI * 2); ctx.fill();
      });
      const cg = ctx.createRadialGradient(cxC, cyC, 0, cxC, cyC, 46 * dpr);
      cg.addColorStop(0, "rgba(217,192,137,0.4)");
      cg.addColorStop(1, "rgba(217,192,137,0)");
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cxC, cyC, 46 * dpr, 0, Math.PI * 2); ctx.fill();
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ── Tab helper ── */
  const tabStyle = (i: number): React.CSSProperties => ({
    padding: "9px 18px",
    borderRadius: "100px",
    border: activeTab === i ? "1px solid rgba(217,192,137,.4)" : "1px solid rgba(255,255,255,.08)",
    background: activeTab === i ? "rgba(217,192,137,.16)" : "transparent",
    color: activeTab === i ? IVORY : "rgba(244,238,224,.5)",
    fontFamily: "var(--font-manrope, sans-serif)",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .3s",
  });

  /* ── Shared style snippets ── */
  const eyebrow: React.CSSProperties = {
    fontFamily: "var(--font-space-mono, monospace)",
    fontSize: "12px",
    letterSpacing: ".14em",
    color: GOLD2,
    marginBottom: "18px",
  };
  const section: React.CSSProperties = {
    position: "relative",
    zIndex: 2,
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "130px 40px 40px",
  };
  const card: React.CSSProperties = {
    padding: "24px",
    borderRadius: "16px",
    background: SURF,
    border: "1px solid rgba(255,255,255,.07)",
  };

  /* ── Render ── */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* Page wrapper */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "100vw",
        background: BG,
        backgroundImage: "radial-gradient(1100px 760px at 80% -6%,rgba(217,192,137,.16),transparent 60%),radial-gradient(820px 620px at 6% 14%,rgba(233,205,140,.06),transparent 55%)",
        overflow: "hidden",
        fontFamily: "var(--font-manrope, system-ui, sans-serif)",
        color: IVORY,
        minHeight: "100vh",
      }}>

        {/* Cursor light */}
        <div
          ref={lightRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "600px",
            height: "600px",
            margin: "-300px 0 0 -300px",
            borderRadius: "50%",
            background: "radial-gradient(circle,rgba(217,192,137,.12),transparent 62%)",
            pointerEvents: "none",
            zIndex: 1,
            transition: "transform .3s cubic-bezier(.16,1,.3,1)",
            willChange: "transform",
          }}
        />

        {/* ── NAV ──────────────────────────────────────────────────────── */}
        <nav
          id="vsNav"
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "17px 40px",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            background: scrolled ? "rgba(10,17,34,.82)" : "rgba(10,17,34,.55)",
            borderBottom: "1px solid rgba(255,255,255,.06)",
            transition: "background .4s,border-color .4s",
          }}
        >
          {/* Logo */}
          <a href="#top" style={{ display: "flex", alignItems: "center", gap: "11px", textDecoration: "none", color: IVORY }}>
            <span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", borderRadius: "9px", background: GRAD, boxShadow: "0 6px 20px rgba(217,192,137,.4)" }}>
              <span style={{ width: "11px", height: "11px", background: BG, transform: "rotate(45deg)", borderRadius: "2px" }} />
            </span>
            <span style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "-.02em" }}>ValtiqStay</span>
          </a>

          {/* Center links */}
          <div style={{ display: "flex", alignItems: "center", gap: "34px" }}>
            {[["#platform","Platform"],["#features","Features"],["#showcase","Product"],["#why","Why us"],["#faq","FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className="vs-nav-link">{label}</a>
            ))}
          </div>

          {/* Right CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <a href="/hotel/login" style={{ color: "rgba(244,238,224,.8)", textDecoration: "none", fontSize: "14.5px", fontWeight: 600 }}>Sign in</a>
            <button
              data-magnetic
              onClick={openDemo}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "11px 20px", borderRadius: "12px", background: GRAD, color: "#241802", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 700, boxShadow: "0 8px 26px rgba(217,192,137,.34)", fontFamily: "inherit" }}
            >
              Book a Demo
            </button>
          </div>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <header id="top" style={{ position: "relative", zIndex: 2, maxWidth: "1180px", margin: "0 auto", padding: "186px 40px 40px", textAlign: "center" }}>

          {/* Eyebrow pill */}
          <div data-reveal style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "7px 15px 7px 11px", borderRadius: "100px", border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)", backdropFilter: "blur(10px)", marginBottom: "32px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "3px 9px", borderRadius: "100px", background: "rgba(217,192,137,.14)", color: GOLD2, fontFamily: "var(--font-space-mono, monospace)", fontSize: "11px", letterSpacing: ".04em" }}>◆ EARLY ACCESS</span>
            <span style={{ fontSize: "13px", color: "rgba(244,238,224,.72)", fontWeight: 500 }}>The all-in-one platform for modern hospitality</span>
          </div>

          {/* H1 */}
          <h1
            data-reveal
            data-delay="80"
            style={{ margin: 0, fontSize: "clamp(44px,7.2vw,94px)", lineHeight: ".98", letterSpacing: "-.045em", fontWeight: 700 }}
          >
            Run your entire hotel<br />
            from{" "}
            <span style={{ background: `linear-gradient(105deg,${GOLD} 8%,${GOLD2} 58%,${IVORY} 108%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              one platform.
            </span>
          </h1>

          {/* Lead */}
          <p data-reveal data-delay="160" style={{ maxWidth: "632px", margin: "30px auto 0", fontSize: "clamp(16px,1.7vw,20px)", lineHeight: 1.55, color: "rgba(244,238,224,.6)", fontWeight: 400 }}>
            ValtiqStay brings reservations, guests, housekeeping, staff and reporting into one intuitive interface — so every part of your property works together, beautifully.
          </p>

          {/* CTAs */}
          <div data-reveal data-delay="240" style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginTop: "38px" }}>
            <button
              data-magnetic
              onClick={openDemo}
              style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "16px 28px", borderRadius: "14px", background: GRAD, color: "#241802", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: 700, boxShadow: "0 14px 40px rgba(217,192,137,.38)", fontFamily: "inherit" }}
            >
              Book a Demo <span>→</span>
            </button>
            <a
              href="#platform"
              data-magnetic
              style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "16px 28px", borderRadius: "14px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", color: IVORY, textDecoration: "none", fontSize: "16px", fontWeight: 600, backdropFilter: "blur(10px)" }}
            >
              Discover the Platform
            </a>
          </div>

          {/* Product mockup */}
          <div data-parallax-scene style={{ position: "relative", marginTop: "78px" }}>
            <div data-reveal data-delay="320" style={{ position: "relative", zIndex: 2, borderRadius: "22px", border: "1px solid rgba(255,255,255,.09)", background: "linear-gradient(180deg,#141D37,#0B1428)", boxShadow: "0 60px 140px rgba(0,0,0,.7),0 0 0 1px rgba(217,192,137,.08),inset 0 1px 0 rgba(255,255,255,.05)", overflow: "hidden", textAlign: "left" }}>
              {/* Browser chrome */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#ff5f57" }} />
                <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#febc2e" }} />
                <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#28c840" }} />
                <span style={{ marginLeft: "14px", fontFamily: "var(--font-space-mono, monospace)", fontSize: "11.5px", color: "rgba(244,238,224,.4)" }}>app.valtiqstay.com/overview</span>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: GOLD2 }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: GOLD2, animation: "vsBlink 1.8s infinite" }} />
                  Live sync
                </span>
              </div>
              {/* App layout */}
              <div style={{ display: "grid", gridTemplateColumns: "196px 1fr" }}>
                {/* Sidebar */}
                <div style={{ borderRight: "1px solid rgba(255,255,255,.06)", padding: "16px 12px", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ fontFamily: "var(--font-space-mono, monospace)", fontSize: "9.5px", letterSpacing: ".12em", color: "rgba(244,238,224,.3)", padding: "6px 10px 8px" }}>GRAND AZURE RESORT</div>
                  {[{ label: "Overview", active: true }, { label: "Reservations" }, { label: "Calendar" }, { label: "Housekeeping" }, { label: "Reports" }].map(({ label, active }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 11px", borderRadius: "9px", background: active ? "rgba(217,192,137,.14)" : "transparent", color: active ? IVORY : "rgba(244,238,224,.5)", fontSize: "13px", fontWeight: active ? 600 : 400 }}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "2px", background: active ? GOLD : "rgba(255,255,255,.25)" }} />
                      {label}
                    </div>
                  ))}
                </div>
                {/* Main area */}
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700 }}>Good morning, Elena</div>
                      <div style={{ fontSize: "12.5px", color: "rgba(244,238,224,.45)", marginTop: "2px" }}>Thursday, 2 July · 148 rooms</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <span style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,.1)", fontSize: "12px", color: "rgba(244,238,224,.7)" }}>Today</span>
                      <span style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(217,192,137,.16)", color: GOLD2, fontSize: "12px", fontWeight: 600 }}>+ New booking</span>
                    </div>
                  </div>
                  {/* Stat tiles */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "16px" }}>
                    {[{ label: "Occupancy", value: "87%", }, { label: "Arrivals today", value: "24" }, { label: "ADR", value: "€214" }].map(({ label, value }) => (
                      <div key={label} style={{ padding: "14px", borderRadius: "13px", background: SURF3, border: "1px solid rgba(255,255,255,.06)" }}>
                        <div style={{ fontSize: "11.5px", color: "rgba(244,238,224,.45)" }}>{label}</div>
                        <div style={{ fontSize: "24px", fontWeight: 700, marginTop: "5px", letterSpacing: "-.02em" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chart */}
                  <div style={{ padding: "16px", borderRadius: "13px", background: SURF3, border: "1px solid rgba(255,255,255,.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ fontSize: "12.5px", fontWeight: 600 }}>Occupancy · last 14 days</span>
                      <span style={{ fontSize: "11.5px", color: GOLD2 }}>Trending up</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "78px" }}>
                      {HERO_BARS.map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, background: `linear-gradient(180deg,${i===5||i===9?GOLD2:GOLD},rgba(217,192,137,.25))`, borderRadius: "4px 4px 0 0", transformOrigin: "bottom", animation: `vsBar .9s ease ${0.1 + i * 0.05}s both` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating widget left */}
            <div data-depth="26" style={{ position: "absolute", top: "64px", left: "-26px", zIndex: 3, padding: "14px 16px", borderRadius: "15px", background: "rgba(20,20,20,.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 24px 60px rgba(0,0,0,.55)", animation: "vsFloat 6s ease-in-out infinite" }}>
              <div style={{ fontSize: "11px", color: "rgba(244,238,224,.5)" }}>Rooms ready</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "3px" }}>
                <span style={{ fontSize: "22px", fontWeight: 700 }}>132</span>
                <span style={{ fontSize: "12px", color: GOLD2 }}>/ 148</span>
              </div>
            </div>

            {/* Floating widget right */}
            <div data-depth="-30" style={{ position: "absolute", top: "150px", right: "-22px", zIndex: 3, padding: "14px 16px", borderRadius: "15px", background: "rgba(20,20,20,.72)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 24px 60px rgba(0,0,0,.55)", animation: "vsFloatB 7s ease-in-out infinite" }}>
              <div style={{ fontSize: "11px", color: "rgba(244,238,224,.5)" }}>Check-ins in progress</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#28c840", animation: "vsBlink 1.6s infinite" }} />
                <span style={{ fontSize: "14px", fontWeight: 600 }}>6 guests at the desk</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── PLATFORM OVERVIEW ─────────────────────────────────────────── */}
        <section id="platform" style={section}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px", alignItems: "center" }}>
            {/* Left */}
            <div>
              <div data-reveal style={eyebrow}>ONE CONNECTED ECOSYSTEM</div>
              <h2 data-reveal data-delay="80" style={{ margin: 0, fontSize: "clamp(32px,4.2vw,52px)", lineHeight: 1.04, letterSpacing: "-.035em", fontWeight: 700 }}>
                Not another tool.<br />Your whole operation, connected.
              </h2>
              <p data-reveal data-delay="160" style={{ margin: "26px 0 0", fontSize: "17px", lineHeight: 1.6, color: "rgba(244,238,224,.6)", maxWidth: "460px" }}>
                Most hotels run on a patchwork of spreadsheets, legacy PMS software and disconnected apps. ValtiqStay replaces them with a single source of truth — every reservation, room, guest and team member kept perfectly in sync, in real time.
              </p>
              <div data-reveal data-delay="240" style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "30px" }}>
                {["Every module shares the same live data", "Update a booking once — everywhere reflects it", "One login for your entire team and portfolio"].map(txt => (
                  <div key={txt} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ display: "grid", placeItems: "center", width: "26px", height: "26px", borderRadius: "8px", background: "rgba(217,192,137,.16)", color: GOLD2, fontSize: "13px", flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "15px", color: "rgba(244,238,224,.82)" }}>{txt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — ecosystem diagram */}
            <div data-reveal data-delay="120" style={{ position: "relative", height: "460px", borderRadius: "22px", border: "1px solid rgba(255,255,255,.08)", background: "radial-gradient(circle at 50% 50%,rgba(217,192,137,.08),transparent 70%),#0A1226", overflow: "hidden" }}>
              <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
              {/* Center node */}
              <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", zIndex: 2 }}>
                <span style={{ display: "grid", placeItems: "center", width: "56px", height: "56px", borderRadius: "16px", background: GRAD, boxShadow: "0 12px 40px rgba(217,192,137,.5)" }}>
                  <span style={{ width: "18px", height: "18px", background: BG, transform: "rotate(45deg)", borderRadius: "3px" }} />
                </span>
                <span style={{ fontSize: "12px", fontWeight: 700, marginTop: "8px" }}>ValtiqStay</span>
                <span style={{ fontFamily: "var(--font-space-mono, monospace)", fontSize: "9px", color: "rgba(244,238,224,.4)" }}>core</span>
              </div>
              {/* Orbit nodes */}
              {ECO_LABELS.map((label, i) => (
                <div
                  key={label}
                  ref={el => { nodeRefs.current[i] = el; }}
                  style={{ position: "absolute", transform: "translate(-50%,-50%)", padding: "7px 13px", borderRadius: "100px", background: "rgba(24,24,24,.9)", border: "1px solid rgba(255,255,255,.1)", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", backdropFilter: "blur(8px)", zIndex: 2 }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES BENTO ───────────────────────────────────────────── */}
        <section id="features" style={{ ...section, paddingTop: "120px" }}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <div data-reveal style={eyebrow}>THE PLATFORM</div>
            <h2 data-reveal data-delay="80" style={{ margin: 0, fontSize: "clamp(32px,4.6vw,56px)", lineHeight: 1.03, letterSpacing: "-.035em", fontWeight: 700 }}>
              Twelve modules.<br />One login.
            </h2>
            <p data-reveal data-delay="160" style={{ maxWidth: "560px", margin: "22px auto 0", fontSize: "17px", lineHeight: 1.55, color: "rgba(244,238,224,.55)" }}>
              Everything a modern property needs to run — thoughtfully designed and deeply integrated.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "16px" }}>
            {/* Row 1 — span 3 big cards */}
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="4" x2="8" y2="9"/></svg>, title: "Property Management", desc: "The operational core. Room inventory, rates, availability and the full guest lifecycle — managed from one clear, fast interface.", span: 3, big: true, delay: 0 },
              { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>, title: "Reservations & Calendar", desc: "A drag-and-drop timeline of your whole property. Create, move and split bookings in seconds — never double-book a room again.", span: 3, big: true, delay: 60 },
            ].map(({ icon, title, desc, span, big, delay }) => (
              <div key={title} data-reveal data-delay={String(delay)} className="vs-feat-card" style={{ gridColumn: `span ${span}`, padding: "26px", borderRadius: "18px", background: "linear-gradient(160deg,#18223E,#0E1730)", border: "1px solid rgba(255,255,255,.07)", minHeight: big ? "230px" : "190px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", right: "-40px", top: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle,rgba(217,192,137,.14),transparent 70%)" }} />
                <div style={{ display: "grid", placeItems: "center", width: "44px", height: "44px", borderRadius: "13px", background: "rgba(217,192,137,.14)", border: "1px solid rgba(217,192,137,.2)" }}>{icon}</div>
                <div>
                  <div style={{ fontSize: big ? "20px" : "17px", fontWeight: 700, letterSpacing: "-.02em" }}>{title}</div>
                  <div style={{ fontSize: big ? "14.5px" : "13.5px", color: "rgba(244,238,224,.55)", marginTop: "8px", lineHeight: 1.5, maxWidth: "340px" }}>{desc}</div>
                </div>
              </div>
            ))}

            {/* Span-2 cards */}
            {[
              { icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>, title: "Channel Management", desc: "Push rates and availability to every OTA and your own booking engine from one place.", delay: 0 },
              { icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><path d="M4 12a8 8 0 0 1 16 0"/><path d="M4 12a8 8 0 0 0 16 0"/><line x1="12" y1="2" x2="12" y2="5"/></svg>, title: "Booking Synchronization", desc: "Two-way sync keeps every channel updated the instant a reservation changes.", delay: 60 },
              { icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 10l3 3 5-5"/></svg>, title: "Housekeeping", desc: "Live room status for every attendant. Assign, track and clear rooms from any device.", delay: 120 },
              { icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><circle cx="9" cy="8" r="3"/><path d="M4 20a5 5 0 0 1 10 0"/><path d="M16 8h4M16 12h4"/></svg>, title: "Staff Management", desc: "Roles, permissions and shift assignments for every team and department.", delay: 0 },
              { icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>, title: "Guest Management", desc: "Rich guest profiles, stay history and preferences — for a personal welcome, every time.", delay: 60 },
              { icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="6"/><line x1="18" y1="20" x2="18" y2="14"/></svg>, title: "Reports", desc: "Night audit, arrivals, departures and financials — exportable and always accurate.", delay: 120 },
              { icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><path d="M3 3v18h18"/><path d="M7 14l4-5 3 3 5-7"/></svg>, title: "Analytics", desc: "Occupancy, ADR and RevPAR trends in clear, real-time dashboards.", delay: 0 },
              { icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><rect x="3" y="9" width="7" height="12" rx="1"/><rect x="14" y="4" width="7" height="17" rx="1"/></svg>, title: "Multi-property", desc: "Manage a single boutique or an entire portfolio — switch properties in one click.", delay: 60 },
              { icon: <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><path d="M4 8l8-4 8 4-8 4-8-4z"/><path d="M4 8v8l8 4 8-4V8"/></svg>, title: "Operational Automation", desc: "Automate check-in emails, room assignment and daily routines with simple rules.", delay: 120, gold: true },
            ].map(({ icon, title, desc, delay, gold }) => (
              <div key={title} data-reveal data-delay={String(delay)} className="vs-feat-card" style={{ gridColumn: "span 2", padding: "24px", borderRadius: "18px", background: gold ? SURFHI : SURF, border: gold ? "1px solid rgba(217,192,137,.18)" : "1px solid rgba(255,255,255,.07)", minHeight: "190px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "grid", placeItems: "center", width: "42px", height: "42px", borderRadius: "12px", background: gold ? "rgba(217,192,137,.18)" : "rgba(255,255,255,.05)", border: gold ? "1px solid rgba(217,192,137,.28)" : "1px solid rgba(255,255,255,.08)" }}>{icon}</div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 700 }}>{title}</div>
                  <div style={{ fontSize: "13.5px", color: "rgba(244,238,224,.5)", marginTop: "6px", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}

            {/* Full-width footer tile */}
            <div data-reveal style={{ gridColumn: "span 6", padding: "22px 26px", borderRadius: "18px", background: SURF, border: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ display: "grid", placeItems: "center", width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={GOLD2} strokeWidth="1.6"><path d="M18 10a5 5 0 0 0-9.5-2A4 4 0 1 0 7 16h10a4 4 0 0 0 1-8z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 700 }}>Secure Cloud Access</div>
                  <div style={{ fontSize: "13.5px", color: "rgba(244,238,224,.5)", marginTop: "4px" }}>Access your property from anywhere — encrypted, backed up and always available.</div>
                </div>
              </div>
              <a href="#showcase" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "11px", background: "rgba(217,192,137,.14)", color: GOLD2, textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>Explore the product →</a>
            </div>
          </div>
        </section>

        {/* ── DASHBOARD SHOWCASE ────────────────────────────────────────── */}
        <section id="showcase" style={{ ...section, paddingTop: "120px" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <div data-reveal style={eyebrow}>SEE IT IN ACTION</div>
            <h2 data-reveal data-delay="80" style={{ margin: 0, fontSize: "clamp(32px,4.6vw,56px)", lineHeight: 1.03, letterSpacing: "-.035em", fontWeight: 700 }}>
              Your entire property,<br />at a glance.
            </h2>
            <p data-reveal data-delay="160" style={{ maxWidth: "560px", margin: "22px auto 0", fontSize: "17px", lineHeight: 1.55, color: "rgba(244,238,224,.55)" }}>
              A workspace designed for clarity. Switch between the views your team lives in every day.
            </p>
          </div>

          {/* Tab switcher */}
          <div data-reveal data-delay="120" style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "34px" }}>
            {["Overview", "Calendar", "Housekeeping", "Reports"].map((label, i) => (
              <button key={label} style={tabStyle(i)} onClick={() => setActiveTab(i)}>{label}</button>
            ))}
          </div>

          {/* MacBook */}
          <div data-parallax-scene style={{ position: "relative", maxWidth: "900px", margin: "0 auto" }}>
            <div data-reveal data-delay="180">
              {/* Lid */}
              <div style={{ borderRadius: "18px 18px 0 0", border: "1px solid rgba(255,255,255,.1)", borderBottom: "none", background: "linear-gradient(180deg,#18223E,#0B1428)", padding: "12px 12px 0", boxShadow: "0 40px 120px rgba(0,0,0,.65)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "0 6px 11px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57" }} />
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#febc2e" }} />
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840" }} />
                  <span style={{ marginLeft: "12px", fontFamily: "var(--font-space-mono, monospace)", fontSize: "11px", color: "rgba(244,238,224,.38)" }}>Grand Azure Resort · 148 rooms</span>
                </div>
                {/* Screen */}
                <div style={{ position: "relative", borderRadius: "11px 11px 0 0", background: BG, border: "1px solid rgba(255,255,255,.06)", borderBottom: "none", overflow: "hidden", minHeight: "420px" }}>

                  {/* Panel 0: Overview */}
                  <div style={{ display: activeTab === 0 ? "block" : "none", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                      <div style={{ fontSize: "19px", fontWeight: 700, letterSpacing: "-.02em" }}>Today at a glance</div>
                      <div style={{ fontSize: "12.5px", color: "rgba(244,238,224,.4)", fontFamily: "var(--font-space-mono, monospace)" }}>Thu · 2 Jul 2026</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "20px" }}>
                      {[{ l: "Occupancy", v: "87%", sub: <div style={{ height: "5px", borderRadius: "3px", background: "rgba(255,255,255,.08)", marginTop: "10px", overflow: "hidden" }}><div style={{ width: "87%", height: "100%", background: `linear-gradient(90deg,${GOLD},${GOLD2})` }} /></div> }, { l: "Arrivals", v: "24", sub: <div style={{ fontSize: "11.5px", color: "rgba(244,238,224,.4)", marginTop: "10px" }}>8 VIP · 3 groups</div> }, { l: "Departures", v: "19", sub: <div style={{ fontSize: "11.5px", color: "rgba(244,238,224,.4)", marginTop: "10px" }}>Late c/o: 4</div> }, { l: "ADR", v: "€214", sub: <div style={{ fontSize: "11.5px", color: GOLD2, marginTop: "10px" }}>RevPAR €186</div> }].map(({ l, v, sub }) => (
                        <div key={l} style={{ padding: "16px", borderRadius: "14px", background: SURF2, border: "1px solid rgba(255,255,255,.06)" }}>
                          <div style={{ fontSize: "11.5px", color: "rgba(244,238,224,.45)" }}>{l}</div>
                          <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "6px" }}>{v}</div>
                          {sub}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "14px" }}>
                      <div style={{ padding: "18px", borderRadius: "14px", background: SURF2, border: "1px solid rgba(255,255,255,.06)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600 }}>Occupancy · 14 days</span>
                          <span style={{ fontSize: "11.5px", color: "rgba(244,238,224,.4)" }}>%</span>
                        </div>
                        <svg viewBox="0 0 320 90" style={{ width: "100%", height: "90px" }} preserveAspectRatio="none">
                          <defs><linearGradient id="vsArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={GOLD} stopOpacity="0.35"/><stop offset="1" stopColor={GOLD} stopOpacity="0"/></linearGradient></defs>
                          <path d="M0,60 L26,52 L53,58 L80,40 L106,46 L133,30 L160,38 L186,22 L213,30 L240,18 L266,26 L293,14 L320,20 L320,90 L0,90 Z" fill="url(#vsArea)"/>
                          <path d="M0,60 L26,52 L53,58 L80,40 L106,46 L133,30 L160,38 L186,22 L213,30 L240,18 L266,26 L293,14 L320,20" fill="none" stroke={GOLD2} strokeWidth="2"/>
                        </svg>
                      </div>
                      <div style={{ padding: "18px", borderRadius: "14px", background: SURF2, border: "1px solid rgba(255,255,255,.06)" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "14px" }}>Arrivals queue</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                          {[{ init: "MC", name: "M. Conti", room: "Suite 412 · 15:00", vip: true }, { init: "JD", name: "J. Duarte", room: "Deluxe 208 · 16:30" }, { init: "AK", name: "A. Krause", room: "Std 117 · 17:15" }].map(({ init, name, room, vip }) => (
                            <div key={name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ width: "28px", height: "28px", borderRadius: "8px", background: vip ? GRAD : "#20304E", display: "grid", placeItems: "center", fontSize: "11px", fontWeight: 700, color: vip ? "#241802" : IVORY, flexShrink: 0 }}>{init}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "12.5px", fontWeight: 600 }}>{name}</div>
                                <div style={{ fontSize: "11px", color: "rgba(244,238,224,.4)" }}>{room}</div>
                              </div>
                              {vip && <span style={{ fontSize: "10px", padding: "3px 7px", borderRadius: "6px", background: "rgba(233,205,140,.15)", color: GOLD2 }}>VIP</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Panel 1: Calendar */}
                  <div style={{ display: activeTab === 1 ? "block" : "none", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                      <div style={{ fontSize: "19px", fontWeight: 700, letterSpacing: "-.02em" }}>Reservation calendar</div>
                      <div style={{ display: "flex", gap: "6px", fontFamily: "var(--font-space-mono, monospace)", fontSize: "11px", color: "rgba(244,238,224,.4)" }}>
                        <span>Jul 2</span><span>·</span><span>Jul 8</span>
                      </div>
                    </div>
                    <div style={{ borderRadius: "12px", background: SURF2, border: "1px solid rgba(255,255,255,.06)", overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "120px repeat(7,1fr)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                        <div style={{ padding: "10px 12px", fontSize: "11px", color: "rgba(244,238,224,.4)" }}>ROOM</div>
                        {["Wed 2","Thu 3","Fri 4","Sat 5","Sun 6","Mon 7","Tue 8"].map(d => (
                          <div key={d} style={{ padding: "10px 6px", fontSize: "11px", color: "rgba(244,238,224,.5)", textAlign: "center" }}>{d}</div>
                        ))}
                      </div>
                      {[
                        { room: "Suite 412",  guest: "M. Conti",  left: "2%",  right: "44%", opacity: 1 },
                        { room: "Deluxe 208", guest: "J. Duarte", left: "28%", right: "14%", opacity: 1 },
                        { room: "Std 117",    guest: "A. Krause", left: "56%", right: "2%",  opacity: 1 },
                        { room: "Std 118",    guest: "Held",      left: "2%",  right: "70%", opacity: 0.6 },
                      ].map(({ room, guest, left, right, opacity }, idx) => (
                        <div key={room} style={{ display: "grid", gridTemplateColumns: "120px 1fr", borderBottom: idx < 3 ? "1px solid rgba(255,255,255,.04)" : undefined }}>
                          <div style={{ padding: "12px", fontSize: "12.5px", fontWeight: 600 }}>{room}</div>
                          <div style={{ position: "relative", padding: "9px 6px" }}>
                            <div style={{ position: "absolute", left, right, top: "9px", height: "26px", borderRadius: "7px", background: idx < 3 ? GRAD : "rgba(255,255,255,.12)", display: "flex", alignItems: "center", padding: "0 10px", fontSize: "11px", fontWeight: 600, color: idx < 3 ? "#241802" : `rgba(244,238,224,${opacity})` }}>{guest}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel 2: Housekeeping */}
                  <div style={{ display: activeTab === 2 ? "block" : "none", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                      <div style={{ fontSize: "19px", fontWeight: 700, letterSpacing: "-.02em" }}>Housekeeping board</div>
                      <div style={{ display: "flex", gap: "14px", fontSize: "11.5px", color: "rgba(244,238,224,.5)" }}>
                        {[["#28c840","Ready"],["#febc2e","Cleaning"],["#ff5f57","Dirty"]].map(([col,label]) => (
                          <span key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col }} />{label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "12px" }}>
                      {[{r:"201",c:"#28c840",l:"Ready"},{r:"202",c:"#febc2e",l:"Maria"},{r:"203",c:"#ff5f57",l:"Dirty"},{r:"204",c:"#28c840",l:"Ready"},{r:"205",c:"#28c840",l:"Ready"},{r:"206",c:"#febc2e",l:"Sofia"},{r:"207",c:"#28c840",l:"Ready"},{r:"208",c:"#ff5f57",l:"Dirty"},{r:"209",c:"#28c840",l:"Ready"},{r:"210",c:"#28c840",l:"Ready"}].map(({ r, c, l }) => (
                        <div key={r} style={{ padding: "14px", borderRadius: "12px", background: SURF2, border: `1px solid ${c}40` }}>
                          <div style={{ fontSize: "13px", fontWeight: 700 }}>{r}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: c }} />
                            <span style={{ fontSize: "11px", color: "rgba(244,238,224,.6)" }}>{l}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Panel 3: Reports */}
                  <div style={{ display: activeTab === 3 ? "block" : "none", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                      <div style={{ fontSize: "19px", fontWeight: 700, letterSpacing: "-.02em" }}>Revenue report</div>
                      <div style={{ fontSize: "11.5px", color: "rgba(244,238,224,.4)", fontFamily: "var(--font-space-mono, monospace)" }}>Jun 2026</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px" }}>
                      <div style={{ padding: "18px", borderRadius: "14px", background: SURF2, border: "1px solid rgba(255,255,255,.06)" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "16px" }}>Revenue by week</div>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", height: "150px" }}>
                          {[{pct:"60%",w:"W1"},{pct:"78%",w:"W2"},{pct:"66%",w:"W3"},{pct:"92%",w:"W4"}].map(({ pct, w }) => (
                            <div key={w} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "100%", height: pct, background: `linear-gradient(180deg,${GOLD},rgba(217,192,137,.3))`, borderRadius: "6px 6px 0 0" }} />
                              <span style={{ fontSize: "10.5px", color: "rgba(244,238,224,.4)" }}>{w}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ padding: "18px", borderRadius: "14px", background: SURF2, border: "1px solid rgba(255,255,255,.06)", display: "flex", flexDirection: "column", gap: "14px" }}>
                        {[{l:"Rooms revenue",v:"€418,200"},{l:"F&B",v:"€96,540"},{l:"Extras",v:"€28,110"}].map(({ l, v }) => (
                          <div key={l}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "12.5px", color: "rgba(244,238,224,.55)" }}>{l}</span>
                              <span style={{ fontSize: "14px", fontWeight: 700 }}>{v}</span>
                            </div>
                            <div style={{ height: "1px", background: "rgba(255,255,255,.06)", marginTop: "14px" }} />
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: GOLD2 }}>Total</span>
                          <span style={{ fontSize: "16px", fontWeight: 800, color: GOLD2 }}>€542,850</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Laptop base */}
              <div style={{ height: "14px", borderRadius: "0 0 12px 12px", background: "linear-gradient(180deg,#1C2846,#101A32)", border: "1px solid rgba(255,255,255,.08)", position: "relative" }}>
                <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", width: "80px", height: "5px", borderRadius: "0 0 8px 8px", background: "rgba(0,0,0,.4)" }} />
              </div>
              <div style={{ height: "9px", margin: "0 auto", width: "66%", borderRadius: "0 0 14px 14px", background: "linear-gradient(180deg,#161F3A,#0A1226)" }} />
            </div>

            {/* Floating phone */}
            <div data-depth="-34" style={{ position: "absolute", right: "-30px", bottom: "-24px", zIndex: 4, width: "132px", borderRadius: "22px", border: "1px solid rgba(255,255,255,.12)", background: "#0B1326", boxShadow: "0 30px 70px rgba(0,0,0,.6)", overflow: "hidden", animation: "vsFloatB 7s ease-in-out infinite" }}>
              <div style={{ padding: "12px 12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700 }}>Housekeeping</span>
                  <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: GRAD }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[{r:"Room 203",c:"#ff5f57"},{r:"Room 204",c:"#28c840"},{r:"Room 206",c:"#febc2e"}].map(({ r, c }) => (
                    <div key={r} style={{ padding: "9px 10px", borderRadius: "10px", background: SURF2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600 }}>{r}</span>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY VALTIQSTAY ────────────────────────────────────────────── */}
        <section id="why" style={section}>
          <div style={{ textAlign: "center", marginBottom: "52px" }}>
            <div data-reveal style={eyebrow}>WHY VALTIQSTAY</div>
            <h2 data-reveal data-delay="80" style={{ margin: 0, fontSize: "clamp(32px,4.6vw,56px)", lineHeight: 1.03, letterSpacing: "-.035em", fontWeight: 700 }}>
              Built to make<br />hospitality effortless.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
            {[
              { title: "One centralized platform", desc: "Replace scattered tools with a single system your whole team trusts.", delay: 0 },
              { title: "Faster daily operations",  desc: "Fewer clicks, fewer tabs. The work your team does most, made quick.", delay: 60 },
              { title: "Better organization",       desc: "Every reservation, note and task exactly where you expect it.", delay: 120 },
              { title: "Reduced manual work",       desc: "Automate the repetitive routines that eat your team's day.", delay: 180 },
              { title: "Scales with you",           desc: "From one boutique to a growing group — without changing systems.", delay: 0 },
              { title: "Secure cloud infrastructure", desc: "Encryption, backups and reliable uptime you can build a business on.", delay: 60 },
              { title: "Modern user experience",    desc: "An interface so intuitive new staff are productive on day one.", delay: 120 },
              { title: "Made for hospitality",      desc: "Designed around how hotels actually run — not generic business software.", delay: 180, gold: true },
            ].map(({ title, desc, delay, gold }) => (
              <div key={title} data-reveal data-delay={String(delay)} className="vs-why-card" style={{ ...card, background: gold ? SURFHI : SURF, border: gold ? "1px solid rgba(217,192,137,.18)" : "1px solid rgba(255,255,255,.07)" }}>
                <div style={{ fontSize: "15px", fontWeight: 700 }}>{title}</div>
                <div style={{ fontSize: "13.5px", color: "rgba(244,238,224,.5)", marginTop: "8px", lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section id="faq" style={{ position: "relative", zIndex: 2, maxWidth: "820px", margin: "0 auto", padding: "130px 40px 40px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div data-reveal style={eyebrow}>QUESTIONS</div>
            <h2 data-reveal data-delay="80" style={{ margin: 0, fontSize: "clamp(30px,4.2vw,50px)", lineHeight: 1.05, letterSpacing: "-.035em", fontWeight: 700 }}>
              Everything you need to know.
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { q: "How long does onboarding take?", a: "Most properties are live within a few days. We import your rooms, rates and existing reservations for you, walk your team through the platform, and stay close during your first weeks so the switch feels effortless." },
              { q: "Does it integrate with the channels I already use?", a: "Yes. ValtiqStay connects to the major booking channels and your own website's booking engine, keeping rates and availability synchronized both ways — so a booking anywhere updates everywhere, instantly." },
              { q: "How is pricing structured?", a: "Pricing scales with the size of your property and the modules you use. We'll put together a plan that fits your operation during your demo — no hidden fees, and clear terms from the start." },
              { q: "What kind of support is included?", a: "Every property gets a dedicated point of contact plus ongoing support from a team that understands hotels. When something matters at the front desk, you reach real people who can help quickly." },
              { q: "Can I manage more than one property?", a: "Absolutely. ValtiqStay is built for portfolios — switch between properties in a click, compare performance across your group, and manage teams and permissions from one account." },
              { q: "Is my data secure?", a: "Your data lives on secure cloud infrastructure with encryption in transit and at rest, regular backups and strict access controls — so your guest and business information stays protected." },
            ].map(({ q, a }, i) => {
              const open = openFaq.has(i);
              return (
                <div key={i} data-reveal data-delay={String(i * 60)} style={{ borderRadius: "16px", background: "#0E1730", border: `1px solid ${open ? "rgba(217,192,137,.3)" : "rgba(255,255,255,.08)"}`, overflow: "hidden", transition: "border-color .35s" }}>
                  <div onClick={() => toggleFaq(i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "22px 24px", cursor: "pointer" }}>
                    <span style={{ fontSize: "16.5px", fontWeight: 600 }}>{q}</span>
                    <span style={{ fontSize: "20px", color: GOLD2, transition: "transform .35s cubic-bezier(.16,1,.3,1)", flexShrink: 0, transform: open ? "rotate(135deg)" : "rotate(0deg)" }}>+</span>
                  </div>
                  <div style={{ maxHeight: open ? "300px" : "0", opacity: open ? 1 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(.16,1,.3,1),opacity .35s,margin .35s", padding: "0 24px 0" }}>
                    <p style={{ margin: "0 0 22px", fontSize: "15px", lineHeight: 1.6, color: "rgba(244,238,224,.6)" }}>{a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        <section id="cta" style={{ ...section, paddingTop: "120px", paddingBottom: "60px" }}>
          <div data-reveal style={{ position: "relative", borderRadius: "30px", padding: "88px 40px", textAlign: "center", overflow: "hidden", background: "radial-gradient(700px 380px at 50% 0%,rgba(217,192,137,.22),transparent 65%),linear-gradient(180deg,#101A32,#0A1122)", border: "1px solid rgba(217,192,137,.18)" }}>
            <div style={{ position: "absolute", left: "50%", top: "-120px", transform: "translateX(-50%)", width: "520px", height: "340px", borderRadius: "50%", background: "radial-gradient(circle,rgba(233,205,140,.16),transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontFamily: "var(--font-space-mono, monospace)", fontSize: "12px", letterSpacing: ".14em", color: GOLD2, marginBottom: "22px" }}>READY WHEN YOU ARE</div>
              <h2 style={{ margin: "0 auto", maxWidth: "760px", fontSize: "clamp(34px,5.4vw,68px)", lineHeight: 1.02, letterSpacing: "-.04em", fontWeight: 700 }}>
                Transform the way<br />your hotel operates.
              </h2>
              <p style={{ maxWidth: "520px", margin: "24px auto 0", fontSize: "18px", lineHeight: 1.55, color: "rgba(244,238,224,.6)" }}>
                See ValtiqStay on your own property. Book a personalised demo and we&apos;ll show you exactly how it fits your team.
              </p>
              <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", marginTop: "38px" }}>
                <button
                  data-magnetic
                  onClick={openDemo}
                  style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "17px 34px", borderRadius: "14px", background: GRAD, color: "#241802", border: "none", cursor: "pointer", fontSize: "16.5px", fontWeight: 700, boxShadow: "0 16px 44px rgba(217,192,137,.42)", fontFamily: "inherit" }}
                >
                  Book Your Demo <span>→</span>
                </button>
                <a
                  href="#platform"
                  data-magnetic
                  style={{ display: "inline-flex", alignItems: "center", gap: "9px", padding: "17px 30px", borderRadius: "14px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", color: IVORY, textDecoration: "none", fontSize: "16.5px", fontWeight: 600 }}
                >
                  Discover the Platform
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer style={{ position: "relative", zIndex: 2, borderTop: "1px solid rgba(255,255,255,.07)", marginTop: "60px" }}>
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "56px 40px 40px", display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: "40px" }}>
            {/* Brand */}
            <div>
              <a href="#top" style={{ display: "flex", alignItems: "center", gap: "11px", textDecoration: "none", color: IVORY, marginBottom: "16px" }}>
                <span style={{ display: "grid", placeItems: "center", width: "30px", height: "30px", borderRadius: "9px", background: GRAD }}>
                  <span style={{ width: "11px", height: "11px", background: BG, transform: "rotate(45deg)", borderRadius: "2px" }} />
                </span>
                <span style={{ fontWeight: 700, fontSize: "18px", letterSpacing: "-.02em" }}>ValtiqStay</span>
              </a>
              <p style={{ margin: 0, maxWidth: "280px", fontSize: "14px", lineHeight: 1.6, color: "rgba(244,238,224,.45)" }}>
                The all-in-one operating platform for modern hospitality.
              </p>
            </div>
            {/* Links */}
            {[
              { heading: "Platform", links: [["#features","Features"],["#showcase","Product tour"],["#platform","Integrations"],["#why","Why ValtiqStay"]] },
              { heading: "Company",  links: [["#top","About"],["#cta","Book a demo"],["#faq","FAQ"],["#cta","Contact"]] },
              { heading: "Legal",    links: [["#top","Privacy"],["#top","Terms"],["#top","Security"]] },
            ].map(({ heading, links }) => (
              <div key={heading}>
                <div style={{ fontSize: "12.5px", fontWeight: 700, color: "rgba(244,238,224,.5)", marginBottom: "16px", letterSpacing: ".02em" }}>{heading}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                  {links.map(([href, label]) => (
                    <a key={label} href={href} style={{ fontSize: "14px", color: "rgba(244,238,224,.6)", textDecoration: "none" }}>{label}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "22px 40px 44px", borderTop: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "rgba(244,238,224,.4)" }}>© 2026 ValtiqStay. All rights reserved.</span>
            <span style={{ fontFamily: "var(--font-space-mono, monospace)", fontSize: "12px", color: "rgba(244,238,224,.35)" }}>Crafted for hospitality.</span>
          </div>
        </footer>
      </div>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
}
