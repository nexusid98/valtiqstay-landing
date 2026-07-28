/**
 * app/page.tsx — Server Component
 *
 * Fix #1: This file exists to export `metadata` (title, description, OG tags,
 * Twitter card, robots, canonical). A "use client" file cannot export metadata
 * in Next.js App Router, so the interactive page logic lives in HomeClient.tsx
 * while this thin wrapper handles all SEO concerns.
 *
 * Replace the domain "https://www.valtiqstay.com" with your production URL
 * and add a real OG image at /public/og-image.png before deploying.
 */

import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const SITE_URL = "https://www.valtiqstay.com";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  /* ── Core ─────────────────────────────────────────────────────────── */
  title: {
    default:  "ValtiqStay — Identità digitale verificata per l'ospitalità moderna",
    template: "%s | ValtiqStay",
  },
  description:
    "Piattaforma di check-in digitale per hotel. Verifica l'identità degli ospiti, elimina i documenti cartacei e automatizza il check-in con QR code sicuri. Integrazione con i principali PMS.",
  keywords: [
    "check-in digitale",
    "identità ospiti",
    "digital passport hotel",
    "PMS integration",
    "hospitality SaaS",
    "verifica identità hotel",
    "digital check-in",
  ],

  /* ── Open Graph ────────────────────────────────────────────────────── */
  openGraph: {
    title:       "ValtiqStay — Digital Guest Identity for Hotels",
    description:
      "Reduce check-in time by 70%. Verify guest identity, collect consent and enable frictionless check-in with a single QR code.",
    type:        "website",
    url:         SITE_URL,
    siteName:    "ValtiqStay",
    locale:      "it_IT",
    alternateLocale: ["en_GB"],
    images: [
      {
        url:    OG_IMAGE,
        width:  1200,
        height: 630,
        alt:    "ValtiqStay — Digital Guest Identity Platform",
      },
    ],
  },

  /* ── Twitter / X ────────────────────────────────────────────────────── */
  twitter: {
    card:        "summary_large_image",
    title:       "ValtiqStay — Digital Guest Identity for Hotels",
    description:
      "Reduce check-in time by 70% with verified digital identity and consent-based QR code check-in.",
    images:      [OG_IMAGE],
  },

  /* ── Robots ────────────────────────────────────────────────────────── */
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:              true,
      follow:             true,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  /* ── Canonical / hreflang ──────────────────────────────────────────── */
  alternates: {
    canonical: SITE_URL,
    languages: {
      "it": SITE_URL,
      "en": SITE_URL,
    },
  },

  /* ── Icons ──────────────────────────────────────────────────────────── */
  icons: {
    icon:             "/favicon.ico",
    apple:            "/apple-touch-icon.png",
    shortcut:         "/favicon-32x32.png",
  },
/* ── Manifest / theme ─────────────────────────────────── */
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: "#172033",
};

export default function Page() {
  return <HomeClient />;
}