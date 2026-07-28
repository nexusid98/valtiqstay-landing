/**
 * app/robots.ts — Fix #15
 *
 * Next.js App Router generates /robots.txt from this file at build time.
 * Place this file at: app/robots.ts
 */

import type { MetadataRoute } from "next";

const SITE_URL = "https://www.valtiqstay.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  [
          "/api/",        // server endpoints
          "/_next/",      // Next.js internals
          "/admin/",      // admin panel (if added later)
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
