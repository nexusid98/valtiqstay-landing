import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { getLocale } from "next-intl/server";
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

/**
 * Baseline metadata for routes that sit outside the [locale] segment (there are
 * none today, but Next requires a root value for the fields that are not
 * overridden further down). Every user-visible title/description/hreflang is
 * localized in src/app/[locale]/layout.tsx.
 */
export const metadata: Metadata = {
  applicationName: "ValtiqStay",
  title: { default: "ValtiqStay", template: "ValtiqStay — %s" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/logo-valtiqstay.png", type: "image/png", sizes: "1024x1024" }],
    apple: [{ url: "/logo-valtiqstay.png", sizes: "1024x1024" }],
  },
};

/** PWA chrome: navy status bar / title bar on mobile browsers. */
export const viewport: Viewport = {
  themeColor: "#081120",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The locale lives in the URL and is resolved by the next-intl middleware;
  // getLocale() falls back to the default locale (Italian) when it is absent,
  // so <html lang> is always a real BCP-47 tag instead of a hardcoded "it".
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${playfair.variable} ${inter.variable} min-h-screen bg-navy font-sans text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
