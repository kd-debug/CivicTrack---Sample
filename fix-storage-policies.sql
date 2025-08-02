-- Storage policies for photo uploads
-- Run this ONLY if you need to fix storage upload issues
-- This creates policies instead of disabling RLS entirely

-- Create policy to allow anyone to upload to civic-track-photos bucket
CREATE POLICY "Allow public uploads to civic-track-photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'civic-track-photos' 
);

-- Create policy to allow anyone to read from civic-track-photos bucket  
CREATE POLICY "Allow public reads from civic-track-photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'civic-track-photos'
);

-- Create policy to allow anyone to delete their own uploads (optional)
CREATE POLICY "Allow users to delete their own uploads"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'civic-track-photos'
);

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'civic-track-photos', 
  'civic-track-photos', 
  true, 
  5242880,  -- 5MB limit
  '{"image/png","image/jpg","image/jpeg","image/gif","image/webp"}'
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = '{"image/png","image/jpg","image/jpeg","image/gif","image/webp"}';
