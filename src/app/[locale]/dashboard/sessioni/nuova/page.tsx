import { getTranslations } from "next-intl/server";
import { requireStaff } from "@/lib/supabase/server";
import { CreateSessionForm } from "@/components/dashboard/CreateSessionForm";
import { addDaysISO, todayISO } from "@/lib/dashboard/sessions";

/**
 * Create-link page: a stay + check-in session are created by the staff-only
 * create_checkin_session RPC (see actions.ts). Defaults: arrival today,
 * departure tomorrow, link valid 48 hours.
 */
export default async function NewSessionPage() {
  await requireStaff();
  const t = await getTranslations("dashboard.create");

  const today = todayISO();

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="font-serif text-3xl font-semibold text-gold">{t("title")}</h1>
      <p className="mt-1 text-sm text-champagne/80">{t("subtitle")}</p>
      <div className="mt-6 rounded-sm border border-navy-700 bg-navy-900 p-5">
        <CreateSessionForm
          defaultArrival={today}
          defaultDeparture={addDaysISO(today, 1)}
          defaultExpires={48}
        />
      </div>
    </div>
  );
}
