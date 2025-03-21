-- Skript zum Erstellen der order_items-Tabelle
-- Nur ausführen, wenn die Tabelle noch nicht existiert

-- Prüfen, ob die order_items-Tabelle existiert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'order_items'
    ) THEN
        -- Tabelle erstellen, wenn sie nicht existiert
        CREATE TABLE public.order_items (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
            product_id UUID NOT NULL REFERENCES public.products(id),
            quantity INTEGER NOT NULL CHECK (quantity > 0),
            price_per_unit DECIMAL(10, 2) NOT NULL CHECK (price_per_unit >= 0),
            total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );

        -- Row Level Security aktivieren
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

        -- RLS-Richtlinien erstellen
        CREATE POLICY "Users can view their own order items" ON public.order_items
            FOR SELECT USING (
                auth.uid() IN (
                    SELECT user_id FROM public.orders WHERE id = order_id
                )
            );

        CREATE POLICY "Users can insert their own order items" ON public.order_items
            FOR INSERT WITH CHECK (
                auth.uid() IN (
                    SELECT user_id FROM public.orders WHERE id = order_id
                )
            );

        -- Index für schnellere Abfragen erstellen
        CREATE INDEX order_items_order_id_idx ON public.order_items(order_id);
        CREATE INDEX order_items_product_id_idx ON public.order_items(product_id);
    END IF;
END
$$;
