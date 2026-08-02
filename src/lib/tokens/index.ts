/**
 * ValtiqStay design tokens — Stitch-derived palette.
 * Single source of truth for TypeScript consumers.
 * Navy: Stitch Deep Navy #081120 · Gold: Stitch Luxury Gold #D4AF37
 */
export const tokens = {
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
    serif: ["Playfair Display", "Georgia", "serif"],
    sans: ["Inter", "system-ui", "sans-serif"],
  },
} as const;
