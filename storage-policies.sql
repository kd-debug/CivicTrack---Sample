-- Storage policies for civic-track-photos bucket
-- Run this in your Supabase SQL Editor to fix storage upload issues

-- Enable RLS on storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to upload images to civic-track-photos bucket
CREATE POLICY "Allow public uploads to civic-track-photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'civic-track-photos' 
  AND (storage.foldername(name))[1] = 'issue-photos'
);

-- Policy to allow anyone to view images in civic-track-photos bucket
CREATE POLICY "Allow public read access to civic-track-photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'civic-track-photos'
);

-- Alternative: If you want to disable RLS completely for this bucket (less secure but simpler)
-- Uncomment the lines below if the above policies don't work:

-- DROP POLICY IF EXISTS "Allow public uploads to civic-track-photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public read access to civic-track-photos" ON storage.objects;
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Create the bucket if it doesn't exist (with proper settings)
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
