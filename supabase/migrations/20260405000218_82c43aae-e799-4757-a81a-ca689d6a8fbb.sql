-- Drop the restrictive upload policy that requires auth
DROP POLICY IF EXISTS "Authenticated users can upload own avatars" ON storage.objects;

-- Allow anyone (anon or authenticated) to upload to avatars bucket
CREATE POLICY "Anyone can upload avatars"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'avatars');
