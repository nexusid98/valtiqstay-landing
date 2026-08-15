import { describe, expect, it } from "vitest";
import { mapAuthError } from "./errors";

describe("mapAuthError", () => {
  it("maps wrong-credential codes to invalidCredentials", () => {
    expect(mapAuthError("invalid_credentials")).toBe("invalidCredentials");
    expect(mapAuthError("invalid_grant")).toBe("invalidCredentials");
  });

  it("maps unconfirmed emails to emailNotConfirmed", () => {
    expect(mapAuthError("email_not_confirmed")).toBe("emailNotConfirmed");
  });

  it("falls back to generic for unknown or missing codes", () => {
    expect(mapAuthError("user_banned")).toBe("generic");
    expect(mapAuthError("over_request_rate_limit")).toBe("generic");
    expect(mapAuthError(undefined)).toBe("generic");
  });
});
