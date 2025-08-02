// Simple API test script - copy and paste this into browser console
(async function testAPI() {
    console.log('=== Testing API Routes ===');

    try {
        // Test 1: Test basic database connection
        console.log('1. Testing basic database connection...');
        const { supabase } = await
        import ('./src/services/supabase.js');

        const { data: healthCheck, error: healthError } = await supabase
            .from('civic_issues')
            .select('count')
            .limit(1);

        if (healthError) {
            console.error('❌ Database connection failed:', healthError);
            return;
        } else {
            console.log('✅ Database connection successful');
        }

        // Test 2: Test user authentication
        console.log('2. Testing user authentication...');
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.error('❌ Auth error:', authError);
        } else if (user) {
            console.log('✅ User authenticated:', user.id);

            // Test 3: Test simple civic_issues query
            console.log('3. Testing civic_issues table...');
            const { data: issues, error: issuesError } = await supabase
                .from('civic_issues')
                .select('id, title, reporter_id')
                .limit(5);

            if (issuesError) {
                console.error('❌ Issues query failed:', issuesError);
            } else {
                console.log('✅ Issues query successful:', issues.length, 'issues');
                console.log('Sample issues:', issues);
            }

            // Test 4: Test users table
            console.log('4. Testing users table...');
            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, name, email')
                .limit(5);

            if (usersError) {
                console.error('❌ Users query failed:', usersError);
                console.log('This might be normal if users table doesn\'t exist yet');
            } else {
                console.log('✅ Users query successful:', users.length, 'users');
            }

            // Test 5: Test user-specific reports
            console.log('5. Testing user reports query...');
            const { data: userReports, error: reportsError } = await supabase
                .from('civic_issues')
                .select('*')
                .eq('reporter_id', user.id);

            if (reportsError) {
                console.error('❌ User reports query failed:', reportsError);
            } else {
                console.log('✅ User reports query successful:', userReports.length, 'reports for current user');
            }

        } else {
            console.log('❌ No user authenticated - please sign in first');
        }

    } catch (error) {
        console.error('❌ API test failed:', error);
    }

    console.log('=== API Test Complete ===');
})();