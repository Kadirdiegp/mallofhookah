-- Überprüfen der aktuellen Tabellenstruktur
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'addresses'
ORDER BY 
    ordinal_position;

-- Überprüfen von Fremdschlüsselbeziehungen
SELECT
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema 
    JOIN information_schema.constraint_column_usage AS ccu 
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND 
      (ccu.table_name = 'addresses' OR tc.table_name = 'addresses');

-- Überprüfen von RLS-Richtlinien
SELECT * FROM pg_policies WHERE tablename = 'addresses';

-- ALTER TABLE für sichere Änderungen
-- Dies fügt die benötigten Spalten hinzu, ohne die Tabelle neu zu erstellen
ALTER TABLE addresses 
  ADD COLUMN IF NOT EXISTS street_address TEXT;

-- Setze Standardwert für alle bestehenden Zeilen 
UPDATE addresses SET street_address = 'Unbekannte Straße' WHERE street_address IS NULL;

-- Dann setze NOT NULL constraint
ALTER TABLE addresses 
  ALTER COLUMN street_address SET NOT NULL;

-- Überprüfe, ob first_name und andere wichtige Spalten existieren
ALTER TABLE addresses 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Setze NULL-Constraint für first_name
UPDATE addresses SET first_name = 'Unbekannter Nutzer' WHERE first_name IS NULL;
ALTER TABLE addresses ALTER COLUMN first_name SET NOT NULL;

-- Stelle sicher, dass Row Level Security aktiviert ist
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Hinweis: Es sind bereits RLS-Richtlinien vorhanden, wir müssen keine neuen erstellen
-- Ausgabe der vorhandenen Richtlinien:
/*
| schemaname | tablename | policyname                         | permissive | roles    | cmd    | qual                   | with_check             |
| ---------- | --------- | ---------------------------------- | ---------- | -------- | ------ | ---------------------- | ---------------------- |
| public     | addresses | Users can view their own addresses | PERMISSIVE | {public} | SELECT | (auth.uid() = user_id) | null                   |
| public     | addresses | addresses_select_policy            | PERMISSIVE | {public} | SELECT | (auth.uid() = user_id) | null                   |
| public     | addresses | addresses_insert_policy            | PERMISSIVE | {public} | INSERT | null                   | (auth.uid() = user_id) |
| public     | addresses | addresses_update_policy            | PERMISSIVE | {public} | UPDATE | (auth.uid() = user_id) | null                   |
| public     | addresses | addresses_delete_policy            | PERMISSIVE | {public} | DELETE | (auth.uid() = user_id) | null                   |
*/

-- Überprüfe das Ergebnis der Änderungen
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'addresses'
ORDER BY 
    ordinal_position;
