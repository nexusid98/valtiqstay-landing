/**
 * Pure helpers + shared types for the staff dashboard's session list and
 * create-link form. No I/O here — everything is unit-testable and free of
 * request context (see origin.ts for the headers-based origin helper).
 */

/** The statuses a check-in session can show in the dashboard. */
export type SessionStatus =
  | "pending"
  | "in_progress"
  | "submitted"
  | "verified"
  | "expired";

export const SESSION_STATUSES: readonly SessionStatus[] = [
  "pending",
  "in_progress",
  "submitted",
  "verified",
  "expired",
];

/**
 * The effective status shown in the list: the DB never flips a 'pending'
 * session to 'expired' on its own, so a pending session whose link has passed
 * its expiry time is displayed as expired (display-only; the DB row is not
 * touched).
 */
export function effectiveStatus(
  status: string,
  expiresAt: string | null,
  now: Date = new Date(),
): SessionStatus {
  if (status === "pending" && expiresAt && new Date(expiresAt).getTime() <= now.getTime()) {
    return "expired";
  }
  return SESSION_STATUSES.includes(status as SessionStatus)
    ? (status as SessionStatus)
    : "pending";
}

/**
 * Tailwind classes for the status badge, keyed off the design tokens
 * (navy/gold/champagne only — never ad-hoc hex). The shared base styles
 * (pill shape, size) live in the StatusBadge component.
 */
export function statusBadgeClasses(status: SessionStatus): string {
  switch (status) {
    case "pending":
      return "border-champagne/40 text-champagne";
    case "in_progress":
      return "border-gold text-gold";
    case "submitted":
      return "border-gold/60 bg-gold/10 text-gold-light";
    case "verified":
      return "border-gold bg-gold text-navy-950";
    case "expired":
      return "border-navy-400 text-navy-400";
  }
}

/**
 * Absolute guest check-in URL from the request origin and the RPC-provided
 * link path (e.g. "/it/c/bella-vista-arrivo-3fa91c20"). Tolerates a trailing
 * slash on the origin and a missing leading slash on the path.
 */
export function buildCheckinUrl(origin: string, linkPath: string): string {
  const base = origin.replace(/\/+$/, "");
  const path = linkPath.startsWith("/") ? linkPath : `/${linkPath}`;
  return `${base}${path}`;
}

/** i18n keys under dashboard.create.error — kept in sync with the locale files. */
export type CreateSessionErrorKey =
  | "staffOnly"
  | "invalidData"
  | "duplicateBooking"
  | "tokenCollision"
  | "generic";

/**
 * Maps an error code raised by the create_checkin_session RPC (the RAISE
 * EXCEPTION message arrives in the PostgREST error.message) onto a
 * translation key. Unknown or missing codes fall back to "generic".
 */
export function mapCreateSessionError(code: string | undefined): CreateSessionErrorKey {
  switch (code) {
    case "staff_only":
      return "staffOnly";
    case "invalid_data":
      return "invalidData";
    case "duplicate_booking":
      return "duplicateBooking";
    case "token_collision":
      return "tokenCollision";
    default:
      return "generic";
  }
}

/** "2026-08-16" from a local Date (no UTC drift). */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today as "yyyy-mm-dd" in the server's local timezone. */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Adds whole days to an "yyyy-mm-dd" string (used for the default departure). */
export function addDaysISO(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** True for a real calendar date in "yyyy-mm-dd" form (UTC-safe). */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** A session row as rendered in the dashboard list (flattened, typed). */
export interface ListedSession {
  token: string;
  status: SessionStatus;
  stays: {
    id: string;
    arrival_date: string;
    departure_date: string;
    room_label: string | null;
    booking_ref: string | null;
  } | null;
  expires_at: string | null;
  submitted_at: string | null;
  created_at: string;
  guestCount: number;
}
