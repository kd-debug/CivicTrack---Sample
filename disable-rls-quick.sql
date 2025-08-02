-- Quick RLS disable script for development
-- Copy and paste this into your Supabase SQL Editor

-- Disable Row Level Security for all tables (DEVELOPMENT ONLY)
ALTER TABLE civic_issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE issue_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE issue_flags DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Check if tables exist and show current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('civic_issues', 'issue_comments', 'issue_status_history', 'issue_flags', 'users')
    AND schemaname = 'public';

-- Test insert to verify it works
INSERT INTO civic_issues (
    title, 
    description, 
    category, 
    status, 
    latitude, 
    longitude, 
    address, 
    reporter_name, 
    is_anonymous
) VALUES (
    'RLS Test Issue', 
    'Testing if RLS is properly disabled', 
    'roads', 
    'reported', 
    28.6129, 
    77.2295, 
    'Test Location', 
    'System Test', 
    true
);

-- Clean up test
DELETE FROM civic_issues WHERE title = 'RLS Test Issue';
