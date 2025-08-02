// Enhanced Database Debug Script
// Run this in browser console to test database access and issue loading

console.log('🔍 Starting enhanced database connectivity test...');

// Test basic database connection
async function testDatabaseConnection() {
    try {
        // Import supabase client
        const module = await
        import ('./src/services/supabase.js');
        const supabase = module.supabase;

        console.log('✅ Supabase client imported successfully');

        // Test 1: Check if we can connect to the database
        console.log('🧪 Test 1: Basic connectivity...');
        const { data: testData, error: testError } = await supabase
            .from('civic_issues')
            .select('count', { count: 'exact', head: true });

        if (testError) {
            console.error('❌ Basic connectivity failed:', testError);
            return false;
        }

        console.log('✅ Database connection successful. Total issues:', testData);

        // Test 2: Fetch a few sample issues
        console.log('🧪 Test 2: Fetching sample issues...');
        const { data: sampleIssues, error: fetchError } = await supabase
            .from('civic_issues')
            .select('*')
            .limit(5);

        if (fetchError) {
            console.error('❌ Sample fetch failed:', fetchError);
            return false;
        }

        console.log('✅ Sample issues fetched:', {
            count: sampleIssues.length,
            issues: sampleIssues.map(issue => ({
                id: issue.id,
                title: issue.title,
                category: issue.category,
                status: issue.status,
                created_at: issue.created_at,
                has_location: !!(issue.latitude && issue.longitude),
                location: issue.latitude && issue.longitude ? `${issue.latitude}, ${issue.longitude}` : 'No location'
            }))
        });

        return sampleIssues;

    } catch (error) {
        console.error('❌ Database test failed:', error);
        return false;
    }
}

// Test 2: Try to insert a simple test issue
async function testIssueInsertion() {
    try {
        console.log('🧪 Testing issue insertion...');

        const testIssue = {
            title: 'Test Issue - ' + new Date().toISOString(),
            description: 'This is a test issue to check database insertion',
            category: 'roads',
            status: 'reported',
            latitude: 28.6129,
            longitude: 77.2295,
            address: 'Test Location',
            photos: [],
            reporter_name: 'Test User',
            reporter_id: null,
            is_anonymous: true
        };

        console.log('📤 Inserting test issue:', testIssue);

        const { data, error } = await window.supabase
            .from('civic_issues')
            .insert([testIssue])
            .select()
            .single();

        if (error) {
            console.error('❌ Issue insertion failed:', error);

            if (error.message.includes('row-level security')) {
                console.log('💡 RLS Policy Issue: Run this SQL in Supabase:');
                console.log('ALTER TABLE civic_issues DISABLE ROW LEVEL SECURITY;');
            }

            return false;
        }

        console.log('✅ Issue inserted successfully:', data);

        // Clean up - delete the test issue
        await window.supabase.from('civic_issues').delete().eq('id', data.id);
        console.log('🧹 Test issue cleaned up');

        return true;
    } catch (err) {
        console.error('❌ Issue insertion test failed:', err);
        return false;
    }
}

// Test 3: Check current user authentication
async function testAuthentication() {
    try {
        const { data: { user }, error } = await window.supabase.auth.getUser();

        if (error) {
            console.error('❌ Auth check failed:', error);
            return false;
        }

        if (user) {
            console.log('✅ User authenticated:', { id: user.id, email: user.email });
        } else {
            console.log('ℹ️ No user authenticated (anonymous mode)');
        }

        return true;
    } catch (err) {
        console.error('❌ Auth test failed:', err);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running database diagnostic tests...\n');

    await testAuthentication();
    console.log('');

    const connectionOk = await testSupabaseConnection();
    console.log('');

    if (connectionOk) {
        await testIssueInsertion();
    }

    console.log('\n✨ Database diagnostic complete!');
}

// Make functions available globally
window.testSupabaseConnection = testSupabaseConnection;
window.testIssueInsertion = testIssueInsertion;
window.testAuthentication = testAuthentication;
window.runAllTests = runAllTests;

// Auto-run tests
runAllTests();