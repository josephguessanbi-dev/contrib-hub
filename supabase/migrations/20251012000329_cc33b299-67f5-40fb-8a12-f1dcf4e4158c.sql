-- ============================================
-- FIX 1: Restrict profile access (EXPOSED_SENSITIVE_DATA)
-- ============================================

-- Drop the overly permissive policy that allows all users in org to view all profiles
DROP POLICY IF EXISTS "Users can view profiles in their organisation" ON public.profiles;

-- Allow users to view only their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (user_id = auth.uid());

-- Allow admins to view all profiles in their organisation
CREATE POLICY "Admins can view all profiles in organisation"
ON public.profiles FOR SELECT
USING (
  organisation_id = get_user_organisation(auth.uid())
  AND get_user_role(auth.uid(), organisation_id) = 'admin'::app_role
);

-- ============================================
-- FIX 2: Add document management policies (MISSING_RLS_PROTECTION)
-- ============================================

-- Allow document creators or admins to delete documents
CREATE POLICY "Users can delete documents they created or admins can delete all"
ON public.documents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.contribuables c
    WHERE c.id = documents.contribuable_id
    AND c.organisation_id = get_user_organisation(auth.uid())
    AND (
      c.created_by = auth.uid()  -- Document creator (via contribuable)
      OR get_user_role(auth.uid(), c.organisation_id) = 'admin'::app_role  -- Or admin
    )
  )
);

-- Allow document creators or admins to update document metadata
CREATE POLICY "Users can update documents they created or admins can update all"
ON public.documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.contribuables c
    WHERE c.id = documents.contribuable_id
    AND c.organisation_id = get_user_organisation(auth.uid())
    AND (
      c.created_by = auth.uid()
      OR get_user_role(auth.uid(), c.organisation_id) = 'admin'::app_role
    )
  )
);

-- ============================================
-- FIX 3: Add email to profiles table for EmployeesList
-- ============================================

-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Create function to sync email from auth.users to profiles
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the profile with the new email
  UPDATE public.profiles
  SET email = NEW.email
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically sync email on user creation or email update
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_email();

-- Backfill existing emails from auth.users to profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
AND p.email IS NULL;

-- Update the existing handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert profile for new user with email
  INSERT INTO public.profiles (user_id, nom, email, organisation_id)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'nom', NEW.email), 
    NEW.email,
    '00000000-0000-0000-0000-000000000001'
  );
  
  -- Assign default role (personnel) unless it's the admin
  INSERT INTO public.user_roles (user_id, role, organisation_id)
  VALUES (
    NEW.id, 
    CASE 
      WHEN NEW.email = 'ninopaket@gmail.com' THEN 'admin'::app_role
      ELSE 'personnel'::app_role
    END,
    '00000000-0000-0000-0000-000000000001'
  );
  
  RETURN NEW;
END;
$$;