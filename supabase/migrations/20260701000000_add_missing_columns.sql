-- ValtiqStay MVP — Colonne mancanti (fase 2–5)

-- ── guests: campi identità estesi ────────────────────────────────────────────
alter table guests
  add column if not exists birth_country        text,
  add column if not exists residence_place      text,
  add column if not exists residence_country    text,
  add column if not exists document_issue_place text,
  add column if not exists document_issue_date  date,
  add column if not exists document_expiry_date date;

-- ── reservations: OTA webhook + soft-delete ───────────────────────────────────
alter table reservations
  add column if not exists guest_email  text,
  add column if not exists guest_phone  text,
  add column if not exists external_id  text;

-- Indice per idempotenza OTA (external_id per hotel)
create unique index if not exists reservations_hotel_external_id_idx
  on reservations (hotel_id, external_id)
  where external_id is not null;

-- ── hotels: API key per webhook OTA ──────────────────────────────────────────
alter table hotels
  add column if not exists api_key text unique;
