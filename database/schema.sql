-- CivicTrack Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security (RLS) and necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (optional, can use Supabase Auth instead)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create civic_issues table
CREATE TABLE IF NOT EXISTS civic_issues (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('roads', 'lighting', 'water_supply', 'cleanliness', 'public_safety', 'obstructions')),
    status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved', 'rejected')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    reporter_name TEXT DEFAULT 'Anonymous',
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT false,
    flag_count INTEGER DEFAULT 0,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create issue_comments table
CREATE TABLE IF NOT EXISTS issue_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    issue_id UUID REFERENCES civic_issues(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create issue_status_history table
CREATE TABLE IF NOT EXISTS issue_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    issue_id UUID REFERENCES civic_issues(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('reported', 'in_progress', 'resolved', 'rejected')),
    note TEXT,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create issue_flags table
CREATE TABLE IF NOT EXISTS issue_flags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    issue_id UUID REFERENCES civic_issues(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_civic_issues_location ON civic_issues(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_civic_issues_category ON civic_issues(category);
CREATE INDEX IF NOT EXISTS idx_civic_issues_status ON civic_issues(status);
CREATE INDEX IF NOT EXISTS idx_civic_issues_created_at ON civic_issues(created_at);
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_status_history_issue_id ON issue_status_history(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_flags_issue_id ON issue_flags(issue_id);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_civic_issues_updated_at BEFORE UPDATE ON civic_issues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update flag count
CREATE OR REPLACE FUNCTION update_issue_flag_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE civic_issues 
        SET flag_count = (SELECT COUNT(*) FROM issue_flags WHERE issue_id = NEW.issue_id),
            is_hidden = CASE WHEN (SELECT COUNT(*) FROM issue_flags WHERE issue_id = NEW.issue_id) >= 3 THEN true ELSE is_hidden END
        WHERE id = NEW.issue_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE civic_issues 
        SET flag_count = (SELECT COUNT(*) FROM issue_flags WHERE issue_id = OLD.issue_id),
            is_hidden = CASE WHEN (SELECT COUNT(*) FROM issue_flags WHERE issue_id = OLD.issue_id) < 3 THEN false ELSE is_hidden END
        WHERE id = OLD.issue_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for flag count
CREATE TRIGGER update_flag_count AFTER INSERT OR DELETE ON issue_flags
    FOR EACH ROW EXECUTE FUNCTION update_issue_flag_count();

-- Enable Row Level Security (RLS)
ALTER TABLE civic_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies - adjust based on your needs)

-- Issues: Anyone can read, authenticated users can insert, only reporters/admins can update
CREATE POLICY "Anyone can view issues" ON civic_issues FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create issues" ON civic_issues FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Reporters and admins can update issues" ON civic_issues FOR UPDATE USING (
    auth.uid() = reporter_id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Comments: Anyone can read, authenticated users can insert
CREATE POLICY "Anyone can view comments" ON issue_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON issue_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Status History: Anyone can read, only admins can insert
CREATE POLICY "Anyone can view status history" ON issue_status_history FOR SELECT USING (true);
CREATE POLICY "Only admins can create status history" ON issue_status_history FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Flags: Only the reporter can see their flags, authenticated users can insert
CREATE POLICY "Users can view their own flags" ON issue_flags FOR SELECT USING (auth.uid() = reported_by);
CREATE POLICY "Authenticated users can create flags" ON issue_flags FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users: Users can view and update their own data
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Insert some sample data (optional)
INSERT INTO users (id, email, name, role) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'admin@civictrack.com', 'Admin User', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440001', 'user@example.com', 'Regular User', 'citizen')
ON CONFLICT (email) DO NOTHING;

-- Insert sample issues
INSERT INTO civic_issues (id, title, description, category, status, latitude, longitude, address, reporter_name, is_anonymous) VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'Large pothole on Main Street', 'Deep pothole causing vehicle damage near the intersection of Main St and Oak Ave.', 'roads', 'reported', 28.6129, 77.2295, 'Main Street, Near Oak Avenue', 'Anonymous', true),
    ('123e4567-e89b-12d3-a456-426614174001', 'Street light not working', 'Street light has been out for over a week on Elm Street.', 'lighting', 'in_progress', 28.6140, 77.2070, 'Elm Street, Block 15', 'John Smith', false),
    ('123e4567-e89b-12d3-a456-426614174002', 'Water leak in park', 'Continuous water leak near the playground area.', 'water_supply', 'resolved', 28.6159, 77.2010, 'Central Park, Playground Area', 'Sarah Johnson', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample status history
INSERT INTO issue_status_history (issue_id, status, note) VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'reported', 'Issue reported by citizen'),
    ('123e4567-e89b-12d3-a456-426614174001', 'reported', 'Issue reported by citizen'),
    ('123e4567-e89b-12d3-a456-426614174001', 'in_progress', 'Work order assigned to maintenance team'),
    ('123e4567-e89b-12d3-a456-426614174002', 'reported', 'Issue reported by citizen'),
    ('123e4567-e89b-12d3-a456-426614174002', 'in_progress', 'Plumbing team dispatched'),
    ('123e4567-e89b-12d3-a456-426614174002', 'resolved', 'Leak repaired and area cleaned')
ON CONFLICT (id) DO NOTHING;
