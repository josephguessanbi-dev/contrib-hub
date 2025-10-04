-- Supprimer les politiques existantes sur contribuables
DROP POLICY IF EXISTS "Staff can create contribuables in their organisation" ON public.contribuables;
DROP POLICY IF EXISTS "Staff can update contribuables in their organisation" ON public.contribuables;
DROP POLICY IF EXISTS "Users can view contribuables in their organisation" ON public.contribuables;
DROP POLICY IF EXISTS "Only admins can delete contribuables" ON public.contribuables;

-- Politique de lecture : 
-- - Personnel voit seulement ceux qu'il a créés
-- - Admin voit tous les contribuables de son organisation
CREATE POLICY "Users can view their own or all if admin"
ON public.contribuables
FOR SELECT
TO authenticated
USING (
  organisation_id = get_user_organisation(auth.uid())
  AND (
    created_by = auth.uid() 
    OR get_user_role(auth.uid(), organisation_id) = 'admin'::app_role
  )
);

-- Politique de création : Personnel et admins peuvent créer des contribuables
CREATE POLICY "Staff can create contribuables in their organisation"
ON public.contribuables
FOR INSERT
TO authenticated
WITH CHECK (
  organisation_id = get_user_organisation(auth.uid())
  AND created_by = auth.uid()
);

-- Politique de modification : 
-- - Personnel peut modifier seulement ceux qu'il a créés
-- - Admin peut modifier tous les contribuables de son organisation
CREATE POLICY "Users can update their own or all if admin"
ON public.contribuables
FOR UPDATE
TO authenticated
USING (
  organisation_id = get_user_organisation(auth.uid())
  AND (
    created_by = auth.uid() 
    OR get_user_role(auth.uid(), organisation_id) = 'admin'::app_role
  )
)
WITH CHECK (
  organisation_id = get_user_organisation(auth.uid())
  AND (
    created_by = auth.uid() 
    OR get_user_role(auth.uid(), organisation_id) = 'admin'::app_role
  )
);

-- Politique de suppression : SEULEMENT les admins peuvent supprimer
CREATE POLICY "Only admins can delete contribuables"
ON public.contribuables
FOR DELETE
TO authenticated
USING (
  organisation_id = get_user_organisation(auth.uid()) 
  AND get_user_role(auth.uid(), organisation_id) = 'admin'::app_role
);