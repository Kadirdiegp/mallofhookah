-- ACHTUNG: Dies ist ein SQL-Script zur Änderung der orders-Tabelle
-- Es sollte in der Supabase SQL-Konsole ausgeführt werden

-- Tabellenbeschreibung für die Diagnose
SELECT
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM
  information_schema.columns c
WHERE
  c.table_schema = 'public'
  AND c.table_name = 'orders'
ORDER BY
  c.ordinal_position;

-- Abhängige Tabellen über Fremdschlüssel prüfen
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM
  information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE
  constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'orders' OR ccu.table_name = 'orders');

-- Füge die data-Spalte zur orders-Tabelle hinzu, wenn sie nicht existiert
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS data JSONB;

-- Füge weitere fehlende Spalten hinzu, falls nötig
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS items_json JSONB,
ADD COLUMN IF NOT EXISTS tax DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS delivery_method TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_json JSONB,
ADD COLUMN IF NOT EXISTS pickup_location TEXT;

-- Setze den Wert für total basierend auf subtotal + tax, wenn total NULL ist
UPDATE public.orders
SET total = subtotal + COALESCE(tax, 0) + COALESCE(shipping_fee, 0)
WHERE total IS NULL AND subtotal IS NOT NULL;

-- Stelle sicher, dass die Row Level Security aktiviert ist
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Erstelle Richtlinien, falls sie noch nicht existieren
DO $$
BEGIN
    -- Überprüfe, ob die Policy existiert
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can view their own orders'
    ) THEN
        -- Erstelle die Policy
        EXECUTE 'CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    -- Überprüfe, ob die zweite Policy existiert
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can insert their own orders'
    ) THEN
        -- Erstelle die Policy
        EXECUTE 'CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
END
$$;
