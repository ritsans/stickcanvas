-- Policies for post-images storage bucket

-- Allow authenticated users to upload new objects into the post-images bucket
create policy if not exists "Authenticated users can upload post images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-images'
    and auth.uid() = owner
  );

-- Allow authenticated users to update objects they own in the post-images bucket
create policy if not exists "Authenticated users can update own post images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'post-images'
    and auth.uid() = owner
  )
  with check (
    bucket_id = 'post-images'
    and auth.uid() = owner
  );

-- Allow authenticated users to delete objects they own in the post-images bucket
create policy if not exists "Authenticated users can delete own post images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'post-images'
    and auth.uid() = owner
  );

-- Allow anyone to read objects in the post-images bucket (useful if the bucket is public)
create policy if not exists "Public can view post images"
  on storage.objects for select to public
  using (
    bucket_id = 'post-images'
  );
