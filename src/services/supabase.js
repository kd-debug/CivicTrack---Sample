import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL || 'https://nypujfevyhmhfpfuwfrl.supabase.co';
const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
    console.warn('⚠️ Supabase anon key not found! Please add VITE_SUPABASE_ANON_KEY to your .env file');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
    ISSUES: 'civic_issues',
    USERS: 'users',
    COMMENTS: 'issue_comments',
    STATUS_HISTORY: 'issue_status_history',
    FLAGS: 'issue_flags'
};

// Database schemas for reference
export const DATABASE_SCHEMAS = {
    // civic_issues table
    ISSUES: {
        id: 'uuid',
        title: 'text',
        description: 'text',
        category: 'text',
        status: 'text',
        latitude: 'decimal',
        longitude: 'decimal',
        address: 'text',
        photos: 'jsonb', // array of photo URLs
        reporter_name: 'text',
        reporter_id: 'uuid',
        is_anonymous: 'boolean',
        flag_count: 'integer',
        is_hidden: 'boolean',
        created_at: 'timestamptz',
        updated_at: 'timestamptz'
    },

    // issue_comments table
    COMMENTS: {
        id: 'uuid',
        issue_id: 'uuid',
        author_name: 'text',
        author_id: 'uuid',
        content: 'text',
        created_at: 'timestamptz'
    },

    // issue_status_history table
    STATUS_HISTORY: {
        id: 'uuid',
        issue_id: 'uuid',
        status: 'text',
        note: 'text',
        changed_by: 'uuid',
        created_at: 'timestamptz'
    },

    // issue_flags table
    FLAGS: {
        id: 'uuid',
        issue_id: 'uuid',
        reason: 'text',
        reported_by: 'uuid',
        created_at: 'timestamptz'
    },

    // users table (optional for user management)
    USERS: {
        id: 'uuid',
        email: 'text',
        name: 'text',
        role: 'text',
        is_anonymous: 'boolean',
        created_at: 'timestamptz'
    }
};