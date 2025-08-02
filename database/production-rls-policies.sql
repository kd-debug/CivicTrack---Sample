-- CivicTrack Database Schema - Production Version with Proper RLS
-- Run this to replace the development version with proper authentication-based policies

-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow all operations on issues" ON civic_issues;
DROP POLICY IF EXISTS "Allow all operations on comments" ON issue_comments;
DROP POLICY IF EXISTS "Allow all operations on status history" ON issue_status_history;
DROP POLICY IF EXISTS "Allow all operations on flags" ON issue_flags;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;

-- Re-enable RLS if disabled
ALTER TABLE civic_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Issues policies: Allow read for everyone, create for authenticated users, update for admins/owners
CREATE POLICY "Anyone can view public issues" ON civic_issues 
  FOR SELECT USING (NOT is_hidden);

CREATE POLICY "Authenticated users can create issues" ON civic_issues 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update any issue" ON civic_issues 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Issue reporters can update their own issues" ON civic_issues 
  FOR UPDATE USING (auth.uid() = reporter_id);

-- Comments policies: Allow read for everyone, create for authenticated users
CREATE POLICY "Anyone can view comments" ON issue_comments 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON issue_comments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Status History policies: Allow read for everyone, create for admins only
CREATE POLICY "Anyone can view status history" ON issue_status_history 
  FOR SELECT USING (true);

CREATE POLICY "Only admins can create status history" ON issue_status_history 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Flags policies: Users can see their own flags, authenticated users can create
CREATE POLICY "Users can view their own flags" ON issue_flags 
  FOR SELECT USING (auth.uid() = reported_by);

CREATE POLICY "Admins can view all flags" ON issue_flags 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create flags" ON issue_flags 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users policies: Users can view and update their own data, admins can view all
CREATE POLICY "Users can view their own profile" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "System can create user profiles" ON users 
  FOR INSERT WITH CHECK (true);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'citizen')
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
