-- Storage RLS policy to allow viewing documents via signed URLs for users in the same organisation
-- Enables admins and staff to SELECT storage objects for contribuables in their organisation

-- Create SELECT policy on storage.objects for bucket 'contribuables-documents'
create policy "Org users can view contribuable documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'contribuables-documents'
    and exists (
      select 1
      from public.documents d
      join public.contribuables c on c.id = d.contribuable_id
      where d.chemin_fichier = storage.objects.name
        and c.organisation_id = public.get_user_organisation(auth.uid())
    )
  );