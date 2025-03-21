-- Erstelle die Tabelle und SQL-Funktion für die Orders-Tabelle

-- Funktion zum Erstellen der Tabelle
CREATE OR REPLACE FUNCTION create_orders_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Prüfen, ob die Tabelle bereits existiert
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    -- Erstelle die Tabelle
    CREATE TABLE public.orders (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      order_number TEXT,
      items_json JSONB,
      subtotal DECIMAL(10, 2) NOT NULL,
      tax DECIMAL(10, 2),
      shipping_fee DECIMAL(10, 2),
      total DECIMAL(10, 2) NOT NULL,
      payment_method TEXT,
      delivery_method TEXT,
      status TEXT DEFAULT 'pending',
      shipping_address_json JSONB,
      pickup_location TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Erstelle RLS-Richtlinien
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

    -- Policy für Einfügen (Benutzer kann nur eigene Bestellungen anlegen)
    CREATE POLICY insert_policy ON public.orders 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);

    -- Policy für Lesen (Benutzer kann nur eigene Bestellungen sehen)
    CREATE POLICY select_policy ON public.orders 
      FOR SELECT 
      USING (auth.uid() = user_id);

    -- Policy für Admins
    CREATE POLICY admin_policy ON public.orders 
      USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ));

    RAISE NOTICE 'orders table created successfully';
  ELSE
    RAISE NOTICE 'orders table already exists';
  END IF;
END;
$$;
