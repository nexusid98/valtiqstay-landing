import type { Config } from "tailwindcss";

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
          "50": "#f0f2f5",
          "100": "#d9dde5",
          "200": "#b3bccc",
          "300": "#8d9bb3",
          "400": "#677a9a",
          "500": "#4a5d80",
          "600": "#3a4a66",
          "700": "#2a374d",
          "800": "#1a2433",
          "900": "#0f1729",
          "950": "#0a0f1c",
          DEFAULT: "#0f1729",
        },
        gold: {
          lighter: "#e0cc98",
          light: "#d4b87a",
          DEFAULT: "#c8a45c",
          dark: "#b8923e",
          darker: "#a07e2c",
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
    },
  },
  plugins: [],
};

export default config;
