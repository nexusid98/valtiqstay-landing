"use client";

import { useEffect, useRef } from "react";

/**
 * Client-side QR code renderer using the `qrcode` library.
 * Avoids sending the check-in token to any external service.
 */
export function QRCodeImage({
  url,
  size = 200,
  style,
}: {
  url: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !ref.current) return;
      QRCode.toString(url, { type: "svg", margin: 2, width: size }).then((svg) => {
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [url, size]);

  return (
    <div
      ref={ref}
      style={{ width: size, height: size, display: "block", ...style }}
    />
  );
}
