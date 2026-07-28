import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Accesso staff",
  robots: "noindex, nofollow",
};

export default function LoginPage() {
  return <LoginClient />;
}
