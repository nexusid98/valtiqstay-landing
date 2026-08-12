import type { Config } from "tailwindcss";

/**
 * ValtiqStay design tokens — Stitch-derived palette.
 * Navy (#081120) is the primary surface/text; gold (#D4AF37) is the accent,
 * used only for hairlines, the arrival moment and one key CTA per screen.
 * Champagne (#E8DCC8) is the everyday UI accent (borders, active states,
 * secondary emphasis). Neutrals are derived from navy tones.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          "50": "#eef2f8",
          "100": "#d8e0ec",
          "200": "#b0c0d6",
          "300": "#849ab9",
          "400": "#587397",
          "500": "#3b5374",
          "600": "#2b3d58",
          "700": "#1e2c42",
          "800": "#141f31",
          "900": "#0d1624",
          "950": "#081120",
          DEFAULT: "#081120",
        },
        gold: {
          lighter: "#f2e6bb",
          light: "#e3c96f",
          DEFAULT: "#d4af37",
          dark: "#b3922c",
          darker: "#8a6f1f",
        },
        champagne: {
          lighter: "#f7f2e8",
          light: "#f0e8d8",
          DEFAULT: "#e8dcc8",
          dark: "#d4c4a8",
          darker: "#c0ac8c",
        },
      },
      fontFamily: {
        // Resolve through the CSS variables that next/font/google sets on
        // <body> (src/app/layout.tsx) — Playfair Display / Inter are
        // self-hosted, so these never silently fall back. The original
        // stacks are kept as trailing fallbacks.
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
