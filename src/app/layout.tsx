import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen bg-navy font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
