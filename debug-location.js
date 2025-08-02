// Location Test Script
// Paste this into your browser console when on the CivicTrack app

console.log('🧪 Starting comprehensive location test...');

// Test 1: Check if geolocation is available
function testGeolocationSupport() {
    if ('geolocation' in navigator) {
        console.log('✅ Geolocation is supported');
        return true;
    } else {
        console.error('❌ Geolocation is not supported');
        return false;
    }
}

// Test 2: Get current position
function testGetCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        console.log('📍 Requesting current position...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const locationData = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date(position.timestamp).toISOString()
                };

                console.log('✅ Position obtained:', locationData);
                console.log('📊 Location details:', {
                    lat: locationData.latitude,
                    lng: locationData.longitude,
                    accuracy: `${locationData.accuracy} meters`,
                    time: locationData.timestamp
                });

                resolve(locationData);
            },
            (error) => {
                console.error('❌ Geolocation error:', error);
                console.error('Error details:', {
                    code: error.code,
                    message: error.message,
                    description: getGeolocationErrorDescription(error.code)
                });
                reject(error);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Helper function to explain geolocation errors
function getGeolocationErrorDescription(code) {
    switch (code) {
        case 1:
            return 'Permission denied - user rejected location access';
        case 2:
            return 'Position unavailable - location could not be determined';
        case 3:
            return 'Timeout - location request timed out';
        default:
            return 'Unknown error';
    }
}

// Test 3: Test database insertion with location
async function testDatabaseInsertWithLocation(locationData) {
    try {
        console.log('🧪 Testing database insertion...');

        const testIssue = {
            title: 'Location Test - ' + new Date().toISOString(),
            description: 'Automated test to verify location is being saved to database',
            category: 'roads',
            location: {
                latitude: locationData.latitude,
                longitude: locationData.longitude
            },
            address: `Test Location: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`,
            photos: [],
            reporterName: 'Location Test',
            reporter_id: null,
            isAnonymous: true
        };

        console.log('📤 Sending to database:', testIssue);

        // Check if databaseService is available
        if (typeof window.databaseService !== 'undefined') {
            const result = await window.databaseService.createIssue(testIssue);
            console.log('✅ Database insertion successful:', result);

            // Verify the coordinates were saved
            if (result.latitude && result.longitude) {
                console.log('✅ Coordinates saved successfully:', {
                    saved_lat: result.latitude,
                    saved_lng: result.longitude,
                    original_lat: locationData.latitude,
                    original_lng: locationData.longitude
                });
            } else {
                console.warn('⚠️ Coordinates not saved to database');
            }

            return result;
        } else {
            console.warn('⚠️ databaseService not available in global scope');
            console.log('📋 Test issue object (would be sent):', testIssue);
            return testIssue;
        }

    } catch (error) {
        console.error('❌ Database insertion failed:', error);
        throw error;
    }
}

// Run all tests
async function runLocationTests() {
    try {
        console.log('🚀 Starting location test suite...\n');

        // Test 1
        const hasGeolocation = testGeolocationSupport();
        if (!hasGeolocation) return;

        console.log('');

        // Test 2
        const locationData = await testGetCurrentPosition();

        console.log('');

        // Test 3
        await testDatabaseInsertWithLocation(locationData);

        console.log('\n✨ All location tests completed successfully!');
        console.log('🎯 Your location should now be saved when creating civic issues.');

    } catch (error) {
        console.error('\n❌ Location test failed:', error);
        console.log('\n💡 Troubleshooting tips:');
        console.log('1. Make sure you allow location access when prompted');
        console.log('2. Check that you\'re on HTTPS (required for geolocation)');
        console.log('3. Ensure your device has location services enabled');
    }
}

// Make functions available globally
window.testGeolocationSupport = testGeolocationSupport;
window.testGetCurrentPosition = testGetCurrentPosition;
window.testDatabaseInsertWithLocation = testDatabaseInsertWithLocation;
window.runLocationTests = runLocationTests;

// Auto-run the tests
runLocationTests();