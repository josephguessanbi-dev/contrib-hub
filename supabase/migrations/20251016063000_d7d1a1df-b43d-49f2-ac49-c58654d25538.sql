-- Politique pour permettre les inscriptions publiques de contribuables
CREATE POLICY "Allow public registration"
ON public.contribuables
FOR INSERT
TO anon
WITH CHECK (
  statut = 'en_attente'
  AND organisation_id = '00000000-0000-0000-0000-000000000001'
  AND created_by IS NULL
);

-- Politique pour permettre l'upload de documents lors des inscriptions publiques
CREATE POLICY "Allow documents for public registrations"
ON public.documents
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM contribuables c
    WHERE c.id = documents.contribuable_id
    AND c.statut = 'en_attente'
    AND c.created_by IS NULL
  )
);

-- Mettre à jour la politique d'insertion des contribuables pour permettre created_by NULL
DROP POLICY IF EXISTS "Staff can create contribuables in their organisation" ON public.contribuables;

CREATE POLICY "Staff can create contribuables in their organisation"
ON public.contribuables
FOR INSERT
TO authenticated
WITH CHECK (
  organisation_id = get_user_organisation(auth.uid())
  AND (created_by = auth.uid() OR created_by IS NULL)
);

-- Ajouter une politique pour le bucket de storage pour les uploads publics
INSERT INTO storage.objects (bucket_id, name, owner, metadata)
VALUES (NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Créer une politique pour permettre les uploads anonymes dans le bucket
CREATE POLICY "Allow anonymous uploads for public registrations"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'contribuables-documents');