// Location Flow Debug Script
// Paste this into browser console to test location data flow

async function debugLocationFlow() {
    console.log('🔍 Debugging location data flow...\n');

    // Test 1: Check if location is being captured
    console.log('1️⃣ Testing location capture...');
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const locationData = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    };
                    console.log('✅ Location captured:', locationData);
                    resolve(locationData);
                },
                (error) => {
                    console.error('❌ Location capture failed:', error);
                    reject(error);
                }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });

        console.log('📍 Position data structure:', position);
        console.log('📊 Latitude type:', typeof position.latitude);
        console.log('📊 Longitude type:', typeof position.longitude);
        console.log('📊 Latitude value:', position.latitude);
        console.log('📊 Longitude value:', position.longitude);

        // Test 2: Simulate form submission data
        console.log('\n2️⃣ Simulating form submission...');
        const mockFormData = {
            title: 'Location Debug Test',
            description: 'Testing location data flow',
            category: 'roads',
            useCurrentLocation: true,
            isAnonymous: true
        };

        console.log('📝 Form data:', mockFormData);

        // Test 3: Simulate issue object creation
        console.log('\n3️⃣ Creating issue object...');
        const issueObject = {
            title: mockFormData.title,
            description: mockFormData.description,
            category: mockFormData.category,
            location: position, // This should have lat/lng
            address: `Location: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`,
            reporterName: 'Debug Test',
            isAnonymous: mockFormData.isAnonymous
        };

        console.log('📦 Issue object:', issueObject);
        console.log('📍 Issue location:', issueObject.location);
        console.log('📊 Issue location type:', typeof issueObject.location);
        console.log('📊 Has latitude:', 'latitude' in issueObject.location);
        console.log('📊 Has longitude:', 'longitude' in issueObject.location);

        // Test 4: Simulate database service input
        console.log('\n4️⃣ Testing database service input...');
        const dbLatitude = issueObject.location && typeof issueObject.location.latitude === 'number' ?
            Number(issueObject.location.latitude) : null;
        const dbLongitude = issueObject.location && typeof issueObject.location.longitude === 'number' ?
            Number(issueObject.location.longitude) : null;

        console.log('🗃️ Database latitude:', dbLatitude);
        console.log('🗃️ Database longitude:', dbLongitude);
        console.log('🗃️ Latitude is valid:', dbLatitude !== null && !isNaN(dbLatitude));
        console.log('🗃️ Longitude is valid:', dbLongitude !== null && !isNaN(dbLongitude));

        if (dbLatitude && dbLongitude) {
            console.log('\n✅ Location data flow is working correctly!');
            console.log('💡 The issue might be in the form submission or useCurrentLocation checkbox');
        } else {
            console.log('\n❌ Location data is being lost somewhere in the flow');
        }

        return {
            position,
            issueObject,
            dbLatitude,
            dbLongitude
        };

    } catch (error) {
        console.error('❌ Location debug failed:', error);
        throw error;
    }
}

// Make function available globally
window.debugLocationFlow = debugLocationFlow;

// Run the debug
debugLocationFlow();