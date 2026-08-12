-- ============================================================================
-- ValtiqStay — M3: unique upsell item key per hotel
-- ----------------------------------------------------------------------------
-- Adds a UNIQUE index on upsell_items(hotel_id, key) so that:
--   1. The seed script (supabase/seed.sql) is idempotent — its
--      ON CONFLICT (hotel_id, key) DO NOTHING can no longer duplicate an
--      item for the same hotel on re-run.
--   2. A hotel can never define the same upsell key twice at the data level.
--
-- Idempotent (IF NOT EXISTS) and non-destructive (index-only — no data is
-- touched, no tables are altered). Safe to re-run; verified by double-run
-- against a local Postgres 16 (see verify-supabase-migration-double-run).
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS upsell_items_hotel_key_unique
  ON upsell_items (hotel_id, key);
