import { describe, it, expect } from "vitest";
import { locales, defaultLocale } from "@/lib/i18n/config";

describe("i18n config", () => {
  it("should have 'it' as the default locale", () => {
    expect(defaultLocale).toBe("it");
  });

  it("should include 'it' and 'en' in supported locales", () => {
    expect(locales).toContain("it");
    expect(locales).toContain("en");
  });
});
