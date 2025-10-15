-- Fix user deletion issue by removing foreign key constraint to auth.users
-- This follows best practice: don't create foreign keys to auth.users (managed by Supabase)

-- Drop the foreign key constraint on contribuables.created_by
ALTER TABLE public.contribuables 
DROP CONSTRAINT IF EXISTS contribuables_created_by_fkey;

-- The created_by column remains as a UUID for tracking, but without the constraint
-- This allows users to be deleted from auth.users without constraint violations

-- Add comment explaining the column purpose
COMMENT ON COLUMN public.contribuables.created_by IS 'Tracks which user created this record. References auth.users.id but without foreign key constraint to allow user deletion.';