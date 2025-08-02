-- Storage Policies Fix for CivicTrack (Simplified Version)
-- Run this in your Supabase SQL Editor to fix photo storage issues

-- Step 1: Create the storage bucket if it doesn't exist
-- Note: This might need to be done via the Supabase Dashboard Storage section instead

-- Step 2: Check if RLS is already enabled on storage.objects
-- Note: RLS is usually enabled by default in Supabase

-- Step 3: Create storage policies (these should work with standard permissions)
-- Drop existing policies if they exist (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow public photo uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public photo access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public photo deletion" ON storage.objects;
DROP POLICY IF EXISTS "Allow public photo updates" ON storage.objects;

-- Policy 1: Allow anyone to upload photos to civic-track-photos bucket
CREATE POLICY "Allow public photo uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'civic-track-photos');

-- Policy 2: Allow anyone to view photos from civic-track-photos bucket
CREATE POLICY "Allow public photo access"
ON storage.objects FOR SELECT
USING (bucket_id = 'civic-track-photos');

-- Policy 3: Allow anyone to delete photos from civic-track-photos bucket (optional)
CREATE POLICY "Allow public photo deletion"
ON storage.objects FOR DELETE
USING (bucket_id = 'civic-track-photos');

-- Policy 4: Allow anyone to update photos (optional, for future use)
CREATE POLICY "Allow public photo updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'civic-track-photos')
WITH CHECK (bucket_id = 'civic-track-photos');

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Test query to check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'civic-track-photos';
