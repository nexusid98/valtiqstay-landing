import { describe, expect, it } from "vitest";
import { buildLanguageAlternates, canonicalUrl, normalizePathSuffix } from "./alternates";

describe("normalizePathSuffix", () => {
  it("collapses root and bare paths to an empty suffix", () => {
    expect(normalizePathSuffix("/")).toBe("");
    expect(normalizePathSuffix("")).toBe("");
    expect(normalizePathSuffix("///")).toBe("");
  });

  it("keeps nested and dynamic segments", () => {
    expect(normalizePathSuffix("c/abc-123")).toBe("/c/abc-123");
    expect(normalizePathSuffix("/dashboard/sessioni/tok_9/")).toBe(
      "/dashboard/sessioni/tok_9",
    );
  });
});

describe("buildLanguageAlternates", () => {
  it("emits one absolute URL per locale plus x-default on the default locale", () => {
    expect(buildLanguageAlternates("/", "https://valtiqstay.example")).toEqual({
      it: "https://valtiqstay.example/it",
      en: "https://valtiqstay.example/en",
      "x-default": "https://valtiqstay.example/it",
    });
  });

  it("keeps the route path for deep links", () => {
    expect(buildLanguageAlternates("/c/abc-123", "https://h.example/")).toEqual({
      it: "https://h.example/it/c/abc-123",
      en: "https://h.example/en/c/abc-123",
      "x-default": "https://h.example/it/c/abc-123",
    });
  });
});

describe("canonicalUrl", () => {
  it("points at the current locale's route", () => {
    expect(canonicalUrl("/", "en", "https://h.example")).toBe("https://h.example/en");
    expect(canonicalUrl("/c/abc", "it", "http://localhost:3000")).toBe(
      "http://localhost:3000/it/c/abc",
    );
  });
});
