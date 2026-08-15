"use client";
import { useState } from "react";

/**
 * "Scarica" button for a single uploaded document. Calls the signed-URL route
 * (/api/dashboard/documents/[documentId]/signed-url), then opens the
 * short-lived URL in a new tab. Labels come from the caller so the component
 * stays free of i18n plumbing (same convention as CopyLinkButton).
 */
export function DocumentDownloadButton({
  documentId,
  label,
  loadingLabel,
  errorLabel,
}: {
  documentId: string;
  label: string;
  loadingLabel: string;
  errorLabel: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function handleDownload() {
    setState("loading");
    try {
      const res = await fetch(
        `/api/dashboard/documents/${encodeURIComponent(documentId)}/signed-url`,
        { method: "GET" },
      );
      if (!res.ok) {
        setState("error");
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (!data.url) {
        setState("error");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={state === "loading"}
        className="inline-flex items-center rounded-sm border border-navy-600 px-3 py-1.5 text-sm text-champagne transition-colors hover:border-gold hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter disabled:cursor-wait disabled:opacity-60"
      >
        {state === "loading" ? loadingLabel : label}
      </button>
      {state === "error" && (
        <span className="text-xs text-gold-dark">{errorLabel}</span>
      )}
    </span>
  );
}
