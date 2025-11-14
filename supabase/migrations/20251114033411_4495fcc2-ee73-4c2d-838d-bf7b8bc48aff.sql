-- Fix storage policies for media bucket to allow public uploads
CREATE POLICY "Anyone can upload to media bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Anyone can view media files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Anyone can update their uploads"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'media');

CREATE POLICY "Anyone can delete their uploads"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'media');