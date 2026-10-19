import { describe, expect, it } from "vitest";
import itMessages from "@/lib/i18n/locales/it.json";
import enMessages from "@/lib/i18n/locales/en.json";
import {
  buildSetupChecklist,
  hasActiveUpsellItem,
  hasCheckinLink,
  hasReceivedFirstCheckin,
  isHotelProfileComplete,
  SETUP_STEP_HREFS,
  SETUP_STEP_IDS,
  type HotelProfileInput,
  type SessionInput,
  type SetupStepId,
} from "./setup-checklist";

/** The seeded shape of Hotel Bella Vista (seed.sql) with branding filled in. */
const completeProfile: HotelProfileInput = {
  name: "Hotel Bella Vista",
  slug: "bella-vista",
  locale: "it",
  logo_url: "https://cdn.example.com/logo.png",
  hero_url: null,
};

/** Fixed clock so expiry handling is deterministic. */
const NOW = new Date("2026-10-18T12:00:00.000Z");
const future = "2026-10-25T12:00:00.000Z";
const past = "2026-10-11T12:00:00.000Z";

describe("isHotelProfileComplete", () => {
  it("accepts a named, localized hotel with a brand image", () => {
    expect(isHotelProfileComplete(completeProfile)).toBe(true);
  });

  it("accepts a hero image as the only brand asset", () => {
    expect(
      isHotelProfileComplete({ ...completeProfile, logo_url: null, hero_url: "https://x/h.jpg" }),
    ).toBe(true);
  });

  it("rejects a missing profile row", () => {
    expect(isHotelProfileComplete(null)).toBe(false);
  });

  it("rejects a blank or one-letter hotel name", () => {
    expect(isHotelProfileComplete({ ...completeProfile, name: "   " })).toBe(false);
    expect(isHotelProfileComplete({ ...completeProfile, name: "A" })).toBe(false);
  });

  it("rejects a missing slug", () => {
    expect(isHotelProfileComplete({ ...completeProfile, slug: null })).toBe(false);
  });

  it("rejects an unsupported guest locale", () => {
    expect(isHotelProfileComplete({ ...completeProfile, locale: "fr" })).toBe(false);
    expect(isHotelProfileComplete({ ...completeProfile, locale: null })).toBe(false);
  });

  it("rejects a hotel with no branding at all", () => {
    expect(
      isHotelProfileComplete({ ...completeProfile, logo_url: null, hero_url: null }),
    ).toBe(false);
    expect(isHotelProfileComplete({ ...completeProfile, logo_url: "  ", hero_url: "" })).toBe(false);
  });
});

describe("hasActiveUpsellItem", () => {
  it("is false without data", () => {
    expect(hasActiveUpsellItem(null)).toBe(false);
    expect(hasActiveUpsellItem([])).toBe(false);
  });

  it("is false when every extra is disabled", () => {
    expect(hasActiveUpsellItem([{ active: false }, { active: null }])).toBe(false);
  });

  it("is true with a single active extra", () => {
    expect(hasActiveUpsellItem([{ active: false }, { active: true }])).toBe(true);
  });
});

describe("hasCheckinLink", () => {
  it("is false without sessions", () => {
    expect(hasCheckinLink(null)).toBe(false);
    expect(hasCheckinLink([])).toBe(false);
  });

  it("is true as soon as one session row exists (a token was generated)", () => {
    const sessions: SessionInput[] = [{ status: "pending", expires_at: future }];
    expect(hasCheckinLink(sessions)).toBe(true);
  });
});

describe("hasReceivedFirstCheckin", () => {
  it("is false for a session still waiting", () => {
    expect(hasReceivedFirstCheckin([{ status: "pending", expires_at: future }], NOW)).toBe(false);
  });

  it("is false for an expired session even if it was started", () => {
    expect(hasReceivedFirstCheckin([{ status: "pending", expires_at: past }], NOW)).toBe(false);
    expect(hasReceivedFirstCheckin([{ status: "in_progress", expires_at: past }], NOW)).toBe(false);
  });

  it("is true for submitted and for verified sessions", () => {
    expect(hasReceivedFirstCheckin([{ status: "submitted", expires_at: future }], NOW)).toBe(true);
    expect(hasReceivedFirstCheckin([{ status: "verified", expires_at: future }], NOW)).toBe(true);
  });

  it("tolerates unknown statuses from the database", () => {
    expect(hasReceivedFirstCheckin([{ status: "banana", expires_at: future }], NOW)).toBe(false);
  });
});

describe("buildSetupChecklist", () => {
  it("returns four ordered steps, all to do, for a brand new hotel", () => {
    const checklist = buildSetupChecklist(
      { profile: null, upsellItems: null, sessions: null },
      NOW,
    );
    expect(checklist.total).toBe(4);
    expect(checklist.completed).toBe(0);
    expect(checklist.allDone).toBe(false);
    expect(checklist.items.map((item) => item.id)).toEqual<SetupStepId[]>([
      "hotelProfile",
      "upsellItems",
      "checkinLink",
      "firstCheckin",
    ]);
    expect(checklist.items.every((item) => !item.done)).toBe(true);
  });

  it("points each actionable step at an existing dashboard page", () => {
    const checklist = buildSetupChecklist(
      { profile: null, upsellItems: null, sessions: null },
      NOW,
    );
    const hrefs = Object.fromEntries(checklist.items.map((item) => [item.id, item.href]));
    expect(hrefs).toEqual({
      hotelProfile: null,
      upsellItems: "/dashboard/fatturazione",
      checkinLink: "/dashboard/sessioni/nuova",
      firstCheckin: null,
    });
  });

  it("counts a partially configured hotel correctly", () => {
    const checklist = buildSetupChecklist(
      {
        profile: completeProfile,
        upsellItems: [{ active: false }],
        sessions: [{ status: "pending", expires_at: future }],
      },
      NOW,
    );
    const done = checklist.items.filter((item) => item.done).map((item) => item.id);
    expect(done).toEqual(["hotelProfile", "checkinLink"]);
    expect(checklist.completed).toBe(2);
    expect(checklist.allDone).toBe(false);
  });

  it("reports allDone once every step is satisfied", () => {
    const checklist = buildSetupChecklist(
      {
        profile: completeProfile,
        upsellItems: [{ active: true }],
        sessions: [{ status: "verified", expires_at: future }],
      },
      NOW,
    );
    expect(checklist.completed).toBe(4);
    expect(checklist.allDone).toBe(true);
    expect(checklist.items.every((item) => item.done)).toBe(true);
  });
});

describe("setup step metadata", () => {
  it("has exactly one href entry per ordered step id (no drift)", () => {
    expect([...SETUP_STEP_IDS].sort()).toEqual(Object.keys(SETUP_STEP_HREFS).sort());
    expect(new Set(SETUP_STEP_IDS).size).toBe(SETUP_STEP_IDS.length);
  });

  it("links the two steps a hotelier can act on, and only those", () => {
    const linked = SETUP_STEP_IDS.filter((id) => SETUP_STEP_HREFS[id] !== null);
    expect(linked).toEqual(["upsellItems", "checkinLink"]);
  });
});

describe("onboarding i18n coverage", () => {
  type JsonObject = Record<string, unknown>;
  const stepIds: SetupStepId[] = [
    "hotelProfile",
    "upsellItems",
    "checkinLink",
    "firstCheckin",
  ];

  function pick(messages: JsonObject, path: string[]): JsonObject {
    return path.reduce<JsonObject>(
      (node, key) => (node[key] ?? {}) as JsonObject,
      messages,
    );
  }

  function onboarding(messages: JsonObject): JsonObject {
    return pick(messages, ["dashboard", "onboarding"]);
  }

  it.each(["it", "en"] as const)("defines every checklist step in %s", (locale) => {
    const messages = (locale === "it" ? itMessages : enMessages) as JsonObject;
    const copy = onboarding(messages);
    for (const id of stepIds) {
      const step = pick(copy, ["items", id]);
      expect(typeof step.title).toBe("string");
      expect(String(step.title).length).toBeGreaterThan(0);
      expect(typeof step.description).toBe("string");
      expect(String(step.description).length).toBeGreaterThan(0);
    }
  });

  it.each(["it", "en"] as const)(
    "defines a hint for every step without a link in %s",
    (locale) => {
      // OnboardingChecklist renders `items.<id>.hint` for exactly the steps
      // whose href is null (nothing in the dashboard can complete them yet),
      // so a missing hint would throw at render time.
      const messages = (locale === "it" ? itMessages : enMessages) as JsonObject;
      const copy = onboarding(messages);
      const hrefless = SETUP_STEP_IDS.filter((id) => SETUP_STEP_HREFS[id] === null);
      expect(hrefless.length).toBeGreaterThan(0);
      for (const id of hrefless) {
        const step = pick(copy, ["items", id]);
        expect(typeof step.hint).toBe("string");
        expect(String(step.hint).length).toBeGreaterThan(0);
      }
    },
  );

  it.each(["it", "en"] as const)("defines the checklist chrome in %s", (locale) => {
    const messages = (locale === "it" ? itMessages : enMessages) as JsonObject;
    const copy = onboarding(messages);
    for (const key of ["title", "subtitle", "done", "todo", "action", "allDoneTitle", "allDoneBody"]) {
      expect(typeof copy[key]).toBe("string");
      expect(String(copy[key]).length).toBeGreaterThan(0);
    }
  });

  it("interpolates {done} and {total} in both locales", () => {
    for (const messages of [itMessages, enMessages] as JsonObject[]) {
      const progress = String(onboarding(messages).progress);
      expect(progress).toContain("{done}");
      expect(progress).toContain("{total}");
    }
  });

  it.each(["it", "en"] as const)("defines the empty states in %s", (locale) => {
    const messages = (locale === "it" ? itMessages : enMessages) as JsonObject;
    const sessions = pick(messages, ["dashboard", "sessions"]);
    expect(typeof sessions.emptyHowTitle).toBe("string");
    const steps = pick(sessions, ["emptySteps"]);
    for (const key of ["1", "2", "3"]) {
      const step = pick(steps, [key]);
      expect(typeof step.title).toBe("string");
      expect(typeof step.body).toBe("string");
    }
    const upsellEmpty = pick(messages, ["dashboard", "billing", "upsellEmpty"]);
    for (const key of ["title", "body", "cta"]) {
      expect(typeof upsellEmpty[key]).toBe("string");
    }
  });
});
