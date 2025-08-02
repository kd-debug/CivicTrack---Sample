// Test script for debugging user reports system
// Copy and paste this into browser console to test

(async function testUserReportsSystem() {
    console.log('=== Testing User Reports System ===');

    try {
        // Import services
        const { databaseService } = await
        import ('./src/services/databaseService.js');
        const { supabase } = await
        import ('./src/services/supabase.js');

        // Test 1: Check current user authentication
        console.log('1. Testing user authentication...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
            console.error('❌ Auth error:', authError);
            return;
        }

        if (user) {
            console.log('✅ User authenticated:', {
                id: user.id,
                email: user.email
            });

            // Test 2: Test getUserReports function
            console.log('2. Testing getUserReports...');
            try {
                const reports = await databaseService.getUserReports(user.id);
                console.log('✅ User reports:', reports.length, 'reports found');
                console.log('Reports:', reports);
            } catch (error) {
                console.error('❌ getUserReports failed:', error);
            }

            // Test 3: Test getUserProfile function
            console.log('3. Testing getUserProfile...');
            try {
                const profile = await databaseService.getUserProfile(user.id);
                console.log('✅ User profile:', profile);
            } catch (error) {
                console.error('❌ getUserProfile failed:', error);
            }

        } else {
            console.log('❌ No user authenticated - please sign in first');
        }

        // Test 4: Check database tables
        console.log('4. Testing database access...');
        try {
            const { data: issues, error: issuesError } = await supabase
                .from('civic_issues')
                .select('*')
                .limit(5);

            if (issuesError) {
                console.error('❌ Issues table error:', issuesError);
            } else {
                console.log('✅ Issues table accessible:', issues.length, 'issues found');
            }

            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('*')
                .limit(5);

            if (usersError) {
                console.error('❌ Users table error:', usersError);
            } else {
                console.log('✅ Users table accessible:', users.length, 'users found');
            }

        } catch (error) {
            console.error('❌ Database test failed:', error);
        }

    } catch (error) {
        console.error('❌ Test setup failed:', error);
    }

    console.log('=== Test Complete ===');
})();