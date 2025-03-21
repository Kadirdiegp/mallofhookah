-- ACHTUNG: Dies ist ein direktes SQL-Script zum Erstellen der orders-Tabelle
-- Es sollte in der Supabase SQL-Konsole ausgeführt werden

-- Prüfen ob die Tabelle bereits existiert, falls ja, löschen
DROP TABLE IF EXISTS public.orders;

-- Erstellen der orders-Tabelle mit minimaler Struktur
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  items_json JSONB,
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  shipping_fee DECIMAL(10, 2),
  total DECIMAL(10, 2),
  payment_method TEXT,
  delivery_method TEXT,
  status TEXT DEFAULT 'pending',
  shipping_address_json JSONB,
  pickup_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktivieren und Richtlinien erstellen
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Benutzer können nur ihre eigenen Bestellungen sehen
CREATE POLICY "Users can view their own orders" 
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Benutzer können nur ihre eigenen Bestellungen einfügen
CREATE POLICY "Users can insert their own orders" 
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Kommentar: Dieses Schema verwendet separate Felder statt eines data-JSON-Felds
-- und sollte mit der "fullOrderData"-Struktur im Code kompatibel sein
