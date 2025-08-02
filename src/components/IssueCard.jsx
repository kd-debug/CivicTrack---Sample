import React from 'react';
import { Clock, MapPin, Camera, Flag, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils';
import { ISSUE_STATUS_LABELS, ISSUE_CATEGORY_LABELS } from '../constants';
import './IssueCard.css';

const IssueCard = ({ issue, onClick }) => {
  const { actions } = useApp();

  const handleCardClick = () => {
    if (onClick) {
      onClick(issue);
    } else {
      actions.setSelectedIssue(issue);
    }
  };

  const handleFlagClick = (e) => {
    e.stopPropagation();
    const reason = prompt('Why are you flagging this issue?\n\n1. Spam\n2. Inappropriate content\n3. Fake report\n\nEnter reason:');
    if (reason) {
      actions.flagIssue(issue.id, {
        reason: reason.trim(),
        reportedBy: 'current_user',
        timestamp: new Date().toISOString()
      });
      alert('Issue has been flagged for review.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return 'status-reported';
      case 'in_progress':
        return 'status-in-progress';
      case 'resolved':
        return 'status-resolved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-reported';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      roads: 'category-roads',
      lighting: 'category-lighting',
      water_supply: 'category-water',
      cleanliness: 'category-cleanliness',
      public_safety: 'category-safety',
      obstructions: 'category-obstructions'
    };
    return colors[category] || 'category-default';
  };

  return (
    <div className="issue-card" onClick={handleCardClick}>
      <div className="issue-card-header">
        <div className="issue-meta">
          <span className={`status-badge ${getStatusColor(issue.status)}`}>
            {ISSUE_STATUS_LABELS[issue.status]}
          </span>
          <span className={`category-badge ${getCategoryColor(issue.category)}`}>
            {ISSUE_CATEGORY_LABELS[issue.category]}
          </span>
        </div>
        <button
          className="flag-button"
          onClick={handleFlagClick}
          aria-label="Flag issue"
        >
          <Flag size={16} />
        </button>
      </div>

      <div className="issue-content">
        <h3 className="issue-title">{issue.title}</h3>
        <p className="issue-description">{issue.description}</p>
      </div>

      <div className="issue-details">
        <div className="detail-item">
          <MapPin size={14} />
          <span className="detail-text">
            {issue.address || `${issue.location?.lat.toFixed(4)}, ${issue.location?.lng.toFixed(4)}`}
          </span>
        </div>
        
        <div className="detail-item">
          <Clock size={14} />
          <span className="detail-text">{formatDate(issue.createdAt)}</span>
        </div>

        {issue.photos && issue.photos.length > 0 && (
          <div className="detail-item">
            <Camera size={14} />
            <span className="detail-text">{issue.photos.length} photo{issue.photos.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {issue.photos && issue.photos.length > 0 && (
        <div className="issue-photos">
          {issue.photos.slice(0, 3).map((photo, index) => (
            <div key={index} className="photo-thumbnail">
              <img src={photo} alt={`Issue photo ${index + 1}`} />
            </div>
          ))}
          {issue.photos.length > 3 && (
            <div className="more-photos">
              +{issue.photos.length - 3}
            </div>
          )}
        </div>
      )}

      <div className="issue-actions">
        <div className="action-stats">
          <span className="stat-item">
            <MessageCircle size={14} />
            {issue.comments?.length || 0}
          </span>
          {issue.flagCount > 0 && (
            <span className="stat-item flag-count">
              <Flag size={14} />
              {issue.flagCount}
            </span>
          )}
        </div>
        
        <div className="view-details">
          <span className="view-text">View Details →</span>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
