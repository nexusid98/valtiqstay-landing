-- Aggiunge i campi mancanti alla tabella guests per alloggiati web e scheda PS
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS birth_country text,
  ADD COLUMN IF NOT EXISTS residence_place text,
  ADD COLUMN IF NOT EXISTS residence_country text,
  ADD COLUMN IF NOT EXISTS document_issue_place text,
  ADD COLUMN IF NOT EXISTS document_issue_date date,
  ADD COLUMN IF NOT EXISTS document_expiry_date date;
