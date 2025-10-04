-- Créer un bucket de stockage pour les documents des contribuables
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contribuables-documents',
  'contribuables-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Politique pour permettre aux utilisateurs authentifiés de télécharger leurs propres documents
CREATE POLICY "Users can upload documents for their contribuables"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contribuables-documents' AND
  auth.uid() IS NOT NULL
);

-- Politique pour permettre aux utilisateurs de voir les documents des contribuables de leur organisation
CREATE POLICY "Users can view documents in their organisation"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'contribuables-documents' AND
  auth.uid() IS NOT NULL
);

-- Politique pour permettre la mise à jour des documents
CREATE POLICY "Users can update their documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contribuables-documents' AND
  auth.uid() IS NOT NULL
);

-- Politique pour permettre la suppression des documents (admin seulement)
CREATE POLICY "Admins can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'contribuables-documents' AND
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);