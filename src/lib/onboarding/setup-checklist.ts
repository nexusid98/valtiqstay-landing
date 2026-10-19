/**
 * M6-2 — Pure first-setup checklist logic for the hotel dashboard.
 *
 * Read-only: this module never touches the database, an RPC or a migration. It
 * takes the rows the dashboard already reads (hotel profile, upsell items,
 * check-in sessions) and turns them into a small, ordered list of steps with a
 * done / to-do state. Keeping it pure means the UI components stay presentational
 * and the thresholds below are unit-testable without a Supabase connection.
 */
import { effectiveStatus, type SessionStatus } from "@/lib/dashboard/sessions";
import { locales as SUPPORTED_LOCALES } from "@/lib/i18n/config";

/** The four setup steps, in display order. */
export type SetupStepId = "hotelProfile" | "upsellItems" | "checkinLink" | "firstCheckin";

/**
 * The subset of `public.hotels` the profile step looks at. The column set is
 * exactly the one defined in migration 01 §2a (`hotels`): id, slug, name,
 * logo_url, hero_url, accent_*, locale, alloggiati_credentials,
 * doc_retention_days, created_at, updated_at.
 */
export interface HotelProfileInput {
  name: string | null;
  slug: string | null;
  locale: string | null;
  logo_url: string | null;
  hero_url: string | null;
}

/** The subset of `public.upsell_items` the extras step looks at. */
export interface UpsellItemInput {
  active: boolean | null;
}

/** The subset of `public.checkin_sessions` the last two steps look at. */
export interface SessionInput {
  status: SessionStatus | string;
  expires_at: string | null;
}

export interface SetupChecklistInput {
  profile: HotelProfileInput | null;
  upsellItems: readonly UpsellItemInput[] | null;
  sessions: readonly SessionInput[] | null;
}

export interface SetupChecklistItem {
  id: SetupStepId;
  done: boolean;
  /**
   * Dashboard-relative path (locale is added by the caller, e.g.
   * `/dashboard/sessioni/nuova`) or `null` when the step is informational and
   * no in-app page can complete it yet.
   */
  href: string | null;
}

export interface SetupChecklist {
  items: SetupChecklistItem[];
  completed: number;
  total: number;
  /** True when every step is done — the component then collapses to a short note. */
  allDone: boolean;
}

/** Display order of the steps. */
export const SETUP_STEP_IDS: readonly SetupStepId[] = [
  "hotelProfile",
  "upsellItems",
  "checkinLink",
  "firstCheckin",
];

/**
 * Locale-relative dashboard paths, so the pure output stays locale-agnostic.
 * Exported (with `SETUP_STEP_IDS`) so tests and UI copy can derive "which step
 * has a link and which is informational" from the same source of truth the
 * checklist itself uses — no second, drifting list of step ids.
 */
export const SETUP_STEP_HREFS: Record<SetupStepId, string | null> = {
  hotelProfile: null,
  upsellItems: "/dashboard/fatturazione",
  checkinLink: "/dashboard/sessioni/nuova",
  firstCheckin: null,
};

/** Shortest hotel name we accept as "filled in" (guards against " " / "-"). */
const MIN_HOTEL_NAME_LENGTH = 2;

/**
 * A hotel profile counts as complete when the identity the guest actually sees
 * is in place: a real name, a URL slug, a supported guest locale, and at least
 * one brand image (logo or hero).
 *
 * Why these fields: `public.hotels` (migration 01 §2a) has no street address,
 * city or "default document type" column, so the brief's suggested
 * "nome + indirizzo/comune + tipo documento" cannot be evaluated against real
 * data. We therefore use the columns that do exist and that matter to the guest
 * check-in screen (hotel name + branding) plus the guest language, instead of
 * inventing a requirement the schema cannot answer.
 */
export function isHotelProfileComplete(profile: HotelProfileInput | null): boolean {
  if (!profile) return false;
  const name = profile.name?.trim() ?? "";
  const slug = profile.slug?.trim() ?? "";
  const locale = profile.locale?.trim() ?? "";
  const hasBrandImage = Boolean(profile.logo_url?.trim() || profile.hero_url?.trim());
  return (
    name.length >= MIN_HOTEL_NAME_LENGTH &&
    slug.length > 0 &&
    (SUPPORTED_LOCALES as readonly string[]).includes(locale) &&
    hasBrandImage
  );
}

/** At least one upsell item the guest can actually see and buy (`active`). */
export function hasActiveUpsellItem(items: readonly UpsellItemInput[] | null): boolean {
  return (items ?? []).some((item) => item.active === true);
}

/**
 * A row in `checkin_sessions` only exists after `create_checkin_session`
 * generated a token, so "at least one row" == "at least one check-in link".
 */
export function hasCheckinLink(sessions: readonly SessionInput[] | null): boolean {
  return (sessions ?? []).length > 0;
}

/**
 * A guest has registered when a session reached `submitted` (data sent) or
 * `verified` (checked by the hotel). Expiry is resolved with the shared
 * `effectiveStatus` helper and an injectable `now`, so the result is
 * deterministic in tests.
 */
export function hasReceivedFirstCheckin(
  sessions: readonly SessionInput[] | null,
  now: Date = new Date(),
): boolean {
  return (sessions ?? []).some((session) => {
    const status = effectiveStatus(session.status, session.expires_at, now);
    return status === "submitted" || status === "verified";
  });
}

/**
 * Builds the ordered checklist. Never throws on missing data: a hotel with no
 * profile row, no extras and no sessions simply gets four to-do steps.
 */
export function buildSetupChecklist(
  input: SetupChecklistInput,
  now: Date = new Date(),
): SetupChecklist {
  const done: Record<SetupStepId, boolean> = {
    hotelProfile: isHotelProfileComplete(input.profile),
    upsellItems: hasActiveUpsellItem(input.upsellItems),
    checkinLink: hasCheckinLink(input.sessions),
    firstCheckin: hasReceivedFirstCheckin(input.sessions, now),
  };

  const items = SETUP_STEP_IDS.map((id) => ({
    id,
    done: done[id],
    href: SETUP_STEP_HREFS[id],
  }));

  const completed = items.filter((item) => item.done).length;
  return {
    items,
    completed,
    total: items.length,
    allDone: completed === items.length,
  };
}
