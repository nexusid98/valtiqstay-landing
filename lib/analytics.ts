/**
 * Analytics utility — provider-agnostic event tracking.
 * Fires to Google Analytics 4 (gtag) and Segment if present on window.
 * Add your provider initialisation in app/layout.tsx or a <Script> tag.
 *
 * Usage:
 *   import { track } from "@/lib/analytics";
 *   track("cta_click", { category: "hotel", label: "hero_demo" });
 */

export type TrackEventName =
  | "cta_click"
  | "modal_open"
  | "modal_close"
  | "form_submit"
  | "form_success"
  | "form_error"
  | "intro_skip"
  | "lang_toggle"
  | "section_view"
  | "video_play";

export interface TrackEventProps {
  category?: "hotel" | "traveler" | "general";
  label?: string;
  value?: string | number;
}

type GtagFn = (
  command: string,
  eventName: string,
  params?: Record<string, unknown>
) => void;

type SegmentAnalytics = {
  track: (event: string, props?: Record<string, unknown>) => void;
};

export function track(event: TrackEventName, props?: TrackEventProps): void {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[ValtiqStay Analytics]", event, props ?? {});
  }

  if (typeof window === "undefined") return;

  const w = window as typeof window & {
    gtag?: GtagFn;
    analytics?: SegmentAnalytics;
  };

  if (w.gtag) {
    w.gtag("event", event, {
      event_category: props?.category ?? "general",
      event_label: props?.label,
      value: props?.value,
    });
  }

  if (w.analytics) {
    w.analytics.track(event, {
      category: props?.category,
      label: props?.label,
      value: props?.value,
    });
  }
}
