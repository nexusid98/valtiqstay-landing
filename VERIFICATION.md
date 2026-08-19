# Verification — RLS infinite-recursion fix (42P17)

Migration: `supabase/migrations/20250816000001_fix_rls_recursion.sql`
Verified: 2026-08-19, local Postgres 16 (`postgres:16-alpine`) container, Supabase stubs
(auth/storage schemas, `anon`/`authenticated`/`service_role` roles, JWT-claim GUCs).

## 1. Double-run — idempotent AND non-destructive

Procedure (per `verify-supabase-migration-double-run` skill):

1. Fresh container: applied migrations 01 → 02 → 03 → 04 (full schema) — all OK.
2. Inserted sentinel row: `INSERT INTO hotels (slug, name) VALUES ('sentinel','Sentinel Hotel')`.
3. **Run 1** of migration 05 — exit 0, zero errors. Output ends with:
   ```
   NOTICE:  RLS recursion fix (migration 05) applied: public.current_hotel_id() and
   public.current_profile_role() are live — 14 policy expressions reference
   current_hotel_id, 2 reference current_profile_role. No policy subqueries profiles anymore.
   ```
4. **Run 2** of migration 05 — exit 0, zero errors, second run a clean no-op
   (CREATE OR REPLACE FUNCTION × 2, DROP POLICY IF EXISTS / CREATE POLICY × 14,
   REVOKE/GRANT, NOTICE block).
5. Sentinel intact after **both** runs:
   ```
   SELECT id, slug, name FROM hotels WHERE slug='sentinel';
   ── 938f2b4a-f8d6-4a9c-8f73-01c2e81fad7d | sentinel | Sentinel Hotel
   ```

## 2. Recursion proof — BEFORE the fix (42P17 reproduced locally)

Emulating PostgREST (`SET ROLE authenticated` + JWT claim `sub` pointing at a
seeded staff profile), every staff query died with exactly the error seen on
the remote:

```
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '11111111-…', false);
SELECT id, token FROM public.checkin_sessions;
→ ERROR:  infinite recursion detected in policy for relation "profiles"
SELECT id, hotel_id, role FROM public.profiles;
→ ERROR:  infinite recursion detected in policy for relation "profiles"
SELECT id, slug FROM public.hotels;
→ ERROR:  infinite recursion detected in policy for relation "profiles"
```

`42P17` was reproduced in-container before the fix (and matches the remote
live evidence: staff REST queries returned `{"code":"42P17", …}`).

## 3. Recursion — AFTER the fix (functional proof)

Same role/claims as above, after migration 05 run 1:

| Query (as staff, JWT sub = seeded profile) | Result |
|---|---|
| `checkin_sessions` | **1 row** — only `bella-vista-arrivo-test` (other hotel's session hidden) |
| `profiles` | **1 row** — the caller's own profile (hotel_admin, Staff Demo) |
| `hotels` | **1 row** — `bella-vista` only (sentinel + other hotel hidden) |
| `guests` | 1 row (Giulia Rossi, ITA) |
| `upsell_items` | 1 row (late_checkout, 30.00) |
| `audit_logs` | 1 row (session_created) |
| `storage.objects` | **1 row** — only the `{bella-vista-uuid}/…` folder; other hotel's object hidden |
| `current_hotel_id()` / `current_profile_role()` | `aaaaaaaa-…` / `hotel_admin` |

Tenant isolation works exactly as migration 01's semantics intended.

## 4. pg_policies sweep — no policy references `profiles`

```
SELECT schemaname, tablename, policyname FROM pg_policies
WHERE qual LIKE '%profiles%' OR with_check LIKE '%profiles%';
→ 0 rows
```

All 16 policies post-fix (14 rewritten + 2 untouched, intentionally):

| Table | Policy | Command | Expression |
|---|---|---|---|
| hotels | hotels_staff_select | SELECT | `id = current_hotel_id()` |
| hotels | hotels_staff_update | UPDATE | `id = current_hotel_id()` (USING + WITH CHECK) |
| profiles | profiles_staff_select | SELECT | `hotel_id = current_hotel_id()` |
| profiles | profiles_admin_insert | INSERT | `hotel_id = current_hotel_id() AND current_profile_role() = 'hotel_admin'` |
| profiles | profiles_admin_update | UPDATE | same (USING + WITH CHECK) |
| profiles | profiles_self_delete | DELETE | `id = auth.uid()` — untouched, non-recursive |
| stays/guests/documents/checkin_sessions/upsell_items/upsell_requests/consents | `*_staff_all` | ALL | `hotel_id = current_hotel_id()` (USING + WITH CHECK) |
| audit_logs | audit_logs_staff_select | SELECT | `hotel_id = current_hotel_id()` |
| audit_logs | audit_logs_staff_insert | INSERT | `auth.uid() IS NOT NULL` — untouched, non-recursive |
| storage.objects | staff_access_documents | ALL | `bucket_id='documents' AND auth.role()='authenticated' AND (storage.foldername(name))[1] = current_hotel_id()::text` |

## 5. Guard rails

- Helpers are `SECURITY DEFINER`, `STABLE`, `proconfig = search_path=""` (empty — every
  identifier schema-qualified, mirroring migration 04's RPC style).
- EXECUTE: `anon = false`, `authenticated = true` — anon calling the helpers gets
  `permission denied for function`.
- Untouched and still working: staff RPC `create_checkin_session` (returns a new token
  end-to-end as authenticated) and anon guest RPC `get_hotel_upsells` (returns the
  hotel's items). Guest-flow RPCs run SECURITY DEFINER and were not modified — see
  `git diff` (this PR = 1 migration + VERIFICATION.md only).

## 6. Diff hygiene

`git diff main --stat`:
```
supabase/migrations/20250816000001_fix_rls_recursion.sql | 227 +++++
VERIFICATION.md                                            | 114 +++++
```
No application code, no other migrations touched.

## Transcripts

Full command transcripts from the verification run are in
`/tmp/mig05/evidence/` on the sandbox (01_prefix_proof, 02_run1, 03_postfix_proof,
04_run2, 05_policies, 06_guards). Reproduce with `docker run postgres:16-alpine`
+ the stub/fixture scripts described in the PR body.