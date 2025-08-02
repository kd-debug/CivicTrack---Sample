// Admin Role Assignment Script
// Run this script to make a user an admin in the database

import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'your_supabase_url';
const supabaseAnonKey = 'your_supabase_anon_key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function makeUserAdmin(userEmail) {
    try {
        console.log(`🔧 Making user ${userEmail} an admin...`);

        // Update user role to admin
        const { data, error } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('email', userEmail)
            .select();

        if (error) {
            console.error('❌ Error updating user role:', error);
            return;
        }

        if (data && data.length > 0) {
            console.log('✅ Successfully made user admin:', data[0]);
        } else {
            console.log('⚠️ No user found with email:', userEmail);

            // List all users to help debug
            const { data: allUsers, error: listError } = await supabase
                .from('users')
                .select('id, email, name, role');

            if (!listError && allUsers) {
                console.log('\n📋 All users in database:');
                allUsers.forEach(user => {
                    console.log(`  - ${user.email} (${user.name}) - Role: ${user.role}`);
                });
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Example usage:
// makeUserAdmin('your-email@example.com');

// Uncomment and modify the line below to run:
// makeUserAdmin('admin@test.com');

export { makeUserAdmin };