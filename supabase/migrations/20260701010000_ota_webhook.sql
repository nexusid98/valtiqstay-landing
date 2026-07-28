-- Integrazione OTA: api_key per hotel + campi prenotazione per webhook

-- API key per hotel (autenticazione webhook)
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS api_key text UNIQUE;
UPDATE hotels SET api_key = 'vltq_' || replace(gen_random_uuid()::text, '-', '') WHERE api_key IS NULL;

CREATE OR REPLACE FUNCTION generate_hotel_api_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.api_key IS NULL THEN
    NEW.api_key := 'vltq_' || replace(gen_random_uuid()::text, '-', '');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hotel_api_key_trigger ON hotels;
CREATE TRIGGER hotel_api_key_trigger
  BEFORE INSERT ON hotels
  FOR EACH ROW EXECUTE FUNCTION generate_hotel_api_key();

-- Campi aggiuntivi reservations per ingestion OTA
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS guest_email text,
  ADD COLUMN IF NOT EXISTS guest_phone text;

-- Indice unico per idempotenza webhook
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_hotel_external_id
  ON reservations (hotel_id, external_id)
  WHERE external_id IS NOT NULL;
