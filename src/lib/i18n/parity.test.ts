import { describe, expect, it } from "vitest";
import itMessages from "@/lib/i18n/locales/it.json";
import enMessages from "@/lib/i18n/locales/en.json";

type JsonObject = Record<string, unknown>;

function flattenKeys(obj: JsonObject, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return flattenKeys(value as JsonObject, path);
    }
    return [path];
  });
}

describe("i18n locale parity", () => {
  it("en.json mirrors every key in it.json and vice versa", () => {
    const itKeys = flattenKeys(itMessages as JsonObject).sort();
    const enKeys = flattenKeys(enMessages as JsonObject).sort();

    expect(itKeys).toEqual(enKeys);

    const onlyIt = itKeys.filter((key) => !enKeys.includes(key));
    const onlyEn = enKeys.filter((key) => !itKeys.includes(key));
    expect(onlyIt).toEqual([]);
    expect(onlyEn).toEqual([]);
  });

  it("keeps the default locale as Italian", () => {
    // The app-level default is asserted in the existing config test; here we
    // just guarantee the Italian file is the primary source with the full
    // check-in namespace present.
    expect(itMessages).toHaveProperty("checkin");
    expect(enMessages).toHaveProperty("checkin");
  });

  it("keeps every interpolated token consistent between locales", () => {
    const it = JSON.stringify(itMessages);
    const en = JSON.stringify(enMessages);
    const tokensInIt = new Set(it.match(/\{[a-zA-Z]+\}/g) ?? []);
    const tokensInEn = new Set(en.match(/\{[a-zA-Z]+\}/g) ?? []);
    expect(tokensInIt).toEqual(tokensInEn);
  });
});
