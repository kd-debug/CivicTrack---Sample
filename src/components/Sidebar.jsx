import React, { useState } from 'react';
import { X, Filter, MapPin, Clock, CheckCircle, AlertTriangle, Plus, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ISSUE_CATEGORIES, ISSUE_CATEGORY_LABELS, ISSUE_STATUS, ISSUE_STATUS_LABELS, DISTANCE_FILTERS } from '../constants';
import ReportIssueModal from './ReportIssueModal';
import './Sidebar.css';

const Sidebar = () => {
  const { state, actions } = useApp();
  const { sidebarOpen, filters, user } = state;
  const [showReportModal, setShowReportModal] = useState(false);

  const handleFilterChange = (filterType, value) => {
    actions.setFilters({ [filterType]: value });
  };

  const clearFilters = () => {
    actions.setFilters({
      status: '',
      category: '',
      distance: 5
    });
  };

  const handleReportIssue = () => {
    setShowReportModal(true);
    actions.toggleSidebar(); // Close sidebar when opening modal
  };

  const handleMyReports = () => {
    // Filter to show only user's reports
    actions.setFilters({ 
      status: '', 
      category: '', 
      distance: 5,
      userOnly: true 
    });
    actions.toggleSidebar();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ISSUE_STATUS.REPORTED:
        return <Clock size={16} />;
      case ISSUE_STATUS.IN_PROGRESS:
        return <AlertTriangle size={16} />;
      case ISSUE_STATUS.RESOLVED:
        return <CheckCircle size={16} />;
      default:
        return <MapPin size={16} />;
    }
  };

  if (!sidebarOpen) return null;

  return (
    <div className="sidebar-overlay">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <Filter size={20} />
            Filters & Navigation
          </h2>
          <button
            className="close-button"
            onClick={actions.toggleSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          {/* Quick Actions */}
          <section className="filter-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions">
              <button className="action-button primary" onClick={handleReportIssue}>
                <Plus size={16} />
                Report Issue
              </button>
              <button className="action-button secondary" onClick={handleMyReports}>
                <User size={16} />
                My Reports
              </button>
            </div>
          </section>

          {/* Status Filter */}
          <section className="filter-section">
            <h3 className="section-title">Status</h3>
            <div className="filter-group">
              <label className="filter-option">
                <input
                  type="radio"
                  name="status"
                  value=""
                  checked={filters.status === ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                />
                <span className="filter-label">
                  <MapPin size={16} />
                  All Issues
                </span>
              </label>
              
              {Object.entries(ISSUE_STATUS).map(([key, status]) => (
                <label key={status} className="filter-option">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={filters.status === status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  />
                  <span className="filter-label">
                    {getStatusIcon(status)}
                    {ISSUE_STATUS_LABELS[status]}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Category Filter */}
          <section className="filter-section">
            <h3 className="section-title">Category</h3>
            <div className="filter-group">
              <label className="filter-option">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={filters.category === ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                />
                <span className="filter-label">All Categories</span>
              </label>
              
              {Object.entries(ISSUE_CATEGORIES).map(([key, category]) => (
                <label key={category} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={filters.category === category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  />
                  <span className="filter-label">
                    {ISSUE_CATEGORY_LABELS[category]}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Distance Filter */}
          <section className="filter-section">
            <h3 className="section-title">Distance</h3>
            <div className="filter-group">
              {Object.entries(DISTANCE_FILTERS).map(([key, distance]) => (
                <label key={distance} className="filter-option">
                  <input
                    type="radio"
                    name="distance"
                    value={distance}
                    checked={filters.distance === distance}
                    onChange={(e) => handleFilterChange('distance', parseInt(e.target.value))}
                  />
                  <span className="filter-label">
                    Within {distance} km
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Clear Filters */}
          <section className="filter-section">
            <button
              className="clear-filters-button"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          </section>
        </div>
      </aside>
      
      {/* Report Issue Modal */}
      <ReportIssueModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />
    </div>
  );
};

export default Sidebar;
