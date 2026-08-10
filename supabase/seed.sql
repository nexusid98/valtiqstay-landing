-- ValtiqStay — M1 Seed Data
-- Hotel Bella Vista + upsell items
-- Run AFTER the migration has been applied.

-- ============================================================================
-- HOTEL
-- ============================================================================
INSERT INTO hotels (
  id, name, slug,
  logo_url, hero_url,
  accent_navy, accent_gold, accent_champagne,
  locale, doc_retention_days
) VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'Hotel Bella Vista',
  'bella-vista',
  NULL,
  NULL,
  '#1B2A4A',
  '#C9A94E',
  '#E8DCC8',
  'it',
  30
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- UPSELL ITEMS for Hotel Bella Vista
-- ============================================================================
INSERT INTO upsell_items (hotel_id, key, label_it, label_en, description_it, description_en, price, active, display_order)
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    'late_checkout',
    'Late check-out',
    'Late Check-out',
    'Prolunga il tuo soggiorno fino alle 14:00, su disponibilità',
    'Extend your stay until 2:00 PM, subject to availability',
    30.00,
    true,
    1
  ),
  (
    'b1000000-0000-0000-0000-000000000001',
    'early_checkin',
    'Early check-in',
    'Early Check-in',
    'Accedi alla camera dalle 12:00, su disponibilità',
    'Access your room from 12:00 PM, subject to availability',
    20.00,
    true,
    2
  ),
  (
    'b1000000-0000-0000-0000-000000000001',
    'room_upgrade',
    'Upgrade camera',
    'Room Upgrade',
    'Passa a una camera di categoria superiore, se disponibile al check-in',
    'Upgrade to a superior room category, if available at check-in',
    50.00,
    true,
    3
  ),
  (
    'b1000000-0000-0000-0000-000000000001',
    'welcome_aperitivo',
    'Aperitivo di benvenuto',
    'Welcome Aperitivo',
    'Un aperitivo di benvenuto al tuo arrivo — selezione di vini e stuzzichini locali',
    'A welcome aperitivo upon arrival — selection of local wines and bites',
    15.00,
    true,
    4
  ),
  (
    'b1000000-0000-0000-0000-000000000001',
    'breakfast_room',
    'Colazione in camera',
    'Breakfast in Room',
    'Colazione servita in camera all''orario che preferisci',
    'Breakfast served in your room at your preferred time',
    12.00,
    true,
    5
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- DEMO CHECK-IN SESSION — Hotel Bella Vista
-- ----------------------------------------------------------------------------
-- Lets the team exercise the guest flow at /it/c/bella-vista-arrivo without
-- manually inserting rows. One stay + one lead guest (name known from the
-- reservation; ID details are filled in by the guest during check-in).
-- ============================================================================
INSERT INTO stays (
  id, hotel_id, arrival_date, departure_date, room_label, booking_ref, status
) VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  CURRENT_DATE + 1,
  CURRENT_DATE + 4,
  'Suite Panorama',
  'BV-2026-0417',
  'pending'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO checkin_sessions (
  id, stay_id, hotel_id, token, status, expires_at
) VALUES (
  'd1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  'bella-vista-arrivo',
  'pending',
  now() + interval '48 hours'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO guests (
  id, stay_id, hotel_id, is_lead, first_name, last_name, nationality
) VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  true,
  'Giulia',
  'Rossi',
  'ITA'
) ON CONFLICT (id) DO NOTHING;
