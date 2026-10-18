import { describe, expect, it } from "vitest";
import { switchLocalePath } from "./switch-locale-path";

describe("switchLocalePath", () => {
  it("swaps the locale prefix and keeps the rest of the path", () => {
    expect(switchLocalePath("/it", "en")).toBe("/en");
    expect(switchLocalePath("/it/dashboard", "en")).toBe("/en/dashboard");
    expect(switchLocalePath("/en/dashboard/fatturazione", "it")).toBe(
      "/it/dashboard/fatturazione",
    );
  });

  it("preserves dynamic segments (guest token + dashboard session detail)", () => {
    expect(switchLocalePath("/it/c/abc-123", "en")).toBe("/en/c/abc-123");
    expect(switchLocalePath("/en/dashboard/sessioni/tok_9", "it")).toBe(
      "/it/dashboard/sessioni/tok_9",
    );
    expect(switchLocalePath("/it/dashboard/sessioni/nuova", "en")).toBe(
      "/en/dashboard/sessioni/nuova",
    );
  });

  it("adds a prefix when the path has none", () => {
    expect(switchLocalePath("/", "en")).toBe("/en");
    expect(switchLocalePath("/login", "en")).toBe("/en/login");
    expect(switchLocalePath("c/abc-123", "en")).toBe("/en/c/abc-123");
    expect(switchLocalePath("", "it")).toBe("/it");
  });

  it("keeps the current locale when the target equals it", () => {
    expect(switchLocalePath("/it/c/abc-123", "it")).toBe("/it/c/abc-123");
  });

  it("keeps the query string and hash", () => {
    expect(switchLocalePath("/it/dashboard?created=1", "en")).toBe(
      "/en/dashboard?created=1",
    );
    expect(switchLocalePath("/it/c/abc#top", "en")).toBe("/en/c/abc#top");
  });

  it("normalises duplicate or trailing slashes", () => {
    expect(switchLocalePath("//it//c//abc/", "en")).toBe("/en/c/abc");
  });

  it("supports an explicit locale list", () => {
    expect(switchLocalePath("/de/admin", "en", ["en", "it"])).toBe(
      "/en/de/admin",
    );
    expect(switchLocalePath("/de/admin", "en", ["en", "it", "de"])).toBe(
      "/en/admin",
    );
  });
});
