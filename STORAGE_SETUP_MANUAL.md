## Alternative Storage Setup Guide for CivicTrack

If you're getting permission errors with the SQL script, follow these manual steps:

### Step 1: Create Storage Bucket via Dashboard
1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Set the following:
   - **Name**: `civic-track-photos`
   - **Public bucket**: ✅ **Enabled**
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/png, image/jpg, image/jpeg, image/gif, image/webp`
5. Click **"Save"**

### Step 2: Create Storage Policies via Dashboard
1. Still in **Storage**, click on your `civic-track-photos` bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**
4. Create these 4 policies:

#### Policy 1: Upload Policy
- **Policy name**: `Allow public photo uploads`
- **Allowed operation**: `INSERT`
- **Target roles**: `public`
- **USING expression**: (leave empty)
- **WITH CHECK expression**: `bucket_id = 'civic-track-photos'`

#### Policy 2: View Policy
- **Policy name**: `Allow public photo access`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **USING expression**: `bucket_id = 'civic-track-photos'`
- **WITH CHECK expression**: (leave empty)

#### Policy 3: Delete Policy (Optional)
- **Policy name**: `Allow public photo deletion`
- **Allowed operation**: `DELETE`
- **Target roles**: `public`
- **USING expression**: `bucket_id = 'civic-track-photos'`
- **WITH CHECK expression**: (leave empty)

#### Policy 4: Update Policy (Optional)
- **Policy name**: `Allow public photo updates`
- **Allowed operation**: `UPDATE`
- **Target roles**: `public`
- **USING expression**: `bucket_id = 'civic-track-photos'`
- **WITH CHECK expression**: `bucket_id = 'civic-track-photos'`

### Step 3: Test the Setup
1. Open your CivicTrack app
2. Try uploading a photo when reporting an issue
3. Check the browser console for any storage-related errors
4. Verify that photos appear as URLs starting with `https://` instead of Base64 data

### Troubleshooting
If you still get errors:
1. Make sure your Supabase project has storage enabled
2. Check that you're the owner/admin of the project
3. Try refreshing your browser after setting up policies
4. Contact Supabase support if permission issues persist
