import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Manrope, Space_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/**
 * Fallback metadata — overridden by page.tsx (which provides the full
 * title, description, OG tags, Twitter card, etc.)
 * Only used if a route doesn't export its own metadata object.
 */
export const metadata: Metadata = {
  title: {
    default:  "ValtiqStay",
    template: "%s | ValtiqStay",
  },
  description: "Identità digitale verificata per l'ospitalità moderna",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * lang="it" — site starts in Italian.
     * HomeClient.tsx updates this dynamically via
     *   document.documentElement.lang = lang
     * whenever the user toggles IT/EN (fix #14).
     */
    <html
      lang="en"
      className={`${cormorant.variable} ${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
