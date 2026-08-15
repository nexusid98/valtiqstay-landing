/**
 * Demo staff seed — creates the Hotel Bella Vista hotel_admin.
 *
 *   Run:        bun scripts/seed-staff.ts
 *   Env:        NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *               (bun auto-loads .env from the repo root; alternatively
 *                bun --env-file=.env scripts/seed-staff.ts)
 *   Optional:   STAFF_DEMO_PASSWORD — override the default demo password.
 *
 * Idempotent: if the auth user already exists it is reused (only the profile
 * is upserted back to the canonical values); the password is set exclusively
 * on first creation.
 *
 * NOTE: this script talks to whatever project the env vars point at. The M4
 * delegation deliberately does NOT run it — the lead runs it at E2E time.
 */
import { createClient } from "@supabase/supabase-js";

const EMAIL = "staff@bellavista.demo";
const DEFAULT_PASSWORD = "ai3SDNlmVt7fle0RRtJw";
const HOTEL_ID = "b1000000-0000-0000-0000-000000000001";
const FULL_NAME = "Admin Bella Vista";
const ROLE = "hotel_admin";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(
      `Missing ${name} — add it to .env (see .env.example). ` +
        `bun auto-loads .env, or pass it explicitly with --env-file=.env.`,
    );
    process.exit(1);
  }
  return value;
}

async function main() {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const password = process.env.STAFF_DEMO_PASSWORD ?? DEFAULT_PASSWORD;

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Find or create the auth user.
  const { data: page, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw new Error(`listUsers failed: ${listError.message}`);

  const existing = page?.users.find((u) => u.email === EMAIL) ?? null;

  let userId: string;
  if (existing) {
    userId = existing.id;
    console.log(`✓ auth user already exists (${EMAIL}) — reusing ${userId}`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: EMAIL,
      password,
      email_confirm: true,
      user_metadata: { full_name: FULL_NAME },
    });
    if (error) throw new Error(`createUser failed: ${error.message}`);
    userId = data.user.id;
    console.log(`✓ auth user created (${EMAIL})`);
  }

  // 2. Upsert the profile row (service role bypasses RLS).
  const { error: profileError } = await admin.from("profiles").upsert(
    { id: userId, hotel_id: HOTEL_ID, role: ROLE, full_name: FULL_NAME },
    { onConflict: "id" },
  );
  if (profileError) throw new Error(`profiles upsert failed: ${profileError.message}`);
  console.log(`✓ profile upserted (hotel ${HOTEL_ID}, role ${ROLE})`);

  console.log("");
  console.log("Demo staff ready — use only in demo environments:");
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${password}`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
