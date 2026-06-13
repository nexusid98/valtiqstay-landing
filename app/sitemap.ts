/**
 * app/sitemap.ts — Fix #15
 *
 * Next.js App Router generates /sitemap.xml from this file at build time.
 * Place this file at: app/sitemap.ts
 * Add more entries here as you create new pages (privacy, terms, etc.).
 */

import type { MetadataRoute } from "next";

const SITE_URL = "https://www.valtiqstay.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:             SITE_URL,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        1,
    },
    // Add additional pages below when created:
    // { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.5 },
    // { url: `${SITE_URL}/terms`,   changeFrequency: "yearly", priority: 0.5 },
  ];
}
