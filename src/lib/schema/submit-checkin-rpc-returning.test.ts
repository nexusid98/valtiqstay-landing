import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

/**
 * Static regression guard for migration 06
 * (supabase/migrations/20250821000001_fix_submit_rpc_returning.sql).
 *
 * Background: migration 02's INSERT branch of `submit_checkin_session` ended
 * with `RETURNING g.id INTO v_guest_id;`, but the alias `g` only exists on the
 * UPDATE branch / EXISTS subquery, not on the INSERT statement. PostgreSQL
 * therefore threw "missing FROM-clause entry for table 'g'" on EVERY new-guest
 * submission; the RPC's WHEN OTHERS swallowed it into
 * {"error":"invalid_data"}. Migration 06 re-creates the function with the bare
 * column (`RETURNING id INTO v_guest_id;`) and must stay that way.
 *
 * These tests are intentionally static/parsed checks over the migration file
 * so a regression to the `g.id` form is caught without needing a live database.
 */

const MIGRATION_06 =
  "supabase/migrations/20250821000001_fix_submit_rpc_returning.sql";

function migrationPath(): string {
  const fromCwd = path.resolve(process.cwd(), MIGRATION_06);
  if (existsSync(fromCwd)) return fromCwd;
  // Fallback: resolve relative to this file (tests may run from a subdir).
  const fromHere = path.resolve(__dirname, "../../../", MIGRATION_06);
  return fromHere;
}

function readMigration(): string {
  const target = migrationPath();
  expect(existsSync(target), `migration file missing: ${target}`).toBe(true);
  return readFileSync(target, "utf8");
}

describe("migration 06 — submit_checkin_session RETURNING fix", () => {
  it("defines submit_checkin_session with SECURITY DEFINER and pinned search_path", () => {
    const sql = readMigration();
    expect(sql).toContain(
      "CREATE OR REPLACE FUNCTION public.submit_checkin_session(",
    );
    expect(sql).toContain("SECURITY DEFINER");
    // search_path must be pinned to '' (schema-qualified RPC discipline).
    expect(sql).toContain("SET search_path = ''");
  });

  it("the new-guest INSERT branch returns the bare column id, not the g alias", () => {
    const sql = readMigration();
    // The RETURNING must appear immediately after an INSERT INTO public.guests
    // block (i.e. in the INSERT branch, where only the bare column is valid).
    const insertBlock = sql.slice(
      sql.indexOf("INSERT INTO public.guests"),
      sql.indexOf("END IF;", sql.indexOf("INSERT INTO public.guests")),
    );
    expect(insertBlock).toContain("RETURNING id INTO v_guest_id;");
    // And it must NOT reference the alias `g` anywhere in that block.
    expect(insertBlock).not.toMatch(/RETURNING\s+g\.id\b/);
  });

  it("the buggy RETURNING g.id pattern is gone from the executable function body", () => {
    const sql = readMigration();
    // The header comment intentionally documents the old bug (it literally
    // contains `RETURNING g.id`), so scope the guard to the executable SQL —
    // everything from the CREATE OR REPLACE FUNCTION statement onward.
    const executable = sql.slice(sql.indexOf("CREATE OR REPLACE FUNCTION"));
    expect(executable).not.toMatch(/RETURNING\s+g\.id\b/);
    // And the corrected bare-column RETURNING is present in that executable SQL.
    expect(executable).toContain("RETURNING id INTO v_guest_id;");
  });

  it("re-creates the function with the exact original signature", () => {
    const sql = readMigration();
    expect(sql).toMatch(
      /submit_checkin_session\(\s*\n\s*p_token\s+TEXT,\s*\n\s*p_guests\s+JSONB,\s*\n\s*p_documents\s+JSONB,\s*\n\s*p_upsells\s+JSONB,\s*\n\s*p_consent\s+JSONB\s*\n\s*\)/,
    );
    // Same return type as the original RPC.
    expect(sql).toMatch(/RETURNS JSONB/);
  });

  it("remains callable by anon (PUBLIC EXECUTE preserved, no anon REVOKE)", () => {
    // This guest RPC is invoked by the anonymous guest flow with the anon key
    // (src/lib/checkin/api.ts submitCheckin -> createBrowserClient + ANON key).
    // Unlike the staff-only RPC in migration 04, migration 06 must NOT REVOKE
    // EXECUTE from anon or the guest check-in would break.
    const sql = readMigration();
    expect(sql).not.toMatch(/REVOKE\s+EXECUTE.*\bfrom\s+anon\b/i);
  });
});
