-- Einfaches Skript zur Korrektur der orders-Tabelle
-- Entfernt alle komplexen Abhängigkeiten und verwendet nur die grundlegende Struktur

-- Zeigt die aktuelle Spaltenstruktur
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders';

-- Einfache Änderungen an der Tabelle vornehmen
-- Nur die Spalten hinzufügen, die wir in unserem einfachen Bestellschema verwenden
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS total DECIMAL(10, 2);

-- RLS-Richtlinien sicherstellen
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS-Richtlinien nur hinzufügen, wenn sie nicht existieren
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can view their own orders'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can insert their own orders'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id)';
    END IF;
END
$$;
