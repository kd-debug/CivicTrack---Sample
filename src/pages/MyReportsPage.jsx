import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { databaseService } from '../services/databaseService';
import IssueCard from '../components/IssueCard';
import { 
  User, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Filter,
  Search,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  Activity
} from 'lucide-react';
import './MyReportsPage.css';

export const MyReportsPage = () => {
  const { state } = useApp();
  const { user } = state;
  const [reports, setReports] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    console.log('MyReportsPage useEffect triggered:', {
      isAuthenticated: user.isAuthenticated,
      userId: user.id,
      userObject: user
    });

    if (user.isAuthenticated && user.id) {
      loadUserData();
    } else {
      console.log('User not authenticated or missing ID, skipping data load');
      setLoading(false);
    }
  }, [user.isAuthenticated, user.id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading user data for user:', user.id);
      console.log('User object:', user);

      if (!user.id) {
        throw new Error('User ID is missing');
      }

      const [userReports, profileData] = await Promise.all([
        databaseService.getUserReports(user.id),
        databaseService.getUserProfile(user.id)
      ]);

      console.log('User reports loaded:', userReports?.length || 0);
      console.log('User profile loaded:', profileData);

      setReports(userReports || []);
      setUserProfile(profileData);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError(`Failed to load your reports: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || report.status === filter;
    const matchesSearch = !searchTerm || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return '#ff9500';
      case 'in_progress': return '#007aff';
      case 'resolved': return '#34c759';
      default: return '#8e8e93';
    }
  };

  const getProgressPercentage = () => {
    if (!userProfile?.reportStats) return 0;
    const { totalReports, resolvedCount } = userProfile.reportStats;
    return totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;
  };

  if (!user.isAuthenticated) {
    return (
      <div className="my-reports-page">
        <div className="auth-required">
          <div className="auth-icon">
            <User size={64} />
          </div>
          <h2>Welcome to Your Reports</h2>
          <p>Sign in to track and manage all the civic issues you've reported to make your community better.</p>
          <div className="auth-features">
            <div className="feature">
              <BarChart3 size={20} />
              <span>Track report progress</span>
            </div>
            <div className="feature">
              <MapPin size={20} />
              <span>View location-based issues</span>
            </div>
            <div className="feature">
              <Activity size={20} />
              <span>Get status updates</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-reports-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>Loading your reports...</h3>
          <p>Fetching your civic contribution data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-reports-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-reports-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>My Impact Dashboard</h1>
            <p>Track your civic contributions and see how you're making a difference in your community</p>
          </div>
          {userProfile && (
            <div className="hero-badge">
              <Award size={24} />
              <div>
                <span className="badge-number">{userProfile.reportStats.totalReports}</span>
                <span className="badge-label">Reports Submitted</span>
              </div>
            </div>
          )}
        </div>
        
        {userProfile && (
          <div className="progress-ring">
            <div className="ring-background">
              <div 
                className="ring-progress" 
                style={{ 
                  background: `conic-gradient(var(--success-color) ${getProgressPercentage() * 3.6}deg, var(--background-tertiary) 0deg)` 
                }}
              ></div>
              <div className="ring-content">
                <span className="progress-number">{getProgressPercentage()}%</span>
                <span className="progress-label">Resolved</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Statistics Cards */}
      {userProfile && (
        <div className="stats-section">
          <div className="stats-header">
            <h2>Your Civic Impact</h2>
            <div className="stats-period">
              <Calendar size={16} />
              <span>All Time</span>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-header">
                <div className="stat-icon">
                  <BarChart3 size={24} />
                </div>
                <div className="stat-trend">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="stat-content">
                <div className="stat-number">{userProfile.reportStats.totalReports}</div>
                <div className="stat-label">Total Reports</div>
                <div className="stat-description">Issues you've reported</div>
              </div>
            </div>
            
            <div className="stat-card warning">
              <div className="stat-header">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-badge">{userProfile.reportStats.reportedCount}</div>
              </div>
              <div className="stat-content">
                <div className="stat-number">{userProfile.reportStats.reportedCount}</div>
                <div className="stat-label">Under Review</div>
                <div className="stat-description">Awaiting response</div>
              </div>
            </div>
            
            <div className="stat-card info">
              <div className="stat-header">
                <div className="stat-icon">
                  <AlertTriangle size={24} />
                </div>
                <div className="stat-badge">{userProfile.reportStats.inProgressCount}</div>
              </div>
              <div className="stat-content">
                <div className="stat-number">{userProfile.reportStats.inProgressCount}</div>
                <div className="stat-label">In Progress</div>
                <div className="stat-description">Being addressed</div>
              </div>
            </div>
            
            <div className="stat-card success">
              <div className="stat-header">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-badge">{userProfile.reportStats.resolvedCount}</div>
              </div>
              <div className="stat-content">
                <div className="stat-number">{userProfile.reportStats.resolvedCount}</div>
                <div className="stat-label">Resolved</div>
                <div className="stat-description">Successfully fixed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Reports Section */}
      <div className="reports-section">
        <div className="section-header">
          <h2>Your Reports ({filteredReports.length})</h2>
          
          <div className="controls-group">
            {/* Search Bar */}
            <div className="search-container">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search your reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            {/* Sort Dropdown */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">By Status</option>
              <option value="category">By Category</option>
            </select>
          </div>
        </div>

        {/* Enhanced Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="tab-label">All Reports</span>
            <span className="tab-count">{reports.length}</span>
          </button>
          
          <button 
            className={`filter-tab ${filter === 'reported' ? 'active' : ''}`}
            onClick={() => setFilter('reported')}
          >
            <Clock size={16} />
            <span className="tab-label">Under Review</span>
            <span className="tab-count">{reports.filter(r => r.status === 'reported').length}</span>
          </button>
          
          <button 
            className={`filter-tab ${filter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setFilter('in_progress')}
          >
            <AlertTriangle size={16} />
            <span className="tab-label">In Progress</span>
            <span className="tab-count">{reports.filter(r => r.status === 'in_progress').length}</span>
          </button>
          
          <button 
            className={`filter-tab ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            <CheckCircle size={16} />
            <span className="tab-label">Resolved</span>
            <span className="tab-count">{reports.filter(r => r.status === 'resolved').length}</span>
          </button>
        </div>

        {/* Reports Grid with Animation */}
        {filteredReports.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <Search size={48} />
                <h3>No matching reports</h3>
                <p>Try adjusting your search terms or filters to find what you're looking for.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              </>
            ) : filter === 'all' ? (
              <>
                <BarChart3 size={48} />
                <h3>Start Making an Impact</h3>
                <p>You haven't reported any civic issues yet. Be the change you want to see in your community!</p>
                <div className="empty-features">
                  <div className="empty-feature">
                    <MapPin size={20} />
                    <span>Report local issues</span>
                  </div>
                  <div className="empty-feature">
                    <Activity size={20} />
                    <span>Track progress</span>
                  </div>
                  <div className="empty-feature">
                    <Award size={20} />
                    <span>Make a difference</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Filter size={48} />
                <h3>No {filter.replace('_', ' ')} reports</h3>
                <p>You don't have any reports with this status yet.</p>
              </>
            )}
          </div>
        ) : (
          <div className="reports-grid">
            {filteredReports.map((report, index) => (
              <div 
                key={report.id} 
                className="report-card-wrapper"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <IssueCard 
                  issue={report} 
                  showReporterInfo={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
