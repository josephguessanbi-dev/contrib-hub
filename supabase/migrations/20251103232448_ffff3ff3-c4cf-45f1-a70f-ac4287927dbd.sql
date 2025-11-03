-- Add foreign key constraint between contribuables.created_by and profiles.user_id
-- This allows us to join contribuables with their creator's profile information

ALTER TABLE public.contribuables 
ADD CONSTRAINT contribuables_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES public.profiles(user_id) 
ON DELETE SET NULL;