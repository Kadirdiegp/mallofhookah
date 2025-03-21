-- Erstellt die orders-Tabelle
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_data JSONB, -- Alle Bestelldaten als JSON
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  shipping_fee DECIMAL(10, 2),
  total DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aktiviere RLS und erstelle Policies
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

-- Beispielbestellung als Test
INSERT INTO public.orders (user_id, order_data, subtotal, tax, shipping_fee, total, status)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 
   '{"items": [{"id": 1, "name": "Test Item", "price": 10, "quantity": 1}]}',
   10.00, 
   1.90, 
   0.00, 
   11.90, 
   'completed');
