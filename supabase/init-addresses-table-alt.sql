-- Alternative addresses table with a single JSONB field for the address
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address JSONB, -- Single JSON field for all address data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own addresses
DROP POLICY IF EXISTS addresses_select_policy ON public.addresses;
CREATE POLICY addresses_select_policy ON public.addresses
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own addresses
DROP POLICY IF EXISTS addresses_insert_policy ON public.addresses;
CREATE POLICY addresses_insert_policy ON public.addresses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own addresses
DROP POLICY IF EXISTS addresses_update_policy ON public.addresses;
CREATE POLICY addresses_update_policy ON public.addresses
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own addresses
DROP POLICY IF EXISTS addresses_delete_policy ON public.addresses;
CREATE POLICY addresses_delete_policy ON public.addresses
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comment on table
COMMENT ON TABLE public.addresses IS 'Table to store user addresses in JSON format';

-- Create index on user_id for faster lookup
CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON public.addresses(user_id);

-- How to convert existing data from columnar format to JSONB:
/*
UPDATE public.addresses
SET address = jsonb_build_object(
    'street', street,
    'city', city,
    'state', state,
    'postalCode', postal_code,
    'country', country
)
WHERE street IS NOT NULL OR city IS NOT NULL OR state IS NOT NULL OR postal_code IS NOT NULL OR country IS NOT NULL;

-- After verifying the data migration, you can drop the old columns if needed:
ALTER TABLE public.addresses 
    DROP COLUMN IF EXISTS street,
    DROP COLUMN IF EXISTS city,
    DROP COLUMN IF EXISTS state,
    DROP COLUMN IF EXISTS postal_code,
    DROP COLUMN IF EXISTS country;
*/
