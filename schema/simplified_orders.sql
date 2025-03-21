-- Eine einfache Version der orders-Tabelle, die alle vorherigen Probleme behebt

-- Prüfen, ob die orders-Tabelle existiert
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
    ) THEN
        -- Tabelle existiert bereits, also löschen wir sie
        DROP TABLE IF EXISTS public.orders CASCADE;
    END IF;
END
$$;

-- Erstellen der vereinfachten orders-Tabelle
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    -- Bestellstatus und Zahlungsmethode
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    
    -- Preisdaten - alles NULLABLE, da wir verschiedene Schemata unterstützen
    subtotal DECIMAL(10, 2),
    tax DECIMAL(10, 2),
    shipping DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    
    -- Adressdaten - ebenfalls NULLABLE
    shipping_address_id UUID,
    billing_address_id UUID,
    
    -- JSON-Daten für den Fall, dass wir das JSON-Schema verwenden
    data JSONB
);

-- Index für schnellere Abfragen
CREATE INDEX orders_user_id_idx ON public.orders(user_id);

-- RLS aktivieren
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS-Policies
-- Einfacher Ansatz: Benutzer können ihre eigenen Bestellungen lesen und erstellen
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own orders" 
ON public.orders FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Zugriffsrechte
GRANT SELECT, INSERT ON public.orders TO authenticated;

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
