import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-serif text-5xl font-bold text-gold">{t("title")}</h1>
      <p className="mt-4 text-champagne">Luxury hospitality, simplified.</p>
    </main>
  );
}
