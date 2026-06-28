-- ValtiqStay — Seed dati demo
-- Hotel Leon d'Oro (Rovereto) + upsell placeholder + prenotazioni di test

-- ── Hotel ────────────────────────────────────────────────────────────────────
insert into hotels (
  id, name, slug,
  checkin_time, checkout_time,
  tourist_tax_per_person_night, tourist_tax_max_nights,
  welcome_info
) values (
  'a1000000-0000-0000-0000-000000000001',
  'Hotel Leon d''Oro',
  'leon-doro',
  '15:00',
  '11:00',
  1.50,
  5,
  '{
    "inclusi": [
      "Piscina esterna con idromassaggio",
      "Dispenser acqua smart (ambiente · ghiacciata · frizzante)"
    ],
    "location": "5 min a piedi dalla stazione · 5 min dal centro storico · MART nelle vicinanze",
    "wifi": { "rete": "LeonDoro_Guest", "password": "PLACEHOLDER" },
    "concierge": { "telefono": "PLACEHOLDER", "orari": "07:00–23:00" }
  }'::jsonb
) on conflict (id) do nothing;

-- ── Upsell placeholder ───────────────────────────────────────────────────────
-- ATTENZIONE: offerte placeholder per la demo.
-- Le offerte reali si definiscono con la direzione dopo la demo.
insert into upsells (hotel_id, category, name, description, price, active)
values
  ('a1000000-0000-0000-0000-000000000001', 'soggiorno',   'Late check-out',       'Prolungamento fino alle 14:00, su disponibilità', 25,  true),
  ('a1000000-0000-0000-0000-000000000001', 'soggiorno',   'Early check-in',        'Accesso camera dalle 12:00, su disponibilità',   20,  true),
  ('a1000000-0000-0000-0000-000000000001', 'soggiorno',   'Upgrade camera',        'Camera superiore, se disponibile al check-in',   60,  true),
  ('a1000000-0000-0000-0000-000000000001', 'benvenuto',   'Aperitivo in terrazza', 'Welcome aperitivo al tramonto — terrazza panoramica', 18, true),
  ('a1000000-0000-0000-0000-000000000001', 'colazione',   'Colazione in camera',   'Servita in camera all''orario preferito',         15,  true),
  ('a1000000-0000-0000-0000-000000000001', 'esperienza',  'Ingresso MART',         'Museo di Arte Moderna e Contemporanea di Rovereto', 25, true)
on conflict do nothing;

-- ── Prenotazioni di test ─────────────────────────────────────────────────────
insert into reservations (
  id, hotel_id,
  guest_name, arrival, departure,
  room_label, party_size, source, status,
  check_in_token
) values
  (
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Marco Bianchi',
    '2026-07-15', '2026-07-18',
    'Camera 204 — Superior', 2, 'direct', 'pending',
    'vltq-demo-' || encode(gen_random_bytes(16), 'hex')
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    'Sofia Russo',
    '2026-07-16', '2026-07-19',
    'Camera 312 — Deluxe', 1, 'ota', 'pending',
    'vltq-demo-' || encode(gen_random_bytes(16), 'hex')
  )
on conflict (id) do nothing;

-- ── Utente staff ─────────────────────────────────────────────────────────────
-- Sostituire YOUR_STAFF_USER_UUID con l'UUID dell'utente creato su Supabase Auth.
-- insert into hotel_users (user_id, hotel_id)
-- values ('YOUR_STAFF_USER_UUID', 'a1000000-0000-0000-0000-000000000001')
-- on conflict do nothing;
