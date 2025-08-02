import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Ban,
  Eye,
  MapPin,
  Calendar,
  User,
  RefreshCw,
  Download,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { databaseService } from '../services/databaseService';
import { ISSUE_STATUS, ISSUE_CATEGORIES, USER_ROLES } from '../constants';
import './TotalReportsPage.css';

const TotalReportsPage = () => {
  const { state, actions } = useApp();
  const { user } = state;
  
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    reported: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0
  });

  useEffect(() => {
    if (user.role === USER_ROLES.ADMIN) {
      loadAllReports();
    }
  }, [user.role]);

  useEffect(() => {
    applyFilters();
  }, [allReports, searchTerm, statusFilter, categoryFilter, sortBy]);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all issues without any user-specific filtering
      const reports = await databaseService.getIssues({});
      console.log('Loaded all reports:', reports.length);
      
      setAllReports(reports || []);
      calculateStatistics(reports || []);
    } catch (err) {
      console.error('Failed to load all reports:', err);
      setError(`Failed to load reports: ${err.message}`);
      actions.addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'Failed to load reports',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (reports) => {
    const stats = {
      total: reports.length,
      reported: reports.filter(r => r.status === 'reported').length,
      inProgress: reports.filter(r => r.status === 'in_progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      rejected: reports.filter(r => r.status === 'rejected').length
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...allReports];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        report.category.toLowerCase().includes(searchLower) ||
        report.address?.toLowerCase().includes(searchLower) ||
        report.reporter_name?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'reporter':
          return (a.reporter_name || '').localeCompare(b.reporter_name || '');
        default:
          return 0;
      }
    });

    setFilteredReports(filtered);
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await databaseService.updateIssueStatus(reportId, newStatus, `Status changed to ${newStatus} by admin`);
      
      // Update local state
      setAllReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus }
          : report
      ));

      actions.addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Status Updated',
        message: `Report status changed to ${newStatus}`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      actions.addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'Failed to update report status',
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleBulkStatusUpdate = async (reportIds, newStatus) => {
    try {
      setLoading(true);
      
      await Promise.all(
        reportIds.map(id => 
          databaseService.updateIssueStatus(id, newStatus, `Bulk status change to ${newStatus} by admin`)
        )
      );

      // Reload data
      await loadAllReports();

      actions.addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Bulk Update Complete',
        message: `${reportIds.length} reports updated to ${newStatus}`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Bulk update failed:', err);
      actions.addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Error',
        message: 'Failed to perform bulk update',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reported':
        return <Clock size={16} className="status-icon reported" />;
      case 'in_progress':
        return <AlertTriangle size={16} className="status-icon in-progress" />;
      case 'resolved':
        return <CheckCircle size={16} className="status-icon resolved" />;
      case 'rejected':
        return <Ban size={16} className="status-icon rejected" />;
      default:
        return <FileText size={16} className="status-icon" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return '#ff9500';
      case 'in_progress': return '#007aff';
      case 'resolved': return '#34c759';
      case 'rejected': return '#ff3b30';
      default: return '#8e8e93';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (user.role !== USER_ROLES.ADMIN) {
    return (
      <div className="total-reports-page">
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
      <div className="total-reports-page">
        <div className="loading-container">
          <RefreshCw className="loading-spinner" size={32} />
          <h3>Loading all reports...</h3>
          <p>Fetching comprehensive civic reports data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="total-reports-page">
        <div className="error-container">
          <AlertTriangle size={48} />
          <h3>Error Loading Reports</h3>
          <p>{error}</p>
          <button onClick={loadAllReports} className="retry-button">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="total-reports-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Total Reports Management</h1>
            <p>Comprehensive view and management of all civic issue reports</p>
          </div>
          <div className="header-actions">
            <button onClick={loadAllReports} className="refresh-button">
              <RefreshCw size={16} />
              Refresh
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Reports</h3>
              <p className="stat-number">{stats.total}</p>
            </div>
          </div>
          
          <div className="stat-card reported">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Reported</h3>
              <p className="stat-number">{stats.reported}</p>
            </div>
          </div>
          
          <div className="stat-card in-progress">
            <div className="stat-icon">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-content">
              <h3>In Progress</h3>
              <p className="stat-number">{stats.inProgress}</p>
            </div>
          </div>
          
          <div className="stat-card resolved">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>Resolved</h3>
              <p className="stat-number">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search Reports</label>
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by title, description, category, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="reported">Reported</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="roads">Roads</option>
                <option value="lighting">Lighting</option>
                <option value="water_supply">Water Supply</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="public_safety">Public Safety</option>
                <option value="obstructions">Obstructions</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="status">Status</option>
                <option value="category">Category</option>
                <option value="reporter">Reporter</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="reports-section">
        <div className="section-header">
          <h2>Reports ({filteredReports.length})</h2>
        </div>

        {filteredReports.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No reports found</h3>
            <p>Try adjusting your filters or check back later for new reports.</p>
          </div>
        ) : (
          <div className="reports-list">
            {filteredReports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <div className="report-title-section">
                    <h3 className="report-title">{report.title}</h3>
                    <div className="report-meta">
                      <span className="category-badge">{report.category.replace('_', ' ')}</span>
                      <div className="status-section">
                        {getStatusIcon(report.status)}
                        <span className="status-text">{report.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="status-update-section">
                    <label>Change Status:</label>
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      className="status-select"
                      style={{ borderColor: getStatusColor(report.status) }}
                    >
                      <option value="reported">Reported</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="report-content">
                  <p className="report-description">{report.description}</p>
                  
                  <div className="report-details">
                    <div className="detail-item">
                      <User size={14} />
                      <span>Reporter: {report.reporter_name || 'Anonymous'}</span>
                    </div>
                    
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Reported: {formatDate(report.created_at)}</span>
                    </div>
                    
                    {report.address && (
                      <div className="detail-item">
                        <MapPin size={14} />
                        <span>Location: {report.address}</span>
                      </div>
                    )}
                  </div>

                  {report.photos && report.photos.length > 0 && (
                    <div className="report-photos">
                      {report.photos.slice(0, 3).map((photo, index) => (
                        <img 
                          key={index} 
                          src={photo} 
                          alt={`Report photo ${index + 1}`}
                          className="report-photo"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="report-actions">
                  <button 
                    className="action-button view"
                    onClick={() => actions.setSelectedIssue(report.id)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  
                  {report.status !== 'resolved' && (
                    <button 
                      className="action-button resolve"
                      onClick={() => handleStatusChange(report.id, 'resolved')}
                    >
                      <CheckCircle size={16} />
                      Mark as Resolved
                    </button>
                  )}
                  
                  {report.status === 'reported' && (
                    <button 
                      className="action-button progress"
                      onClick={() => handleStatusChange(report.id, 'in_progress')}
                    >
                      <AlertTriangle size={16} />
                      Mark in Progress
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalReportsPage;
