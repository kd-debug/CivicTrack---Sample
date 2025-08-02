-- Quick Fix: Disable RLS for Development
-- Run this AFTER running the main schema.sql

-- Disable Row Level Security temporarily for development
ALTER TABLE civic_issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE issue_status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE issue_flags DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- This will allow all operations without authentication checks
-- Re-enable RLS and add proper policies before production deployment
