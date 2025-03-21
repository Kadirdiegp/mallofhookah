-- Diese SQL-Datei korrigiert die Beziehung zwischen Adressen und Bestellungen

-- 1. Überprüfen der aktuellen Adressentabelle
DO $$
DECLARE
    address_table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'addresses'
    ) INTO address_table_exists;
    
    IF NOT address_table_exists THEN
        -- Tabelle erstellen, wenn sie nicht existiert
        CREATE TABLE public.addresses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id),
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            street_address TEXT NOT NULL,
            apartment TEXT,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            postal_code TEXT NOT NULL,
            country TEXT NOT NULL,
            phone TEXT NOT NULL,
            is_default_shipping BOOLEAN DEFAULT false,
            is_default_billing BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
        
        -- RLS aktivieren
        ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
        
        -- RLS-Policies
        CREATE POLICY "Users can view their own addresses" 
        ON public.addresses FOR SELECT 
        USING (user_id = auth.uid());
        
        CREATE POLICY "Users can insert their own addresses" 
        ON public.addresses FOR INSERT 
        WITH CHECK (user_id = auth.uid());
        
        CREATE POLICY "Users can update their own addresses" 
        ON public.addresses FOR UPDATE 
        USING (user_id = auth.uid());
        
        -- Zugriffsrechte
        GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
        
        -- Index für schnellere Abfragen
        CREATE INDEX addresses_user_id_idx ON public.addresses(user_id);
        
        RAISE NOTICE 'Addresses table created successfully';
    ELSE
        -- Falls die Tabelle existiert, aber mit falscher Struktur, korrigieren
        -- Wenn street_address nicht existiert, aber street ja, dann umbenennen
        BEGIN
            ALTER TABLE public.addresses 
            RENAME COLUMN street TO street_address;
            RAISE NOTICE 'Renamed street to street_address';
        EXCEPTION
            WHEN undefined_column THEN
                RAISE NOTICE 'Column street does not exist';
        END;
        
        -- Sicherstellen, dass alle notwendigen Spalten existieren
        BEGIN
            ALTER TABLE public.addresses 
            ADD COLUMN IF NOT EXISTS street_address TEXT;
            
            -- Default-Wert setzen für existierende Zeilen
            UPDATE public.addresses 
            SET street_address = 'Needs update' 
            WHERE street_address IS NULL;
            
            -- NOT NULL Constraint hinzufügen
            ALTER TABLE public.addresses 
            ALTER COLUMN street_address SET NOT NULL;
            
            RAISE NOTICE 'Added street_address column';
        EXCEPTION
            WHEN duplicate_column THEN
                RAISE NOTICE 'Column street_address already exists';
        END;
        
        -- Weitere Spalten hinzufügen, die fehlen könnten
        ALTER TABLE public.addresses 
        ADD COLUMN IF NOT EXISTS first_name TEXT,
        ADD COLUMN IF NOT EXISTS last_name TEXT,
        ADD COLUMN IF NOT EXISTS apartment TEXT,
        ADD COLUMN IF NOT EXISTS city TEXT,
        ADD COLUMN IF NOT EXISTS state TEXT,
        ADD COLUMN IF NOT EXISTS postal_code TEXT,
        ADD COLUMN IF NOT EXISTS country TEXT,
        ADD COLUMN IF NOT EXISTS phone TEXT,
        ADD COLUMN IF NOT EXISTS is_default_shipping BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_default_billing BOOLEAN DEFAULT false;
        
        -- NOT NULL Constraints für wichtige Felder setzen
        -- Default-Werte setzen für existierende Zeilen
        UPDATE public.addresses 
        SET 
            first_name = COALESCE(first_name, 'Unknown'),
            last_name = COALESCE(last_name, 'Unknown'),
            city = COALESCE(city, 'Unknown'),
            state = COALESCE(state, 'Unknown'),
            postal_code = COALESCE(postal_code, '00000'),
            country = COALESCE(country, 'DE'),
            phone = COALESCE(phone, '0000000000');
            
        -- NOT NULL Constraints hinzufügen
        ALTER TABLE public.addresses 
        ALTER COLUMN first_name SET NOT NULL,
        ALTER COLUMN last_name SET NOT NULL,
        ALTER COLUMN city SET NOT NULL,
        ALTER COLUMN state SET NOT NULL,
        ALTER COLUMN postal_code SET NOT NULL,
        ALTER COLUMN country SET NOT NULL,
        ALTER COLUMN phone SET NOT NULL;
            
        RAISE NOTICE 'Updated columns in addresses table';
    END IF;
END
$$;
