# Admin Role Testing Guide

## How to Test Admin Functionality

### Method 1: Using the Development Button (Recommended)

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Sign up or login** as any user

3. **Look for the green "🛡️ Make Admin" button** in the header navigation
   - This button only appears in development mode
   - It only shows for authenticated users who are not already admins

4. **Click the "🛡️ Make Admin" button**
   - This will update your user role to 'admin' in the database
   - You'll see a success notification
   - The admin dashboard will automatically open
   - The green button will disappear and be replaced with the actual "Admin" button

5. **Access Admin Features**:
   - You'll now see the "Admin" button with a shield icon in the header
   - Click it to access the admin dashboard
   - You can view analytics, manage users, and moderate issues

### Method 2: Manual Database Update

If you prefer to manually set admin roles:

1. **Open Supabase Dashboard**
2. **Go to Table Editor > users table**
3. **Find your user by email**
4. **Edit the 'role' column** and change it from 'citizen' to 'admin'
5. **Save the changes**
6. **Refresh your CivicTrack application**

### Method 3: Using the Admin Setup Script

1. **Update the `make-admin.js` file** with your Supabase credentials
2. **Uncomment and modify the example usage line**
3. **Run the script** in Node.js

## Admin Features Available

Once you have admin access, you can:

- **📊 View Analytics**: See total issues, resolution rates, user statistics
- **🏷️ Category Management**: View issues by category
- **🚩 Moderate Flagged Issues**: Review and take action on reported content  
- **👥 User Management**: View all users and manage their accounts
- **🔍 Issue Oversight**: Hide inappropriate issues, update statuses

## Removing Admin Access (for Testing)

To revert back to citizen role:
1. Use Supabase dashboard to change role back to 'citizen'
2. Or use the development tools in browser console:
   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

## Troubleshooting

### "Admin button not showing"
- Make sure you're logged in
- Check browser console for user role debug info
- Verify the user role is 'admin' in the database

### "Make Admin button not working"
- Check browser console for error messages
- Ensure you have internet connection for database updates
- Make sure Supabase is properly configured

### "Admin dashboard is empty"
- This might be due to database policies (RLS)
- Check if you have sample data in the database
- Some features require actual user data to display

---

**Note**: The development "Make Admin" button is only available in development mode and will be automatically removed in production builds.
