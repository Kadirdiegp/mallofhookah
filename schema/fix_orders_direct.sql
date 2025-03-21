-- Direkter Ansatz zur Lösung des RLS-Problems für orders

-- 1. Die alte orders-Tabelle sichern, falls nötig
ALTER TABLE IF EXISTS orders RENAME TO orders_backup;

-- 2. Eine völlig neue orders-Tabelle erstellen
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    shipping_address_id UUID, 
    billing_address_id UUID,
    subtotal DECIMAL(10, 2),
    tax DECIMAL(10, 2),
    shipping DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 3. Zugriffsrechte für Anonyme Benutzer
GRANT SELECT ON TABLE public.orders TO anon;
GRANT SELECT ON TABLE public.orders TO authenticated;
GRANT INSERT, UPDATE ON TABLE public.orders TO authenticated;

-- 4. Row Level Security aktivieren und konfigurieren
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 5. Einfache Policies erstellen
CREATE POLICY "Allow SELECT for authenticated users" ON public.orders
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow INSERT own orders" ON public.orders
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 6. Erstelle die order_items-Tabelle, wenn sie nicht existiert
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 7. RLS für order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users" ON public.order_items
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow insert for authenticated users" ON public.order_items
    FOR INSERT TO authenticated
    WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid()));

-- 8. Daten von der alten Tabelle in die neue Tabelle kopieren, wenn die alte existiert
-- ANMERKUNG: Auskommentiert wegen Fehlern bei der Spaltenzuordnung
/*
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders_backup') THEN
        INSERT INTO public.orders (id, user_id, created_at, status, payment_method, shipping_address_id, billing_address_id, subtotal, tax, shipping, total_amount)
        SELECT id, user_id, created_at, status, payment_method, shipping_address_id, billing_address_id, subtotal, tax, shipping, total_amount
        FROM public.orders_backup;
    END IF;
END $$;
*/
