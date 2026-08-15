/**
 * Translation keys under dashboard.login.error — the inline messages the
 * login form can show. Keep in sync with src/lib/i18n/locales/{it,en}.json.
 */
export type LoginErrorKey = "invalidCredentials" | "emailNotConfirmed" | "generic";

/**
 * Maps a Supabase auth error (from signInWithPassword) onto a translation
 * key. Unknown or missing codes fall back to "generic".
 */
export function mapAuthError(code: string | undefined): LoginErrorKey {
  switch (code) {
    case "invalid_credentials":
    case "invalid_grant":
      return "invalidCredentials";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    default:
      return "generic";
  }
}
