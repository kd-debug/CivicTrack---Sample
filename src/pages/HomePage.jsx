import React, { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFilteredIssues } from '../hooks';
import IssueCard from '../components/IssueCard';
import MapView from '../components/MapView';
import ReportIssueModal from '../components/ReportIssueModal';
import IssueDetailModal from '../components/IssueDetailModal';
import './HomePage.css';

const HomePage = () => {
  const { state, actions } = useApp();
  const { loading, mapView, selectedIssue, issues, user, filters } = state;
  const filteredIssues = useFilteredIssues();
  const [showReportModal, setShowReportModal] = useState(false);

  const handleReportIssue = () => {
    setShowReportModal(true);
  };

  const handleIssueClick = (issue) => {
    actions.setSelectedIssue(issue.id);
  };

  const handleRefreshIssues = () => {
    console.log('🔄 Manual refresh triggered');
    actions.loadIssues();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading issues...</p>
      </div>
    );
  }

  if (mapView) {
    return (
      <div className="map-view-container">
        <MapView 
          issues={filteredIssues}
          userLocation={user.location}
          onIssueClick={handleIssueClick}
        />
        
        {/* Floating action button for map view */}
        <button
          className="floating-action-button"
          onClick={handleReportIssue}
          aria-label="Report new issue"
          title="Report new issue"
        >
          <Plus size={24} />
        </button>
        
        {/* Modals */}
        <ReportIssueModal 
          isOpen={showReportModal} 
          onClose={() => setShowReportModal(false)} 
        />
        
        <IssueDetailModal 
          issue={selectedIssue} 
          isOpen={!!selectedIssue} 
          onClose={() => actions.setSelectedIssue(null)} 
        />
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="header-content">
          <h2 className="page-title">Civic Issues in Your Area</h2>
          <p className="page-subtitle">
            {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} found
            {issues.length !== filteredIssues.length && (
              <span className="filter-info"> (filtered from {issues.length} total)</span>
            )}
          </p>
          <div className="debug-info">
            <small>
              Location: {user.location ? `${user.location.lat?.toFixed(4)}, ${user.location.lng?.toFixed(4)}` : 'Not set'} | 
              Filters: {filters.category || 'All'} / {filters.status || 'All'} / {filters.distance}km
            </small>
          </div>
        </div>
        
        <div className="header-actions">
          <button
            className="refresh-button"
            onClick={handleRefreshIssues}
            disabled={loading}
            aria-label="Refresh issues"
            title="Refresh issues"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          
          <button
            className="report-button"
            onClick={handleReportIssue}
            aria-label="Report new issue"
          >
            <Plus size={20} />
            Report Issue
          </button>
        </div>
      </div>

      <div className="issues-container">
        {filteredIssues.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📍</div>
            <h3>No issues found</h3>
            <p>No civic issues match your current filters. Try adjusting your search criteria or be the first to report an issue in your area.</p>
            <button
              className="report-button primary"
              onClick={handleReportIssue}
            >
              <Plus size={20} />
              Report First Issue
            </button>
          </div>
        ) : (
          <div className="issues-grid">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={handleIssueClick}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Modals */}
      <ReportIssueModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
      />
      
      <IssueDetailModal 
        issue={selectedIssue} 
        isOpen={!!selectedIssue} 
        onClose={() => actions.setSelectedIssue(null)} 
      />
    </div>
  );
};

export default HomePage;
