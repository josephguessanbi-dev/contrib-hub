-- Supprimer les anciennes politiques conflictuelles sur contribuables
DROP POLICY IF EXISTS "Anyone can create contribuables" ON public.contribuables;
DROP POLICY IF EXISTS "Authenticated users can create contribuables in their organisat" ON public.contribuables;
DROP POLICY IF EXISTS "Personnel and admins can update contribuables in their organisa" ON public.contribuables;
DROP POLICY IF EXISTS "Users can view contribuables in their organisation" ON public.contribuables;
DROP POLICY IF EXISTS "Admins can delete contribuables in their organisation" ON public.contribuables;

-- Politique de lecture : Tous les utilisateurs de l'organisation peuvent voir les contribuables
CREATE POLICY "Users can view contribuables in their organisation"
ON public.contribuables
FOR SELECT
TO authenticated
USING (organisation_id = get_user_organisation(auth.uid()));

-- Politique de création : Personnel et admins peuvent créer des contribuables dans leur organisation
CREATE POLICY "Staff can create contribuables in their organisation"
ON public.contribuables
FOR INSERT
TO authenticated
WITH CHECK (organisation_id = get_user_organisation(auth.uid()));

-- Politique de modification : Personnel et admins peuvent modifier les contribuables de leur organisation
CREATE POLICY "Staff can update contribuables in their organisation"
ON public.contribuables
FOR UPDATE
TO authenticated
USING (organisation_id = get_user_organisation(auth.uid()))
WITH CHECK (organisation_id = get_user_organisation(auth.uid()));

-- Politique de suppression : SEULEMENT les admins peuvent supprimer
CREATE POLICY "Only admins can delete contribuables"
ON public.contribuables
FOR DELETE
TO authenticated
USING (
  organisation_id = get_user_organisation(auth.uid()) 
  AND get_user_role(auth.uid(), organisation_id) = 'admin'::app_role
);