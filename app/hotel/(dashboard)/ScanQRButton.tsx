"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

function extractToken(raw: string): string | null {
  const byUrl = raw.match(/\/s\/(vltq-[a-z0-9-]+)/);
  if (byUrl) return byUrl[1];
  if (/^vltq-[a-z0-9-]+$/.test(raw.trim())) return raw.trim();
  return null;
}

export default function ScanQRButton() {
  const [open, setOpen] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [err, setErr] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const router = useRouter();

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const close = useCallback(() => {
    stopCamera();
    setOpen(false);
    setLinkInput("");
    setErr("");
    setScanning(false);
  }, [stopCamera]);

  const navigate = useCallback(
    (token: string) => {
      close();
      router.push(`/hotel/r/token/${token}`);
    },
    [close, router]
  );

  function handleSubmit() {
    const token = extractToken(linkInput);
    if (!token) {
      setErr("Link non valido. Formato atteso: .../s/vltq-…");
      return;
    }
    navigate(token);
  }

  async function startScan() {
    setErr("");
    if (!("BarcodeDetector" in window)) {
      setErr("Scansione QR non supportata su questo browser. Usa Chrome o Edge.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanning(true);

      // @ts-expect-error BarcodeDetector not yet in TS lib
      const detector = new BarcodeDetector({ formats: ["qr_code"] });

      const loop = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const token = extractToken(barcodes[0].rawValue as string);
            if (token) { navigate(token); return; }
          }
        } catch { /* ignore mid-frame errors */ }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setErr("Accesso alla fotocamera negato o non disponibile.");
    }
  }

  useEffect(() => () => stopCamera(), [stopCamera]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(212,180,131,0.07)",
          color: "rgba(212,180,131,0.7)",
          border: "1px solid rgba(212,180,131,0.18)",
          borderRadius: 7,
          padding: "7px 13px",
          fontSize: 13,
          cursor: "pointer",
          letterSpacing: "0.03em",
          transition: "all 0.18s ease",
          whiteSpace: "nowrap",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <path d="M14 14h3v3h-3z M17 17h3v3h-3z"/>
        </svg>
        Cerca ospite
      </button>
    );
  }

  return (
    <>
      <div
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 50,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 51,
          background: "linear-gradient(135deg, #0A1931 0%, #050B17 100%)",
          border: "1px solid rgba(212,180,131,0.22)",
          borderRadius: 16,
          padding: "28px 28px 24px",
          width: "min(420px, 90vw)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.65)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Chiudi"
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            color: "rgba(245,233,211,0.35)",
            cursor: "pointer",
            fontSize: 22,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>

        <h3
          style={{
            margin: "0 0 20px",
            fontFamily: "var(--font-cormorant)",
            fontSize: 22,
            fontWeight: 400,
            color: "#D4B483",
            letterSpacing: "0.06em",
          }}
        >
          Cerca prenotazione ospite
        </h3>

        <label
          style={{
            display: "block",
            fontSize: 11,
            color: "rgba(245,233,211,0.4)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 7,
          }}
        >
          Incolla link o token check-in
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <input
            type="text"
            autoFocus
            value={linkInput}
            onChange={(e) => { setLinkInput(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="https://valtiqstay.com/s/vltq-…"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,180,131,0.22)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#F5E9D3",
              fontSize: 13,
              outline: "none",
              minWidth: 0,
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              background: "rgba(212,180,131,0.13)",
              color: "#D4B483",
              border: "1px solid rgba(212,180,131,0.3)",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Apri
          </button>
        </div>

        <div style={{ borderTop: "1px solid rgba(212,180,131,0.1)", paddingTop: 18 }}>
          {!scanning ? (
            <button
              onClick={startScan}
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(212,180,131,0.05)",
                border: "1px dashed rgba(212,180,131,0.22)",
                borderRadius: 8,
                color: "rgba(212,180,131,0.65)",
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Scansiona QR con fotocamera
            </button>
          ) : (
            <div style={{ position: "relative" }}>
              <video
                ref={videoRef}
                style={{ width: "100%", borderRadius: 8, display: "block", background: "#000", maxHeight: 260, objectFit: "cover" }}
                playsInline
                muted
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  border: "2px solid rgba(212,180,131,0.5)",
                  borderRadius: 8,
                  pointerEvents: "none",
                }}
              />
              <button
                onClick={() => { stopCamera(); setScanning(false); }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Stop
              </button>
            </div>
          )}
        </div>

        {err && (
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#f87171", lineHeight: 1.4 }}>
            {err}
          </p>
        )}
      </div>
    </>
  );
}
