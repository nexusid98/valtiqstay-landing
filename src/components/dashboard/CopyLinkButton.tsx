"use client";

import { useState } from "react";

/**
 * Copies a URL to the clipboard with a transient "copied" state. Falls back
 * to execCommand on non-secure contexts (e.g. plain-HTTP local dev) where
 * navigator.clipboard is unavailable. Labels come from the caller so the same
 * component serves the session list and the create-link success panel.
 */
export function CopyLinkButton({
  url,
  label,
  copiedLabel,
}: {
  url: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — leave the button in its default state.
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center rounded-sm border border-navy-600 px-3 py-1.5 text-sm text-champagne transition-colors hover:border-gold hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
