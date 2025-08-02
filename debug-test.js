// Test script for debugging issue creation
// Run this in browser console to test database functionality

(async function testIssueCreation() {
    console.log('=== Testing Issue Creation ===');

    // Test location
    console.log('Testing geolocation...');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('✅ Location:', {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.error('❌ Location error:', error.message);
            }
        );
    } else {
        console.error('❌ Geolocation not supported');
    }

    // Test storage access
    console.log('Testing storage bucket access...');
    try {
        const { supabase } = await
        import ('./src/services/supabase.js');
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error('❌ Storage error:', error);
        } else {
            console.log('✅ Storage buckets:', buckets.map(b => b.name));
            const photosBucket = buckets.find(b => b.name === 'civic-track-photos');
            if (photosBucket) {
                console.log('✅ Photos bucket exists');
            } else {
                console.warn('⚠️ Photos bucket not found - needs manual creation');
            }
        }
    } catch (error) {
        console.error('❌ Storage test failed:', error);
    }

    // Test database access
    console.log('Testing database access...');
    try {
        const { databaseService } = await
        import ('./src/services/databaseService.js');
        const issues = await databaseService.getIssues();
        console.log('✅ Database accessible, issues count:', issues.length);
    } catch (error) {
        console.error('❌ Database error:', error);
    }

    console.log('=== Test Complete ===');
})();