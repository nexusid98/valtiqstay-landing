import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

/**
 * Self-hosted type (next/font/google) — Playfair Display for display/headings,
 * Inter for UI/body. The CSS variables are named --font-serif / --font-sans to
 * match the design tokens in src/styles/tokens.css; tailwind.config.ts maps the
 * font-serif / font-sans utilities onto them. Fallbacks (Georgia, system-ui)
 * are kept in tailwind.config.ts after the variable.
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ValtiqStay",
  description: "Luxury hospitality, simplified.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body
        className={`${playfair.variable} ${inter.variable} min-h-screen bg-navy font-sans text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
