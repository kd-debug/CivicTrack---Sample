import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, BarChart3, Edit3, Save, X, Camera, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { databaseService } from '../services/databaseService';
import './UserProfile.css';

const UserProfile = () => {
    const { state, actions } = useApp();
    const { user } = state;
    const [isEditing, setIsEditing] = useState(false);
    const [userStats, setUserStats] = useState(null);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user.isAuthenticated && user.id) {
            fetchUserProfile();
            fetchUserStats();
        }
    }, [user.id, user.isAuthenticated]);

    const fetchUserProfile = async () => {
        try {
            const profile = await databaseService.getUserProfile(user.id);
            setProfileData({
                name: profile.name || '',
                email: profile.email || '',
                phone: profile.phone || '',
                address: profile.address || ''
            });
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        }
    };

    const fetchUserStats = async () => {
        try {
            const profile = await databaseService.getUserProfile(user.id);
            setUserStats(profile.reportStats);
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await databaseService.updateUserProfile(user.id, profileData);
            setIsEditing(false);
            actions.addNotification({
                id: Date.now().toString(),
                type: 'success',
                title: 'Profile Updated',
                message: 'Your profile has been updated successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to update profile:', error);
            actions.addNotification({
                id: Date.now().toString(),
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to update profile. Please try again.',
                timestamp: new Date().toISOString()
            });
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        fetchUserProfile(); // Reset to original data
    };

    if (!user.isAuthenticated) {
        return (
            <div className="profile-not-authenticated">
                <User size={64} />
                <h3>Please sign in to view your profile</h3>
                <p>Access your profile, track your reports, and manage your account</p>
            </div>
        );
    }

    return (
        <div className="user-profile">
            <div className="profile-container">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            <User size={48} />
                        </div>
                        <button className="avatar-edit-btn">
                            <Camera size={16} />
                        </button>
                    </div>
                    
                    <div className="profile-header-info">
                        <h2>{profileData.name || 'User'}</h2>
                        <p className="profile-role">
                            <Shield size={16} />
                            {user.role === 'admin' ? 'Administrator' : 'Citizen'}
                        </p>
                        <p className="profile-joined">
                            <Calendar size={16} />
                            Member since {new Date().getFullYear()}
                        </p>
                    </div>

                    <div className="profile-actions">
                        {!isEditing ? (
                            <button 
                                className="btn-primary"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit3 size={16} />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button 
                                    className="btn-success"
                                    onClick={handleSave}
                                    disabled={loading}
                                >
                                    <Save size={16} />
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button 
                                    className="btn-secondary"
                                    onClick={handleCancel}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Content */}
                <div className="profile-content">
                    {/* Personal Information */}
                    <div className="profile-section">
                        <h3>Personal Information</h3>
                        <div className="profile-fields">
                            <div className="field-group">
                                <label>
                                    <User size={18} />
                                    Full Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                ) : (
                                    <span>{profileData.name || 'Not provided'}</span>
                                )}
                            </div>

                            <div className="field-group">
                                <label>
                                    <Mail size={18} />
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter your email"
                                    />
                                ) : (
                                    <span>{profileData.email || 'Not provided'}</span>
                                )}
                            </div>

                            <div className="field-group">
                                <label>
                                    <MapPin size={18} />
                                    Address
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={profileData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Enter your address"
                                        rows={2}
                                    />
                                ) : (
                                    <span>{profileData.address || 'Not provided'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Activity Statistics */}
                    <div className="profile-section">
                        <h3>
                            <BarChart3 size={20} />
                            Activity Statistics
                        </h3>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-number">{userStats?.totalReports || 0}</div>
                                <div className="stat-label">Total Reports</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{userStats?.reportedCount || 0}</div>
                                <div className="stat-label">Reported</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{userStats?.inProgressCount || 0}</div>
                                <div className="stat-label">In Progress</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{userStats?.resolvedCount || 0}</div>
                                <div className="stat-label">Resolved</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="profile-section">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions">
                            <button 
                                className="action-btn"
                                onClick={() => actions.setCurrentPage('home')}
                            >
                                <MapPin size={18} />
                                Report New Issue
                            </button>
                            <button 
                                className="action-btn"
                                onClick={() => actions.setCurrentPage('my-reports')}
                            >
                                <BarChart3 size={18} />
                                View My Reports
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
