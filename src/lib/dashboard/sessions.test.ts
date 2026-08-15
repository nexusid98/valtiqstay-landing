import { describe, expect, it } from "vitest";
import {
  SESSION_STATUSES,
  addDaysISO,
  buildCheckinUrl,
  effectiveStatus,
  isValidIsoDate,
  mapCreateSessionError,
  statusBadgeClasses,
  todayISO,
  toISODate,
} from "./sessions";

describe("effectiveStatus", () => {
  const now = new Date("2026-08-15T12:00:00Z");

  it("keeps a pending session with a future expiry as pending", () => {
    expect(effectiveStatus("pending", "2026-08-16T12:00:00Z", now)).toBe("pending");
  });

  it("displays a pending session past its expiry as expired", () => {
    expect(effectiveStatus("pending", "2026-08-14T12:00:00Z", now)).toBe("expired");
  });

  it("does not expire non-pending statuses", () => {
    expect(effectiveStatus("in_progress", "2026-08-01T12:00:00Z", now)).toBe("in_progress");
    expect(effectiveStatus("submitted", "2026-08-01T12:00:00Z", now)).toBe("submitted");
    expect(effectiveStatus("verified", "2026-08-01T12:00:00Z", now)).toBe("verified");
  });

  it("passes through unknown raw statuses as pending", () => {
    expect(effectiveStatus("weird", null, now)).toBe("pending");
  });

  it("treats a missing expiry as still pending", () => {
    expect(effectiveStatus("pending", null, now)).toBe("pending");
  });
});

describe("statusBadgeClasses", () => {
  it("returns a class string for every known status", () => {
    for (const status of SESSION_STATUSES) {
      const classes = statusBadgeClasses(status);
      expect(classes).toBeTruthy();
      expect(classes.length).toBeGreaterThan(0);
    }
  });

  it("uses token colors only (gold / champagne / navy)", () => {
    for (const status of SESSION_STATUSES) {
      const classes = statusBadgeClasses(status);
      expect(classes).toMatch(/\b(?:text|border|bg)-(?:gold|champagne|navy)/);
      expect(classes).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    }
  });

  it("differentiates the five statuses", () => {
    const sets = new Set(SESSION_STATUSES.map((s) => statusBadgeClasses(s)));
    expect(sets.size).toBe(SESSION_STATUSES.length);
  });
});

describe("buildCheckinUrl", () => {
  it("joins origin and path", () => {
    expect(buildCheckinUrl("https://app.example.com", "/it/c/token-1")).toBe(
      "https://app.example.com/it/c/token-1",
    );
  });

  it("tolerates a trailing slash on the origin", () => {
    expect(buildCheckinUrl("https://app.example.com/", "/it/c/token-1")).toBe(
      "https://app.example.com/it/c/token-1",
    );
  });

  it("tolerates a missing leading slash on the path", () => {
    expect(buildCheckinUrl("https://app.example.com", "it/c/token-1")).toBe(
      "https://app.example.com/it/c/token-1",
    );
  });
});

describe("mapCreateSessionError", () => {
  it("maps the four RPC error codes", () => {
    expect(mapCreateSessionError("staff_only")).toBe("staffOnly");
    expect(mapCreateSessionError("invalid_data")).toBe("invalidData");
    expect(mapCreateSessionError("duplicate_booking")).toBe("duplicateBooking");
    expect(mapCreateSessionError("token_collision")).toBe("tokenCollision");
  });

  it("falls back to generic for unknown or missing codes", () => {
    expect(mapCreateSessionError("something_else")).toBe("generic");
    expect(mapCreateSessionError(undefined)).toBe("generic");
  });
});

describe("date helpers", () => {
  it("toISODate formats with zero padding", () => {
    expect(toISODate(new Date(2026, 7, 5))).toBe("2026-08-05");
  });

  it("todayISO matches the yyyy-mm-dd shape", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("addDaysISO handles month and year boundaries", () => {
    expect(addDaysISO("2026-08-14", 0)).toBe("2026-08-14");
    expect(addDaysISO("2026-08-14", 1)).toBe("2026-08-15");
    expect(addDaysISO("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDaysISO("2025-12-31", 1)).toBe("2026-01-01");
  });

  it("isValidIsoDate accepts real dates and rejects garbage", () => {
    expect(isValidIsoDate("2026-08-14")).toBe(true);
    expect(isValidIsoDate("2026-02-29")).toBe(false);
    expect(isValidIsoDate("2026-13-01")).toBe(false);
    expect(isValidIsoDate("2026-08")).toBe(false);
    expect(isValidIsoDate("not-a-date")).toBe(false);
  });
});
