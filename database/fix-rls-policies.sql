-- CivicTrack Database Schema - Development Version (More Permissive)
-- Run this in your Supabase SQL Editor to fix RLS issues

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view issues" ON civic_issues;
DROP POLICY IF EXISTS "Authenticated users can create issues" ON civic_issues;
DROP POLICY IF EXISTS "Reporters and admins can update issues" ON civic_issues;
DROP POLICY IF EXISTS "Anyone can view comments" ON issue_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON issue_comments;
DROP POLICY IF EXISTS "Anyone can view status history" ON issue_status_history;
DROP POLICY IF EXISTS "Only admins can create status history" ON issue_status_history;
DROP POLICY IF EXISTS "Users can view their own flags" ON issue_flags;
DROP POLICY IF EXISTS "Authenticated users can create flags" ON issue_flags;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create more permissive RLS policies for development

-- Issues: Allow all operations for anonymous users (development only)
CREATE POLICY "Allow all operations on issues" ON civic_issues 
FOR ALL USING (true) WITH CHECK (true);

-- Comments: Allow all operations for anonymous users (development only)
CREATE POLICY "Allow all operations on comments" ON issue_comments 
FOR ALL USING (true) WITH CHECK (true);

-- Status History: Allow all operations for anonymous users (development only)
CREATE POLICY "Allow all operations on status history" ON issue_status_history 
FOR ALL USING (true) WITH CHECK (true);

-- Flags: Allow all operations for anonymous users (development only)
CREATE POLICY "Allow all operations on flags" ON issue_flags 
FOR ALL USING (true) WITH CHECK (true);

-- Users: Allow all operations for anonymous users (development only)
CREATE POLICY "Allow all operations on users" ON users 
FOR ALL USING (true) WITH CHECK (true);

-- Alternatively, if you want to disable RLS completely for development:
-- ALTER TABLE civic_issues DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE issue_comments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE issue_status_history DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE issue_flags DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
