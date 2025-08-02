# CivicTrack Database Setup Instructions

## Prerequisites
1. Make sure you have a Supabase account and project created
2. Your Supabase credentials are already configured in `.env`

# CivicTrack Database Setup Instructions

## Prerequisites
1. Make sure you have a Supabase account and project created
2. Your Supabase credentials are already configured in `.env`

## Database Setup

### Step 1: Run the Database Schema
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `nypujfevyhmhfpfuwfrl`
3. Navigate to "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of `database/schema.sql` and paste it into the query editor
6. Click "Run" to execute the schema

### Step 1.5: Choose Your Authentication Mode

#### Option A: Development Mode (No Authentication Required)
For quick testing and hackathon development:
1. In the SQL Editor, run the contents of `database/disable-rls-dev.sql`
2. This allows anyone to create/edit issues without logging in

#### Option B: Production Mode (With Authentication)
For full authentication features:
1. In the SQL Editor, run the contents of `database/production-rls-policies.sql`
2. Users will need to sign up/login to report issues
3. Only admins can update issue status
4. Proper role-based access control

### Step 2: Verify Tables Created
After running the schema, you should see these tables in your "Table Editor":
- `civic_issues` - Main issues table
- `issue_comments` - Comments on issues
- `issue_status_history` - Status change tracking
- `issue_flags` - Flagged issues for moderation
- `users` - User accounts (optional)

### Step 3: Set up Storage (Optional for Photo Uploads)
1. Go to "Storage" in the Supabase dashboard
2. Create a new bucket called `civic-track-photos`
3. Set it to "Public" if you want photos to be publicly accessible

## Testing the Authentication System

### With Authentication Enabled:
1. Visit http://localhost:5174/ in your browser
2. Click "Sign Up" in the header to create an account
3. Choose "Citizen" role for regular users or "Admin" for administrators
4. Verify your email (check spam folder)
5. Sign in and test features:
   - **Citizens**: Can report issues, add comments, flag inappropriate content
   - **Admins**: Can also update issue status, view all flags, moderate content

### User Roles & Permissions:
- **Citizen Role**: 
  - Report civic issues
  - Add comments on issues
  - Flag inappropriate content
  - View issues within their area (3-5km radius)
  
- **Admin Role**:
  - All citizen permissions plus:
  - Update issue status (reported → in_progress → resolved/rejected)
  - View and manage flagged content
  - Hide/unhide inappropriate issues
  - Access to admin dashboard features

### Creating Test Accounts:
1. **Regular Citizen**: Use any email, choose "Citizen" role
2. **Administrator**: Use admin email, choose "Administrator" role
3. Test both accounts to see different permission levels

## Troubleshooting

### If you see console warnings about the anon key:
- Make sure your `.env` file is in the root directory
- Restart the development server after adding the anon key

### If database operations fail:
- Check your Supabase project is active
- Verify the anon key is correct in `.env`
- Check the browser console for specific error messages
- Verify RLS policies allow your operations

### Common Issues:
1. **"Failed to fetch issues"** - Check your Supabase URL and anon key
2. **"Row Level Security policy violation"** - Run `database/disable-rls-dev.sql` to fix this
3. **"new row violates row-level security policy"** - This means RLS is still enabled, run the disable-rls-dev.sql script
4. **Empty issues list** - Sample data should be inserted by the schema, or try reporting a new issue
5. **"Failed to create issue"** - Usually an RLS issue, disable RLS for development using the provided script

## Next Steps

Once the database is working:
1. The app will use real database persistence instead of mock data
2. All CRUD operations (Create, Read, Update, Delete) will work with Supabase
3. You can view and manage data through the Supabase dashboard
4. Ready for deployment when you're ready to go live!
