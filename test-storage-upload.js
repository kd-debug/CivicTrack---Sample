// Test Storage Upload Script
// Run this in browser console to test storage upload

async function testStorageUpload() {
    try {
        console.log('Testing Supabase Storage upload...');

        // Import supabase client
        const { createClient } = await
        import ('./src/services/supabase.js');
        const supabase = createClient();

        // Check if bucket exists
        console.log('1. Checking if bucket exists...');
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

        if (bucketError) {
            console.error('Failed to list buckets:', bucketError);
            return;
        }

        console.log('Available buckets:', buckets.map(b => b.name));

        const bucketExists = buckets.some(bucket => bucket.name === 'civic-track-photos');
        console.log('civic-track-photos bucket exists:', bucketExists);

        if (!bucketExists) {
            console.log('2. Creating bucket...');
            const { data: newBucket, error: createError } = await supabase.storage.createBucket('civic-track-photos', {
                public: true,
                allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'],
                fileSizeLimit: 5242880 // 5MB
            });

            if (createError) {
                console.error('Failed to create bucket:', createError);
                console.log('You may need to run the storage-policies-fix.sql script in Supabase SQL Editor');
                return;
            }
            console.log('Bucket created successfully');
        }

        // Test upload with a small test file
        console.log('3. Testing file upload...');

        // Create a test blob (1x1 pixel PNG)
        const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        const response = await fetch(testImageData);
        const blob = await response.blob();

        const testFile = new File([blob], 'test.png', { type: 'image/png' });
        const testPath = `test-uploads/test_${Date.now()}.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('civic-track-photos')
            .upload(testPath, testFile);

        if (uploadError) {
            console.error('Upload failed:', uploadError);
            console.log('This is likely a storage policy issue. Run storage-policies-fix.sql in Supabase SQL Editor');
            return;
        }

        console.log('Upload successful:', uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('civic-track-photos')
            .getPublicUrl(testPath);

        console.log('Public URL:', publicUrl);

        // Clean up test file
        const { error: deleteError } = await supabase.storage
            .from('civic-track-photos')
            .remove([testPath]);

        if (deleteError) {
            console.warn('Failed to clean up test file:', deleteError);
        } else {
            console.log('Test file cleaned up successfully');
        }

        console.log('✅ Storage upload test completed successfully!');

    } catch (error) {
        console.error('Storage test failed:', error);
    }
}

// Run the test
testStorageUpload();