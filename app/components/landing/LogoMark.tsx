"use client";

/* ValtiqStay brand mark — faithful recreation of the official logo.
   V-mark: left arm gold (#C4A850), right arm navy (#1B2A4A), 4-pointed star gold.
   Wordmark: "Valtiq" navy + "Stay" gold in Cormorant Garamond. */

export function VLogoMark({ size = 40 }: { size?: number }) {
  const w = size * (100 / 105);   /* viewBox 100×105 */
  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 100 105"
      fill="none"
      aria-hidden="true"
    >
      {/* Right arm — navy (drawn first, behind) */}
      <polygon points="62,3 88,3 74,78 50,78" fill="#1B2A4A" />

      {/* Left arm — gold (drawn on top) */}
      <polygon points="12,3 38,3 50,78 26,78" fill="#C4A850" />

      {/* 4-pointed sparkle star */}
      <path
        d="M50,83 L52.5,89.5 L59,92 L52.5,94.5 L50,101 L47.5,94.5 L41,92 L47.5,89.5 Z"
        fill="#C4A850"
      />
    </svg>
  );
}

export function ValtiqStayWordmark({
  navSize = false,
}: {
  navSize?: boolean;
}) {
  const sz = navSize ? 19 : 28;
  return (
    <span
      style={{
        fontFamily: "var(--font-cormorant, Georgia, serif)",
        fontSize: sz,
        fontWeight: 600,
        letterSpacing: "-.01em",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      <span style={{ color: "#1B2A4A" }}>Valtiq</span>
      <span style={{ color: "#C4A850" }}>Stay</span>
    </span>
  );
}

export function FullLogo({
  markSize = 48,
  navSize = false,
}: {
  markSize?: number;
  navSize?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: markSize * 0.28 }}>
      <VLogoMark size={markSize} />
      <ValtiqStayWordmark navSize={navSize} />
    </div>
  );
}
