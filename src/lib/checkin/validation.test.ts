import { describe, expect, it } from "vitest";
import { blankGuest } from "@/lib/checkin-store";
import {
  allGuestsValid,
  formatDate,
  formatPrice,
  isValidDate,
  validateGuest,
} from "@/lib/checkin/validation";

const REQUIRED = "Campo obbligatorio";

describe("isValidDate", () => {
  it("accepts real calendar dates in ISO format", () => {
    expect(isValidDate("1990-05-17")).toBe(true);
    expect(isValidDate("2024-02-29")).toBe(true); // leap year
  });

  it("rejects malformed and impossible dates", () => {
    expect(isValidDate("")).toBe(false);
    expect(isValidDate("17/05/1990")).toBe(false);
    expect(isValidDate("1990-13-01")).toBe(false);
    expect(isValidDate("2023-02-29")).toBe(false);
    expect(isValidDate("1990-05-32")).toBe(false);
    expect(isValidDate("not-a-date")).toBe(false);
  });
});

describe("validateGuest", () => {
  it("returns no errors for a fully filled guest", () => {
    const guest = blankGuest(true);
    guest.first_name = "Giulia";
    guest.last_name = "Rossi";
    guest.birth_date = "1990-05-17";
    guest.birth_place = "Roma";
    guest.nationality = "ITA";
    expect(validateGuest(guest, REQUIRED)).toEqual({});
  });

  it("flags every empty required field", () => {
    const errors = validateGuest(blankGuest(true), REQUIRED);
    expect(errors).toHaveProperty("first_name", REQUIRED);
    expect(errors).toHaveProperty("last_name", REQUIRED);
    expect(errors).toHaveProperty("birth_date", REQUIRED);
    expect(errors).toHaveProperty("birth_place", REQUIRED);
    expect(errors).toHaveProperty("nationality", REQUIRED);
  });

  it("flags an invalid birth date", () => {
    const guest = blankGuest(true);
    guest.first_name = "A";
    guest.last_name = "B";
    guest.birth_place = "Milano";
    guest.nationality = "ITA";
    guest.birth_date = "1990-13-99";
    const errors = validateGuest(guest, REQUIRED);
    expect(errors.birth_date).toBe(REQUIRED);
  });
});

describe("allGuestsValid", () => {
  it("requires every guest to be valid", () => {
    const complete = blankGuest(true);
    complete.first_name = "Giulia";
    complete.last_name = "Rossi";
    complete.birth_date = "1990-05-17";
    complete.birth_place = "Roma";
    complete.nationality = "ITA";

    const incomplete = blankGuest(false);
    incomplete.first_name = "Marco";

    expect(allGuestsValid([complete], REQUIRED)).toBe(true);
    expect(allGuestsValid([complete, incomplete], REQUIRED)).toBe(false);
  });
});

describe("formatDate", () => {
  it("formats an ISO date for the given locale", () => {
    expect(formatDate("1990-05-17", "it")).toBe("17 maggio 1990");
    expect(formatDate("1990-05-17", "en")).toBe("17 May 1990");
  });

  it("returns the input untouched when invalid", () => {
    expect(formatDate("bogus", "it")).toBe("bogus");
  });
});

describe("formatPrice", () => {
  it("formats EUR prices for the given locale", () => {
    expect(formatPrice(30, "it-IT")).toContain("30");
    expect(formatPrice("15.5", "it-IT")).toContain("15");
    expect(formatPrice(0, "en-GB")).toContain("0");
  });

  it("handles null/NaN gracefully", () => {
    expect(formatPrice(null, "it-IT")).toBe("");
    expect(formatPrice("", "it-IT")).toBe("");
    expect(formatPrice("abc", "it-IT")).toBe("");
  });
});
