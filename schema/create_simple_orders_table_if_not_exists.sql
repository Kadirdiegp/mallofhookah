-- Einfaches Skript zum Erstellen einer minimalen orders-Tabelle
-- Erstellt nur die notwendigen Spalten, die für die aktuelle Bestellfunktion erforderlich sind

-- Überprüfe, ob die orders-Tabelle bereits existiert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'orders'
    ) THEN
        -- Erstelle eine einfache orders-Tabelle ohne Fremdschlüsselbeziehungen
        CREATE TABLE public.orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id),
            status TEXT DEFAULT 'pending',
            subtotal DECIMAL(10, 2) NOT NULL,
            payment_method TEXT,
            shipping_address_id UUID,
            billing_address_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );

        -- Aktiviere Row Level Security
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

        -- Erstelle Richtlinien für RLS
        CREATE POLICY "Users can view their own orders" ON public.orders
            FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own orders" ON public.orders
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        -- Erstelle einen Index für bessere Abfrageleistung
        CREATE INDEX orders_user_id_idx ON public.orders(user_id);
    END IF;
END
$$;
