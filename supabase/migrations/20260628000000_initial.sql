-- ValtiqStay MVP — Schema iniziale
-- Fase 1: DDL + RLS + Storage

-- ── Tabelle ──────────────────────────────────────────────────────────────────

-- Mappa utente autenticato → hotel (lato staff)
create table hotel_users (
  user_id  uuid not null references auth.users(id) on delete cascade,
  hotel_id uuid not null,
  primary key (user_id, hotel_id)
);

create table hotels (
  id                            uuid primary key default gen_random_uuid(),
  name                          text not null,
  slug                          text unique not null,
  logo_url                      text,
  brand                         jsonb default '{}',
  welcome_info                  jsonb default '{}',
  checkin_time                  text default '15:00',
  checkout_time                 text default '11:00',
  tourist_tax_per_person_night  numeric default 0,
  tourist_tax_max_nights        int default 0,
  created_at                    timestamptz default now()
);

create table reservations (
  id               uuid primary key default gen_random_uuid(),
  hotel_id         uuid not null references hotels(id) on delete cascade,
  guest_name       text not null,
  arrival          date not null,
  departure        date not null,
  room_label       text,
  party_size       int default 1,
  source           text default 'direct',   -- 'direct' | 'ota' | 'other'
  status           text default 'pending',  -- 'pending' | 'checked_in'
  check_in_token   text unique not null,
  created_at       timestamptz default now()
);

create table guests (
  id                   uuid primary key default gen_random_uuid(),
  reservation_id       uuid not null references reservations(id) on delete cascade,
  is_lead              boolean default false,
  first_name           text not null,
  last_name            text not null,
  dob                  date,
  sex                  text,
  citizenship          text,
  birth_place          text,
  document_type        text,
  document_number      text,           -- accesso ristretto via RLS / service_role
  document_image_path  text,           -- path nel bucket privato, mai URL pubblico
  created_at           timestamptz default now()
);

create table contacts (
  id                  uuid primary key default gen_random_uuid(),
  reservation_id      uuid not null references reservations(id) on delete cascade,
  email               text,
  phone               text,
  marketing_consent   boolean default false,
  consent_timestamp   timestamptz,
  consent_ip          text,
  created_at          timestamptz default now()
);

create table upsells (
  id          uuid primary key default gen_random_uuid(),
  hotel_id    uuid not null references hotels(id) on delete cascade,
  category    text not null,
  name        text not null,
  description text,
  price       numeric not null,
  image_url   text,
  active      boolean default true
);

create table upsell_orders (
  id              uuid primary key default gen_random_uuid(),
  reservation_id  uuid not null references reservations(id) on delete cascade,
  upsell_id       uuid not null references upsells(id),
  quantity        int default 1,
  unit_price      numeric not null,
  status          text default 'requested',  -- 'requested' | 'fulfilled'
  created_at      timestamptz default now()
);

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table hotel_users    enable row level security;
alter table hotels         enable row level security;
alter table reservations   enable row level security;
alter table guests         enable row level security;
alter table contacts       enable row level security;
alter table upsells        enable row level security;
alter table upsell_orders  enable row level security;

-- helper: leggere i propri mapping hotel
create policy hotel_users_self on hotel_users for select
  using (user_id = auth.uid());

-- hotels: staff vede e modifica solo i propri hotel
create policy hotels_rw on hotels for all
  using      (id in (select hotel_id from hotel_users where user_id = auth.uid()))
  with check (id in (select hotel_id from hotel_users where user_id = auth.uid()));

-- reservations
create policy res_rw on reservations for all
  using      (hotel_id in (select hotel_id from hotel_users where user_id = auth.uid()))
  with check (hotel_id in (select hotel_id from hotel_users where user_id = auth.uid()));

-- guests: join tramite reservation → hotel
create policy guests_rw on guests for all
  using (reservation_id in (
    select r.id from reservations r
    where r.hotel_id in (select hotel_id from hotel_users where user_id = auth.uid())
  ));

-- contacts: stesso pattern
create policy contacts_rw on contacts for all
  using (reservation_id in (
    select r.id from reservations r
    where r.hotel_id in (select hotel_id from hotel_users where user_id = auth.uid())
  ));

-- upsells
create policy upsells_rw on upsells for all
  using      (hotel_id in (select hotel_id from hotel_users where user_id = auth.uid()))
  with check (hotel_id in (select hotel_id from hotel_users where user_id = auth.uid()));

-- upsell_orders
create policy upsell_orders_rw on upsell_orders for all
  using (reservation_id in (
    select r.id from reservations r
    where r.hotel_id in (select hotel_id from hotel_users where user_id = auth.uid())
  ));

-- ── Storage ──────────────────────────────────────────────────────────────────
-- Bucket privato: nessun accesso pubblico.
-- Upload/download passano sempre dal route server con service_role (bypassa RLS).
-- La policy qui protegge da accessi diretti non intenzionali.

insert into storage.buckets (id, name, public)
values ('guest-documents', 'guest-documents', false)
on conflict (id) do nothing;

-- Staff autenticato può leggere i documenti tramite signed URL (fallback policy)
create policy "staff_select_docs" on storage.objects for select
  using (
    bucket_id = 'guest-documents'
    and auth.role() = 'authenticated'
  );
