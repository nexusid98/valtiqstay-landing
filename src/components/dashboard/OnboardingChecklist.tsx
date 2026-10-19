import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { SetupChecklist } from "@/lib/onboarding/setup-checklist";

/**
 * M6-2 — First-setup checklist card on the dashboard home.
 *
 * Presentational only: the done / to-do state is computed outside this
 * component by the pure `buildSetupChecklist` function, so there is no state
 * logic to test here. Server component (no client JS needed) — every action is
 * a link to an existing dashboard page.
 *
 * Every step is done: the card collapses into a short closing note instead of
 * disappearing, so the hotelier still learns the setup is finished (and the
 * dashboard layout does not jump on the last tick).
 */
export async function OnboardingChecklist({
  checklist,
  locale,
}: {
  checklist: SetupChecklist;
  locale: string;
}) {
  const t = await getTranslations("dashboard.onboarding");

  if (checklist.allDone) {
    return (
      <section
        id="setup"
        aria-labelledby="setup-done-heading"
        className="mt-8 rounded-sm border border-gold/40 bg-navy-900 p-5"
      >
        <h2
          id="setup-done-heading"
          className="flex items-center gap-2 font-serif text-xl text-gold"
        >
          <CheckMark />
          {t("allDoneTitle")}
        </h2>
        <p className="mt-1 text-sm text-navy-300">{t("allDoneBody")}</p>
      </section>
    );
  }

  return (
    <section
      id="setup"
      aria-labelledby="setup-heading"
      className="mt-8 rounded-sm border border-navy-700 bg-navy-900 p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="setup-heading" className="font-serif text-xl text-champagne">
          {t("title")}
        </h2>
        <p className="text-sm text-gold">
          {t("progress", { done: checklist.completed, total: checklist.total })}
        </p>
      </div>
      <p className="mt-1 text-sm text-navy-300">{t("subtitle")}</p>
      <ol className="mt-4 space-y-3">
        {checklist.items.map((item) => (
          <li
            key={item.id}
            className="flex items-start gap-3 rounded-sm border border-navy-800 bg-navy-950 p-3"
          >
            <span className="mt-0.5 shrink-0">
              {item.done ? <CheckMark /> : <PendingCircle />}
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-baseline gap-2">
                <span className="text-champagne">{t(`items.${item.id}.title`)}</span>
                <span
                  className={`text-xs uppercase tracking-wide ${
                    item.done ? "text-gold" : "text-navy-400"
                  }`}
                >
                  {item.done ? t("done") : t("todo")}
                </span>
              </p>
              <p className="mt-0.5 text-sm text-navy-300">{t(`items.${item.id}.description`)}</p>
              {!item.done && item.href ? (
                <Link
                  href={`/${locale}${item.href}`}
                  className="mt-1 inline-block text-sm text-gold underline underline-offset-4 transition-colors hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-lighter"
                >
                  {t("action")}
                </Link>
              ) : null}
              {!item.done && !item.href ? (
                <p className="mt-1 text-xs text-navy-400">{t(`items.${item.id}.hint`)}</p>
              ) : null}
              <span className="sr-only">{item.done ? t("doneLabel") : t("todoLabel")}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Gold tick — inline SVG so no icon dependency is added. */
function CheckMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5 shrink-0 fill-none stroke-gold"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="8.5" className="stroke-gold/40" />
      <path d="M6 10.5l2.5 2.5L14 7.5" />
    </svg>
  );
}

/** Empty champagne circle for a step still to do. */
function PendingCircle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-5 w-5 shrink-0 fill-none stroke-navy-400"
      strokeWidth="1.5"
    >
      <circle cx="10" cy="10" r="8" />
    </svg>
  );
}
