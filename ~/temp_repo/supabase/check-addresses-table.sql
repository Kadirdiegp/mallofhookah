-- Check if the addresses table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'addresses'
);

-- Get the column names of the addresses table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'addresses'
ORDER BY ordinal_position;

-- Get row level security policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'addresses';

-- Check if there are any existing addresses in the table
SELECT * FROM public.addresses LIMIT 10;

-- Create properly formatted address table if it doesn't exist correctly
-- (Comment out this section after checking the schema above)
/*
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
*/
