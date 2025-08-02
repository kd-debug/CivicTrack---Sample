# Supabase Storage Setup for Photo Uploads

## Quick Setup Instructions

### Step 1: Create Storage Bucket
1. Go to your Supabase dashboard: https://supabase.com/dashboard/projects
2. Select your project: `nypujfevyhmhfpfuwfrl`
3. Navigate to **Storage** in the left sidebar
4. Click **"Create bucket"**
5. Enter bucket name: `civic-track-photos`
6. Set as **Public bucket** (check the "Public bucket" checkbox)
7. Click **"Create bucket"**

### Step 2: Configure Bucket Policies (Optional)
If you want more control over who can upload/access photos:

1. Go to **Storage** → **Policies** in your Supabase dashboard
2. Create policies for the `civic-track-photos` bucket:

```sql
-- Allow anyone to upload photos
CREATE POLICY "Anyone can upload photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'civic-track-photos');

-- Allow anyone to view photos
CREATE POLICY "Anyone can view photos" ON storage.objects
FOR SELECT USING (bucket_id = 'civic-track-photos');
```

### Step 3: Test Photo Upload
1. Go back to your CivicTrack application
2. Try reporting a new issue with a photo
3. Check the browser console for upload logs
4. Verify photos appear in your Supabase Storage bucket

## Troubleshooting

### Common Issues:

1. **"Failed to upload photo"**
   - Make sure the bucket exists and is named exactly `civic-track-photos`
   - Check that the bucket is set to Public
   - Verify your Supabase URL and anon key in `.env`

2. **"Storage bucket not found"**
   - The bucket name is case-sensitive: use `civic-track-photos`
   - Refresh your browser after creating the bucket

3. **"Row Level Security policy violation"**
   - Make sure you've set the bucket as Public
   - Or create the upload/select policies mentioned above

4. **Photos appear as broken links**
   - Check that the bucket is set to Public
   - Verify the public URL generation is working

### Verification Steps:
1. Check browser console for upload logs: `Photo uploaded successfully: https://...`
2. Verify in Supabase Storage that files appear in `civic-track-photos/issue-photos/`
3. Test that photo URLs are accessible by opening them in a new browser tab

## Current Status
- ✅ Upload functionality implemented
- ✅ Automatic bucket creation attempt (requires manual creation if permissions insufficient)
- ✅ Base64 fallback for when storage upload fails
- ✅ Location coordinates fixed (latitude/longitude format)
- ⏳ **Manual bucket creation needed** (see Step 1 above)

After completing the bucket setup, your photo uploads should work perfectly!
