import { supabase } from './supabase.js';
import { USER_ROLES } from '../constants';

export const authService = {
    // Sign up new user
    async signUp(email, password, userData = {}) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: userData.name || 'User',
                        role: userData.role || USER_ROLES.CITIZEN
                    }
                }
            });

            if (error) throw error;

            // Create user profile in our users table
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('users')
                    .insert([{
                        id: data.user.id,
                        email: data.user.email,
                        name: userData.name || 'User',
                        role: userData.role || USER_ROLES.CITIZEN,
                        is_anonymous: false
                    }]);

                if (profileError) {
                    console.warn('Failed to create user profile:', profileError);
                }
            }

            return { user: data.user, session: data.session };
        } catch (error) {
            throw new Error(`Sign up failed: ${error.message}`);
        }
    },

    // Sign in user
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Get user profile from our users table
            if (data.user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                return {
                    user: data.user,
                    session: data.session,
                    profile: profile || { role: USER_ROLES.CITIZEN }
                };
            }

            return { user: data.user, session: data.session };
        } catch (error) {
            throw new Error(`Sign in failed: ${error.message}`);
        }
    },

    // Sign out user
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            throw new Error(`Sign out failed: ${error.message}`);
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Get user profile
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                return {
                    user,
                    profile: profile || { role: USER_ROLES.CITIZEN }
                };
            }

            return { user: null, profile: null };
        } catch (error) {
            console.warn('Failed to get current user:', error);
            return { user: null, profile: null };
        }
    },

    // Update user profile
    async updateProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            throw new Error(`Profile update failed: ${error.message}`);
        }
    },

    // Check if user has admin role
    isAdmin(userProfile) {
        return userProfile ? userProfile.role === USER_ROLES.ADMIN : false;
    },

    // Check if user has citizen role
    isCitizen(userProfile) {
        return userProfile ? userProfile.role === USER_ROLES.CITIZEN : false;
    },

    // Listen to auth state changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};