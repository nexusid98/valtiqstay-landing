"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError, type LoginErrorKey } from "@/lib/auth/errors";

/**
 * Hotel staff sign-in. Email + password via the browser Supabase client;
 * on success the session cookie is set and the user is sent to the
 * dashboard. Wrong credentials render an inline, localized error.
 */
export default function LoginPage() {
  const t = useTranslations("dashboard.login");
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<LoginErrorKey | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(mapAuthError(authError.code));
      setSubmitting(false);
      return;
    }

    router.push(`/${params.locale}/dashboard`);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="text-center text-xs uppercase tracking-[0.25em] text-champagne">
          {t("kicker")}
        </p>
        <h1 className="mt-3 text-center font-serif text-4xl font-bold text-gold">
          {t("title")}
        </h1>
        <p className="mt-2 text-center text-sm text-champagne/80">{t("subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate={false}>
          <div>
            <label htmlFor="email" className="block text-sm text-champagne">
              {t("email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-sm border border-navy-700 bg-navy-900 px-3.5 py-2.5 text-white placeholder:text-navy-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-champagne">
              {t("password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-sm border border-navy-700 bg-navy-900 px-3.5 py-2.5 text-white placeholder:text-navy-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-gold-light">
              {t(`error.${error}`)}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm bg-gold px-4 py-3 font-medium text-navy-950 transition-colors hover:bg-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter disabled:opacity-60"
          >
            {submitting ? t("submitting") : t("submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
