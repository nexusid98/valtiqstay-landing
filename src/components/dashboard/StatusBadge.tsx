import { statusBadgeClasses, type SessionStatus } from "@/lib/dashboard/sessions";

/**
 * Pill-shaped status badge. Presentational (server-safe): the translated label
 * is passed in by the caller so this component stays free of i18n plumbing.
 */
export function StatusBadge({ status, label }: { status: SessionStatus; label: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClasses(status)}`}
    >
      {label}
    </span>
  );
}
