import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    Users,
    Flag,
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Ban,
    RefreshCw,
    TrendingUp,
    FileText,
    MapPin,
    X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { databaseService } from '../services/databaseService';
import { USER_ROLES } from '../constants';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { state, actions } = useApp();
    const { user } = state;

    // Debug logging
    console.log('AdminDashboard render - User state:', user);
    console.log('AdminDashboard render - User role:', user.role);
    console.log('AdminDashboard render - USER_ROLES.ADMIN:', USER_ROLES.ADMIN);

    const [analytics, setAnalytics] = useState({
        totalIssues: 0,
        resolvedIssues: 0,
        pendingIssues: 0,
        flaggedIssues: 0,
        totalUsers: 0,
        categoryBreakdown: {},
        recentActivity: []
    });

    const [flaggedIssues, setFlaggedIssues] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [categoryIssues, setCategoryIssues] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (user.role === USER_ROLES.ADMIN) {
            loadDashboardData();
        }
    }, [user.role]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load analytics
            const analyticsData = await databaseService.getAdminAnalytics();
            setAnalytics(analyticsData);

            // Load flagged issues
            const flagged = await databaseService.getFlaggedIssues();
            setFlaggedIssues(flagged);

            // Load all users
            const users = await databaseService.getAllUsers();
            setAllUsers(users);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            actions.addNotification({
                id: Date.now().toString(),
                type: 'error',
                title: 'Error',
                message: 'Failed to load dashboard data',
                timestamp: new Date().toISOString()
            });
        } finally {
            setLoading(false);
        }
    };

    const loadCategoryIssues = async (category) => {
        try {
            setSelectedCategory(category);
            const issues = await databaseService.getIssuesByCategory(category);
            setCategoryIssues(issues);
        } catch (error) {
            console.error('Failed to load category issues:', error);
            actions.addNotification({
                id: Date.now().toString(),
                type: 'error',
                title: 'Error',
                message: 'Failed to load category issues',
                timestamp: new Date().toISOString()
            });
        }
    };

    const handleIssueAction = async (issueId, action, note = '') => {
        try {
            if (action === 'hide') {
                await databaseService.hideIssue(issueId);
                actions.addNotification({
                    id: Date.now().toString(),
                    type: 'success',
                    title: 'Issue Hidden',
                    message: 'Issue has been hidden from public view',
                    timestamp: new Date().toISOString()
                });
            } else if (action === 'unhide') {
                await databaseService.unhideIssue(issueId);
                actions.addNotification({
                    id: Date.now().toString(),
                    type: 'success',
                    title: 'Issue Unhidden',
                    message: 'Issue is now visible to the public',
                    timestamp: new Date().toISOString()
                });
            } else if (action === 'resolve') {
                await actions.updateIssueStatus(issueId, 'resolved', note);
            } else if (action === 'reject') {
                await actions.updateIssueStatus(issueId, 'rejected', note);
            } else if (action === 'updateStatus') {
                await actions.updateIssueStatus(issueId, note, 'Status updated by admin');
            } else if (action === 'flag') {
                await actions.flagIssue(issueId, note);
                actions.addNotification({
                    id: Date.now().toString(),
                    type: 'success',
                    title: 'Issue Flagged',
                    message: 'Issue has been flagged and moved to flagged section',
                    timestamp: new Date().toISOString()
                });
            }

            // Reload data
            loadDashboardData();
            if (selectedCategory) {
                loadCategoryIssues(selectedCategory);
            }
        } catch (actionError) {
            console.error('Action failed:', actionError);
            actions.addNotification({
                id: Date.now().toString(),
                type: 'error',
                title: 'Error',
                message: 'Failed to perform action',
                timestamp: new Date().toISOString()
            });
        }
    };

    const handleBanUser = async (userId, reason) => {
        try {
            await databaseService.banUser(userId, reason);
            actions.addNotification({
                id: Date.now().toString(),
                type: 'success',
                title: 'User Banned',
                message: 'User has been banned successfully',
                timestamp: new Date().toISOString()
            });
            loadDashboardData();
        } catch (banError) {
            console.error('Failed to ban user:', banError);
            actions.addNotification({
                id: Date.now().toString(),
                type: 'error',
                title: 'Error',
                message: 'Failed to ban user',
                timestamp: new Date().toISOString()
            });
        }
    };

    if (user.role !== USER_ROLES.ADMIN) {
        return (
            <div className="admin-dashboard">
                <div className="access-denied">
                    <AlertTriangle size={48} />
                    <h2>Access Denied</h2>
                    <p>You need administrator privileges to access this page.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-container">
                    <RefreshCw className="loading-spinner" size={32} />
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Admin Dashboard</h1>
                    <p>Manage issues, users, and view analytics</p>
                </div>
                <button
                    className="refresh-button"
                    onClick={loadDashboardData}
                    disabled={loading}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <BarChart3 size={16} />
                    Overview
                </button>
                <button
                    className={`tab-button ${activeTab === 'category-issues' ? 'active' : ''}`}
                    onClick={() => setActiveTab('category-issues')}
                >
                    <FileText size={16} />
                    Category Issues
                </button>
                <button
                    className={`tab-button ${activeTab === 'flagged' ? 'active' : ''}`}
                    onClick={() => setActiveTab('flagged')}
                >
                    <Flag size={16} />
                    Flagged Issues ({flaggedIssues.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={16} />
                    User Management
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        {/* Analytics Cards */}
                        <div className="analytics-grid">
                            <div className="analytics-card">
                                <div className="card-icon total">
                                    <FileText size={24} />
                                </div>
                                <div className="card-content">
                                    <h3>Total Issues</h3>
                                    <p className="card-number">{analytics.totalIssues}</p>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-icon resolved">
                                    <CheckCircle size={24} />
                                </div>
                                <div className="card-content">
                                    <h3>Resolved</h3>
                                    <p className="card-number">{analytics.resolvedIssues}</p>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-icon pending">
                                    <Clock size={24} />
                                </div>
                                <div className="card-content">
                                    <h3>Pending</h3>
                                    <p className="card-number">{analytics.pendingIssues}</p>
                                </div>
                            </div>

                            <div className="analytics-card">
                                <div className="card-icon flagged">
                                    <Flag size={24} />
                                </div>
                                <div className="card-content">
                                    <h3>Flagged</h3>
                                    <p className="card-number">{analytics.flaggedIssues}</p>
                                </div>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="category-breakdown">
                            <h3>Issues by Category</h3>
                            <div className="category-list">
                                {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
                                    <div key={category} className="category-item">
                                        <span className="category-name">{category}</span>
                                        <span className="category-count">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="recent-activity">
                            <h3>Recent Issues</h3>
                            <div className="activity-list">
                                {analytics.recentActivity.length > 0 ? (
                                    analytics.recentActivity.map((issue, index) => (
                                        <div key={issue.id || index} className="activity-item">
                                            <div className="activity-icon">
                                                <FileText size={16} />
                                            </div>
                                            <div className="activity-content">
                                                <p><strong>{issue.title}</strong> - {issue.category}</p>
                                                <p>Reported by: {issue.users?.name || issue.reporter_name || 'Anonymous'}</p>
                                                <span className="activity-time">{new Date(issue.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No recent issues found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'category-issues' && (
                    <div className="category-issues-tab">
                        <h3>Issues by Category</h3>
                        <div className="category-selector">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    const category = e.target.value;
                                    if (category) {
                                        loadCategoryIssues(category);
                                    } else {
                                        setCategoryIssues([]);
                                        setSelectedCategory('');
                                    }
                                }}
                            >
                                <option value="">Select a category</option>
                                <option value="roads">Roads</option>
                                <option value="lighting">Lighting</option>
                                <option value="water_supply">Water Supply</option>
                                <option value="cleanliness">Cleanliness</option>
                                <option value="public_safety">Public Safety</option>
                                <option value="obstructions">Obstructions</option>
                            </select>
                        </div>

                        {selectedCategory && (
                            <div className="category-issues-list">
                                {categoryIssues.length === 0 ? (
                                    <div className="empty-state">
                                        <FileText size={48} />
                                        <p>No issues found for {selectedCategory}</p>
                                    </div>
                                ) : (
                                    categoryIssues.map((issue) => (
                                        <div key={issue.id} className="category-issue-card">
                                            <div className="issue-header">
                                                <h4>{issue.title}</h4>
                                                <span className={`status-badge ${issue.status}`}>
                                                    {issue.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="issue-description">{issue.description}</p>
                                            <div className="issue-meta">
                                                <div className="meta-item">
                                                    <strong>Reporter:</strong> {issue.users?.name || issue.reporter_name || 'Anonymous'}
                                                </div>
                                                <div className="meta-item">
                                                    <strong>Email:</strong> {issue.users?.email || 'N/A'}
                                                </div>
                                                <div className="meta-item">
                                                    <strong>Reported:</strong> {new Date(issue.created_at).toLocaleString()}
                                                </div>
                                                <div className="meta-item">
                                                    <strong>Location:</strong> {issue.address || `${issue.latitude}, ${issue.longitude}`}
                                                </div>
                                            </div>
                                            <div className="issue-actions">
                                                <select
                                                    value={issue.status}
                                                    onChange={(e) => handleIssueAction(issue.id, 'updateStatus', e.target.value)}
                                                    className="status-select"
                                                >
                                                    <option value="reported">Reported</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="resolved">Resolved</option>
                                                    <option value="rejected">Rejected</option>
                                                </select>
                                                <button
                                                    className="action-button flag"
                                                    onClick={() => handleIssueAction(issue.id, 'flag', 'spam')}
                                                >
                                                    <Flag size={16} />
                                                    Flag as Spam
                                                </button>
                                                <button
                                                    className="action-button hide"
                                                    onClick={() => handleIssueAction(issue.id, 'hide')}
                                                >
                                                    <AlertTriangle size={16} />
                                                    Hide
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'flagged' && (
                    <div className="flagged-tab">
                        <h3>Flagged Issues</h3>
                        {flaggedIssues.length === 0 ? (
                            <div className="empty-state">
                                <Flag size={48} />
                                <p>No flagged issues found</p>
                            </div>
                        ) : (
                            <div className="flagged-issues-list">
                                {flaggedIssues.map((issue) => (
                                    <div key={issue.id} className="flagged-issue-card">
                                        <div className="issue-header">
                                            <h4>{issue.title}</h4>
                                            <span className="flag-count">{issue.flag_count} flags</span>
                                        </div>
                                        <p className="issue-description">{issue.description}</p>
                                        <div className="issue-meta">
                                            <span className="category">{issue.category}</span>
                                            <span className="reporter">{issue.reporter_name}</span>
                                            <span className="date">{new Date(issue.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="issue-actions">
                                            <button
                                                className="action-button view"
                                                onClick={() => actions.setSelectedIssue(issue.id)}
                                            >
                                                <Eye size={16} />
                                                View Details
                                            </button>
                                            {issue.is_hidden ? (
                                                <button
                                                    className="action-button unhide"
                                                    onClick={() => handleIssueAction(issue.id, 'unhide')}
                                                >
                                                    <Eye size={16} />
                                                    Unhide
                                                </button>
                                            ) : (
                                                <button
                                                    className="action-button hide"
                                                    onClick={() => handleIssueAction(issue.id, 'hide')}
                                                >
                                                    <AlertTriangle size={16} />
                                                    Hide
                                                </button>
                                            )}
                                            <button
                                                className="action-button resolve"
                                                onClick={() => handleIssueAction(issue.id, 'resolve')}
                                            >
                                                <CheckCircle size={16} />
                                                Resolve
                                            </button>
                                            <button
                                                className="action-button reject"
                                                onClick={() => handleIssueAction(issue.id, 'reject')}
                                            >
                                                <X size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="users-tab">
                        <h3>User Management</h3>
                        <div className="users-list">
                            {allUsers.map((userItem) => (
                                <div key={userItem.id} className="user-card">
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            <Users size={20} />
                                        </div>
                                        <div className="user-details">
                                            <h4>{userItem.name || 'Anonymous'}</h4>
                                            <p>{userItem.email}</p>
                                            <span className={`role-badge ${userItem.role}`}>
                                                {userItem.role}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="user-stats">
                                        <div className="stat">
                                            <span className="stat-label">Issues Reported</span>
                                            <span className="stat-value">{userItem.issues_count || 0}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Join Date</span>
                                            <span className="stat-value">
                                                {new Date(userItem.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="user-actions">
                                        {userItem.role !== USER_ROLES.ADMIN && (
                                            <button
                                                className="ban-button"
                                                onClick={() => handleBanUser(userItem.id, 'Violation of community guidelines')}
                                            >
                                                <Ban size={16} />
                                                Ban User
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
