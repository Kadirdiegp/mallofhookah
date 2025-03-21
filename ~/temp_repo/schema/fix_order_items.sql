-- Dieses Skript korrigiert die order_items Tabelle

-- Zuerst löschen wir die bestehende order_items-Tabelle, wenn sie existiert
DROP TABLE IF EXISTS public.order_items;

-- Jetzt erstellen wir die order_items-Tabelle neu mit korrekter Beziehung zu orders
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id)
        REFERENCES public.orders(id) ON DELETE CASCADE
);

-- Zugriffsrechte
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;

-- Row Level Security aktivieren
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies für Zugriff auf order_items
CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM public.orders 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own order items" ON public.order_items
    FOR INSERT WITH CHECK (
        order_id IN (
            SELECT id FROM public.orders 
            WHERE user_id = auth.uid()
        )
    );

-- Index für schnellere Abfragen
CREATE INDEX order_items_order_id_idx ON public.order_items(order_id);
