-- Minimale orders-Tabelle mit JSON-Daten
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data JSONB,  -- Hier werden alle Bestelldaten als JSON gespeichert
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS aktivieren und Richtlinien erstellen
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Benutzer können nur ihre eigenen Bestellungen sehen
CREATE POLICY IF NOT EXISTS "Users can view their own orders" 
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Benutzer können nur ihre eigenen Bestellungen einfügen
CREATE POLICY IF NOT EXISTS "Users can insert their own orders" 
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
