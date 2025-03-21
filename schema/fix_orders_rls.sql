-- Dieses Skript korrigiert die RLS-Policies für die Orders-Tabelle

-- Erst alle bestehenden Richtlinien entfernen
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.orders;

-- Korrigierte RLS-Richtlinien erstellen
CREATE POLICY "Enable read access for all users" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users only" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Stellen Sie sicher, dass RLS aktiviert ist
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Zeige die aktualisierten Richtlinien an
SELECT * FROM pg_policies WHERE tablename = 'orders';
