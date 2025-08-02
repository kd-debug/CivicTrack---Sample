-- Minimal Storage Policies (Try this if the main script fails)
-- Run this in Supabase SQL Editor

-- Simple policies without explicit table alterations
CREATE POLICY IF NOT EXISTS "Public photo uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'civic-track-photos');

CREATE POLICY IF NOT EXISTS "Public photo access"
ON storage.objects FOR SELECT
USING (bucket_id = 'civic-track-photos');

-- Check if policies were created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%photo%';
