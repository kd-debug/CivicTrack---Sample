import { supabase } from './supabase.js';

// Error handling helper
const handleSupabaseError = (error, operation) => {
    console.error(`Supabase ${operation} error:`, error);
    throw new Error(`Failed to ${operation}: ${error.message}`);
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

export const databaseService = {
    // Get all issues with optional filtering
    async getIssues(filters = {}) {
        try {
            let query = supabase
                .from('civic_issues')
                .select(`
          *,
          issue_comments(count),
          issue_status_history(*)
        `)
                .eq('is_hidden', false)
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters.category && filters.category !== 'all') {
                query = query.eq('category', filters.category);
            }

            if (filters.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }

            const { data, error } = await query;

            if (error) {
                handleSupabaseError(error, 'fetch issues');
            }

            // Filter by distance if user location is available
            let filteredData = data;
            if (filters.userLocation && filters.distance) {
                const maxDistance = parseFloat(filters.distance);
                filteredData = data.filter(issue => {
                    if (!issue.latitude || !issue.longitude) return false;
                    const distance = calculateDistance(
                        filters.userLocation.latitude,
                        filters.userLocation.longitude,
                        parseFloat(issue.latitude),
                        parseFloat(issue.longitude)
                    );
                    return distance <= maxDistance;
                });
            }

            return filteredData;
        } catch (error) {
            handleSupabaseError(error, 'get issues');
        }
    },

    // Get a single issue by ID
    async getIssueById(id) {
        try {
            const { data, error } = await supabase
                .from('civic_issues')
                .select(`
          *,
          issue_comments(*),
          issue_status_history(*)
        `)
                .eq('id', id)
                .single();

            if (error) {
                handleSupabaseError(error, 'fetch issue');
            }

            return data;
        } catch (error) {
            handleSupabaseError(error, 'get issue by ID');
        }
    },

    // Create a new issue
    async createIssue(issueData) {
        try {
            // Handle photo uploads first if there are files
            let photoUrls = [];
            if (issueData.photoFiles && issueData.photoFiles.length > 0) {
                // Create a temporary issue ID for photo naming
                const tempId = (typeof crypto !== 'undefined' && crypto.randomUUID) ?
                    crypto.randomUUID() :
                    `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                console.log('Uploading photos...', issueData.photoFiles.length);

                // Upload each photo file
                for (let i = 0; i < issueData.photoFiles.length; i++) {
                    const file = issueData.photoFiles[i];
                    try {
                        console.log('Uploading file:', file.name, file.size, 'bytes');
                        const photoUrl = await this.uploadPhoto(file, tempId);
                        photoUrls.push(photoUrl);
                        console.log('Uploaded photo:', photoUrl);
                    } catch (uploadError) {
                        console.warn('Failed to upload photo to storage:', uploadError);

                        // Fallback to base64 if storage upload fails
                        if (issueData.photos && issueData.photos[i]) {
                            console.log('Using base64 fallback for photo', i + 1);
                            photoUrls.push(issueData.photos[i]);
                        }
                    }
                }

                console.log('Total photos processed:', photoUrls.length);
            }

            // If no file uploads but we have base64 data, use it as fallback
            if (photoUrls.length === 0 && issueData.photos && issueData.photos.length > 0) {
                photoUrls = issueData.photos;
            }

            // Insert the issue
            const issueToInsert = {
                title: issueData.title,
                description: issueData.description,
                category: issueData.category,
                latitude: issueData.location ? issueData.location.latitude : null,
                longitude: issueData.location ? issueData.location.longitude : null,
                address: issueData.address,
                photos: photoUrls,
                reporter_name: issueData.reporterName || 'Anonymous',
                reporter_id: issueData.reporter_id || null,
                is_anonymous: issueData.isAnonymous || false,
                status: 'reported'
            };

            console.log('Inserting issue with data:', {
                ...issueToInsert,
                photos: photoUrls.length > 0 ? `${photoUrls.length} photos` : 'no photos'
            });

            const { data: issue, error: issueError } = await supabase
                .from('civic_issues')
                .insert([issueToInsert])
                .select()
                .single();

            if (issueError) {
                handleSupabaseError(issueError, 'create issue');
            }

            // Create initial status history entry
            const { error: historyError } = await supabase
                .from('issue_status_history')
                .insert([{
                    issue_id: issue.id,
                    status: 'reported',
                    note: 'Issue reported by citizen'
                }]);

            if (historyError) {
                console.warn('Failed to create status history:', historyError);
            }

            console.log('Issue created successfully:', issue);
            return issue;
        } catch (error) {
            handleSupabaseError(error, 'create issue');
        }
    },

    // Update issue status (admin only)
    async updateIssueStatus(issueId, newStatus, note = '') {
        try {
            // Update the issue status
            const { data: issue, error: updateError } = await supabase
                .from('civic_issues')
                .update({ status: newStatus })
                .eq('id', issueId)
                .select()
                .single();

            if (updateError) {
                handleSupabaseError(updateError, 'update issue status');
            }

            // Add status history entry
            const { error: historyError } = await supabase
                .from('issue_status_history')
                .insert([{
                    issue_id: issueId,
                    status: newStatus,
                    note: note || `Status changed to ${newStatus}`
                }]);

            if (historyError) {
                console.warn('Failed to create status history:', historyError);
            }

            return issue;
        } catch (error) {
            handleSupabaseError(error, 'update issue status');
        }
    },

    // Add comment to issue
    async addComment(issueId, comment) {
        try {
            const { data, error } = await supabase
                .from('issue_comments')
                .insert([{
                    issue_id: issueId,
                    author_name: comment.authorName || 'Anonymous',
                    content: comment.content
                }])
                .select()
                .single();

            if (error) {
                handleSupabaseError(error, 'add comment');
            }

            return data;
        } catch (error) {
            handleSupabaseError(error, 'add comment');
        }
    },

    // Flag an issue
    async flagIssue(issueId, reason) {
        try {
            // Check if user already flagged this issue (would need user authentication)
            const { data, error } = await supabase
                .from('issue_flags')
                .insert([{
                    issue_id: issueId,
                    reason: reason
                }])
                .select()
                .single();

            if (error) {
                handleSupabaseError(error, 'flag issue');
            }

            // Get updated issue with new flag count
            const updatedIssue = await this.getIssueById(issueId);
            return updatedIssue;
        } catch (error) {
            handleSupabaseError(error, 'flag issue');
        }
    },

    // Hide/unhide issue (admin only)
    async toggleIssueVisibility(issueId, isHidden) {
        try {
            const { data, error } = await supabase
                .from('civic_issues')
                .update({ is_hidden: isHidden })
                .eq('id', issueId)
                .select()
                .single();

            if (error) {
                handleSupabaseError(error, 'toggle issue visibility');
            }

            return data;
        } catch (error) {
            handleSupabaseError(error, 'toggle issue visibility');
        }
    },

    // Get statistics (for admin dashboard)
    async getStatistics() {
        try {
            const [
                { count: totalIssues },
                { count: reportedIssues },
                { count: inProgressIssues },
                { count: resolvedIssues },
                { count: flaggedIssues }
            ] = await Promise.all([
                supabase.from('civic_issues').select('*', { count: 'exact', head: true }),
                supabase.from('civic_issues').select('*', { count: 'exact', head: true }).eq('status', 'reported'),
                supabase.from('civic_issues').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
                supabase.from('civic_issues').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
                supabase.from('civic_issues').select('*', { count: 'exact', head: true }).gt('flag_count', 0)
            ]);

            return {
                totalIssues,
                reportedIssues,
                inProgressIssues,
                resolvedIssues,
                flaggedIssues
            };
        } catch (error) {
            handleSupabaseError(error, 'get statistics');
        }
    },

    // Upload photo to Supabase Storage
    async uploadPhoto(file, issueId) {
        try {
            console.log('Starting photo upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);

            // Validate file
            if (!file || !file.name) {
                throw new Error('Invalid file object');
            }

            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image');
            }

            // Check file size (5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error('File size must be less than 5MB');
            }

            // Ensure bucket exists
            await this.ensureBucketExists();

            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `${issueId}_${Date.now()}.${fileExt}`;
            const filePath = `issue-photos/${fileName}`;

            console.log('Uploading file to storage:', filePath);

            const { data, error } = await supabase.storage
                .from('civic-track-photos')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Storage upload error:', error);

                // Provide more specific error messages
                if (error.message.includes('row-level security')) {
                    throw new Error('Storage permission denied. Please check storage policies in Supabase dashboard.');
                } else if (error.message.includes('duplicate')) {
                    throw new Error('File already exists. Please try again.');
                } else {
                    throw new Error(`Storage upload failed: ${error.message}`);
                }
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('civic-track-photos')
                .getPublicUrl(filePath);

            console.log('Photo uploaded successfully:', publicUrl);
            return publicUrl;
        } catch (error) {
            console.error('Photo upload failed:', error);
            throw error; // Re-throw to allow fallback handling
        }
    },

    // Ensure the storage bucket exists
    async ensureBucketExists() {
        try {
            // Try to list buckets to see if ours exists
            const { data: buckets, error } = await supabase.storage.listBuckets();

            if (error) {
                console.warn('Could not list buckets:', error);
                return;
            }

            const bucketExists = buckets.some(bucket => bucket.name === 'civic-track-photos');

            if (!bucketExists) {
                console.log('Creating storage bucket...');
                const { data, error: createError } = await supabase.storage.createBucket('civic-track-photos', {
                    public: true,
                    allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'],
                    fileSizeLimit: 5242880 // 5MB
                });

                if (createError) {
                    console.warn('Could not create bucket (may not have permissions):', createError);
                } else {
                    console.log('Storage bucket created successfully');

                    // Try to create storage policies for public uploads
                    try {
                        // Note: These policies need to be created via SQL in Supabase dashboard
                        console.log('Bucket created. Storage policies need to be set up in Supabase dashboard.');
                    } catch (policyError) {
                        console.warn('Could not create storage policies:', policyError);
                    }
                }
            }
        } catch (error) {
            console.warn('Error ensuring bucket exists:', error);
        }
    },

    // Get recent activity (for notifications)
    async getRecentActivity(limit = 10) {
        try {
            const { data, error } = await supabase
                .from('issue_status_history')
                .select(`
          *,
          civic_issues(title, category)
        `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                handleSupabaseError(error, 'get recent activity');
            }

            return data;
        } catch (error) {
            handleSupabaseError(error, 'get recent activity');
        }
    },

    // Get issues reported by a specific user
    async getUserReports(userId) {
        try {
            console.log('Fetching reports for user:', userId);

            if (!userId) {
                throw new Error('User ID is required');
            }

            const { data, error } = await supabase
                .from('civic_issues')
                .select(`
                    *
                `)
                .eq('reporter_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Database error in getUserReports:', error);
                handleSupabaseError(error, 'fetch user reports');
            }

            console.log(`Found ${data?.length || 0} reports for user ${userId}`);
            return data || [];
        } catch (error) {
            console.error('Error in getUserReports:', error);
            handleSupabaseError(error, 'get user reports');
        }
    },

    // Get user profile with report statistics
    async getUserProfile(userId) {
        try {
            console.log('Fetching user profile for:', userId);

            if (!userId) {
                throw new Error('User ID is required');
            }

            // First, try to get user profile
            let { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) {
                console.warn('User profile not found in users table, creating basic profile:', profileError);
                // If user doesn't exist in users table, create a basic profile
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser && authUser.id === userId) {
                    const basicProfile = {
                        id: authUser.id,
                        email: authUser.email,
                        name: authUser.user_metadata ? authUser.user_metadata.name || authUser.email.split('@')[0] || 'User' : 'User',
                        role: 'citizen',
                        created_at: authUser.created_at
                    };

                    // Try to insert the profile
                    const { error: insertError } = await supabase
                        .from('users')
                        .insert([basicProfile]);

                    if (insertError) {
                        console.warn('Could not create user profile:', insertError);
                    }

                    // Use the basic profile for now
                    profile = basicProfile;
                } else {
                    throw new Error('User profile not found and cannot create one');
                }
            }

            // Get report statistics with better error handling
            let reportStats = {
                totalReports: 0,
                reportedCount: 0,
                inProgressCount: 0,
                resolvedCount: 0
            };

            try {
                const [
                    { count: totalReports },
                    { count: reportedCount },
                    { count: inProgressCount },
                    { count: resolvedCount }
                ] = await Promise.all([
                    supabase.from('civic_issues').select('*', { count: 'exact', head: true }).eq('reporter_id', userId),
                    supabase.from('civic_issues').select('*', { count: 'exact', head: true }).eq('reporter_id', userId).eq('status', 'reported'),
                    supabase.from('civic_issues').select('*', { count: 'exact', head: true }).eq('reporter_id', userId).eq('status', 'in_progress'),
                    supabase.from('civic_issues').select('*', { count: 'exact', head: true }).eq('reporter_id', userId).eq('status', 'resolved')
                ]);

                reportStats = {
                    totalReports: totalReports || 0,
                    reportedCount: reportedCount || 0,
                    inProgressCount: inProgressCount || 0,
                    resolvedCount: resolvedCount || 0
                };
            } catch (statsError) {
                console.warn('Could not fetch report statistics:', statsError);
            }

            const result = {
                ...profile,
                reportStats
            };

            console.log('User profile result:', result);
            return result;
        } catch (error) {
            console.error('Error in getUserProfile:', error);
            handleSupabaseError(error, 'get user profile');
        }
    },

    // Get similar issues based on category and location
    async getSimilarIssues(category, location, excludeIssueId = null, radiusKm = 2) {
        try {
            let query = supabase
                .from('civic_issues')
                .select('*')
                .eq('category', category)
                .eq('is_hidden', false);

            if (excludeIssueId) {
                query = query.neq('id', excludeIssueId);
            }

            const { data, error } = await query;

            if (error) {
                handleSupabaseError(error, 'fetch similar issues');
            }

            // Filter by location if provided
            if (location && location.latitude && location.longitude) {
                const filteredData = data.filter(issue => {
                    if (!issue.latitude || !issue.longitude) return false;
                    const distance = calculateDistance(
                        location.latitude,
                        location.longitude,
                        parseFloat(issue.latitude),
                        parseFloat(issue.longitude)
                    );
                    return distance <= radiusKm;
                });
                return filteredData;
            }

            return data;
        } catch (error) {
            handleSupabaseError(error, 'get similar issues');
        }
    },

    // Update user profile
    async updateUserProfile(userId, updateData) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                handleSupabaseError(error, 'update user profile');
            }

            return data;
        } catch (error) {
            handleSupabaseError(error, 'update user profile');
        }
    },

    // Admin-specific methods
    async getAdminAnalytics() {
        try {
            // Get total issues count
            const { count: totalIssues } = await supabase
                .from('civic_issues')
                .select('*', { count: 'exact', head: true });

            // Get resolved issues count
            const { count: resolvedIssues } = await supabase
                .from('civic_issues')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'resolved');

            // Get pending issues count
            const { count: pendingIssues } = await supabase
                .from('civic_issues')
                .select('*', { count: 'exact', head: true })
                .in('status', ['reported', 'in_progress']);

            // Get flagged issues count
            const { count: flaggedIssues } = await supabase
                .from('civic_issues')
                .select('*', { count: 'exact', head: true })
                .gt('flag_count', 0);

            // Get total users count
            const { count: totalUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            // Get category breakdown
            const { data: categoryData } = await supabase
                .from('civic_issues')
                .select('category');

            const categoryBreakdown = {};
            categoryData?.forEach(issue => {
                categoryBreakdown[issue.category] = (categoryBreakdown[issue.category] || 0) + 1;
            });

            // Get recent activity (last 5 issues)
            const recentActivity = await this.getRecentIssues(5);

            return {
                totalIssues: totalIssues || 0,
                resolvedIssues: resolvedIssues || 0,
                pendingIssues: pendingIssues || 0,
                flaggedIssues: flaggedIssues || 0,
                totalUsers: totalUsers || 0,
                categoryBreakdown,
                recentActivity
            };
        } catch (error) {
            handleSupabaseError(error, 'get admin analytics');
        }
    },

    async getFlaggedIssues() {
        try {
            const { data, error } = await supabase
                .from('civic_issues')
                .select(`
                    *,
                    issue_comments(count),
                    issue_status_history(*)
                `)
                .gt('flag_count', 0)
                .order('flag_count', { ascending: false });

            if (error) {
                handleSupabaseError(error, 'fetch flagged issues');
            }

            return data || [];
        } catch (error) {
            handleSupabaseError(error, 'get flagged issues');
        }
    },

    async getAllUsers() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                handleSupabaseError(error, 'fetch all users');
            }

            // Get issue counts for each user
            const usersWithCounts = await Promise.all(
                (data || []).map(async (user) => {
                    const { count: issuesCount } = await supabase
                        .from('civic_issues')
                        .select('*', { count: 'exact', head: true })
                        .eq('reporter_id', user.id);

                    return {
                        ...user,
                        issues_count: issuesCount || 0
                    };
                })
            );

            return usersWithCounts;
        } catch (error) {
            handleSupabaseError(error, 'get all users');
        }
    },

    async hideIssue(issueId) {
        try {
            const { error } = await supabase
                .from('civic_issues')
                .update({ is_hidden: true })
                .eq('id', issueId);

            if (error) {
                handleSupabaseError(error, 'hide issue');
            }

            return true;
        } catch (error) {
            handleSupabaseError(error, 'hide issue');
        }
    },

    async unhideIssue(issueId) {
        try {
            const { error } = await supabase
                .from('civic_issues')
                .update({ is_hidden: false })
                .eq('id', issueId);

            if (error) {
                handleSupabaseError(error, 'unhide issue');
            }

            return true;
        } catch (error) {
            handleSupabaseError(error, 'unhide issue');
        }
    },

    async banUser(userId, reason) {
        try {
            // Add a banned field to users table or create a separate bans table
            // For now, we'll update the user's role to indicate they're banned
            const { error } = await supabase
                .from('users')
                .update({
                    role: 'banned',
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                handleSupabaseError(error, 'ban user');
            }

            return true;
        } catch (error) {
            handleSupabaseError(error, 'ban user');
        }
    },

    async getIssuesByCategory(category) {
        try {
            const { data, error } = await supabase
                .from('civic_issues')
                .select(`
                    *,
                    users!reporter_id(name, email)
                `)
                .eq('category', category)
                .order('created_at', { ascending: false });

            if (error) {
                handleSupabaseError(error, 'fetch issues by category');
            }

            return data || [];
        } catch (error) {
            handleSupabaseError(error, 'get issues by category');
        }
    },

    async getRecentIssues(limit = 5) {
        try {
            const { data, error } = await supabase
                .from('civic_issues')
                .select(`
                    *,
                    users!reporter_id(name, email)
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                handleSupabaseError(error, 'fetch recent issues');
            }

            return data || [];
        } catch (error) {
            handleSupabaseError(error, 'get recent issues');
        }
    }
};

// Initialize sample data if database is empty
export const initializeSampleData = async () => {
    try {
        const { count } = await supabase
            .from('civic_issues')
            .select('*', { count: 'exact', head: true });

        if (count === 0) {
            console.log('Database is empty, sample data should be added via SQL schema');
        }
    } catch (error) {
        console.warn('Could not check for sample data:', error);
    }
};