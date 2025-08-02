import React, { useState } from 'react';
import { X, MapPin, Clock, Camera, Flag, MessageCircle, User, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils';
import { ISSUE_STATUS_LABELS, ISSUE_CATEGORY_LABELS, USER_ROLES } from '../constants';
import './IssueDetailModal.css';

const IssueDetailModal = ({ issue, isOpen, onClose }) => {
  const { state, actions } = useApp();
  const { user } = state;
  const [comment, setComment] = useState('');
  const [showFullImage, setShowFullImage] = useState(null);

  if (!isOpen || !issue) return null;

  const handleStatusUpdate = (newStatus) => {
    const note = prompt('Add a note for this status update (optional):');
    actions.updateIssueStatus(issue.id, newStatus, note || '');
  };

  const handleFlag = () => {
    const reason = prompt('Why are you flagging this issue?\n\n1. Spam\n2. Inappropriate content\n3. Fake report\n\nEnter reason:');
    if (reason) {
      actions.flagIssue(issue.id, reason.trim());
    }
  };

  const handleAddComment = async () => {
    if (comment.trim() && issue) {
      try {
        await actions.addComment(issue.id, {
          content: comment.trim(),
          authorName: 'Current User' // In real app, this would come from user auth
        });
        setComment('');
      } catch (error) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const isAdmin = user.role === USER_ROLES.ADMIN;
  const canUpdateStatus = isAdmin;

  return (
    <>
      <div className="modal-overlay">
        <div className="issue-detail-modal">
          <div className="modal-header">
            <h2>Issue Details</h2>
            <button className="close-button" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {/* Issue Header */}
            <div className="issue-header">
              <div className="issue-meta">
                <h3 className="issue-title">{issue.title}</h3>
                <div className="issue-badges">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(issue.status) }}
                  >
                    {ISSUE_STATUS_LABELS[issue.status]}
                  </span>
                  <span className="category-badge">
                    {ISSUE_CATEGORY_LABELS[issue.category]}
                  </span>
                </div>
              </div>
              
              <div className="issue-actions">
                <button className="flag-button" onClick={handleFlag}>
                  <Flag size={16} />
                  Flag
                </button>
              </div>
            </div>

            {/* Issue Info */}
            <div className="issue-info">
              <div className="info-grid">
                <div className="info-item">
                  <MapPin size={16} />
                  <span>{issue.address || `${issue.location?.lat.toFixed(4)}, ${issue.location?.lng.toFixed(4)}`}</span>
                </div>
                <div className="info-item">
                  <Clock size={16} />
                  <span>Reported {formatDate(issue.createdAt)}</span>
                </div>
                <div className="info-item">
                  <User size={16} />
                  <span>{issue.reporterName}</span>
                </div>
                {issue.photos && issue.photos.length > 0 && (
                  <div className="info-item">
                    <Camera size={16} />
                    <span>{issue.photos.length} photo{issue.photos.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="issue-description">
              <h4>Description</h4>
              <p>{issue.description}</p>
            </div>

            {/* Photos */}
            {issue.photos && issue.photos.length > 0 && (
              <div className="issue-photos">
                <h4>Photos</h4>
                <div className="photos-grid">
                  {issue.photos.map((photo, index) => (
                    <div 
                      key={index} 
                      className="photo-thumbnail"
                      onClick={() => setShowFullImage(photo)}
                    >
                      <img src={photo} alt={`Issue photo ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status History */}
            <div className="status-history">
              <h4>Status History</h4>
              <div className="history-timeline">
                {issue.statusHistory?.map((entry, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker" style={{ backgroundColor: getStatusColor(entry.status) }}></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="status-name">{ISSUE_STATUS_LABELS[entry.status]}</span>
                        <span className="timestamp">{formatDate(entry.timestamp)}</span>
                      </div>
                      {entry.note && <p className="timeline-note">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="comments-section">
              <h4>
                <MessageCircle size={16} />
                Comments ({issue.comments?.length || 0})
              </h4>
              
              {issue.comments && issue.comments.length > 0 ? (
                <div className="comments-list">
                  {issue.comments.map((comment, index) => (
                    <div key={index} className="comment">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-time">{formatDate(comment.timestamp)}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-comments">No comments yet.</p>
              )}

              {/* Add Comment */}
              <div className="add-comment">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <button 
                  className="add-comment-button"
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                >
                  Add Comment
                </button>
              </div>
            </div>

            {/* Admin Actions */}
            {canUpdateStatus && (
              <div className="admin-actions">
                <h4>Admin Actions</h4>
                <div className="status-buttons">
                  <button 
                    className="status-button reported"
                    onClick={() => handleStatusUpdate('reported')}
                  >
                    Mark as Reported
                  </button>
                  <button 
                    className="status-button in-progress"
                    onClick={() => handleStatusUpdate('in_progress')}
                  >
                    Mark In Progress
                  </button>
                  <button 
                    className="status-button resolved"
                    onClick={() => handleStatusUpdate('resolved')}
                  >
                    Mark Resolved
                  </button>
                  <button 
                    className="status-button rejected"
                    onClick={() => handleStatusUpdate('rejected')}
                  >
                    Reject Issue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && (
        <div className="image-modal-overlay" onClick={() => setShowFullImage(null)}>
          <div className="image-modal">
            <button className="close-image" onClick={() => setShowFullImage(null)}>
              <X size={24} />
            </button>
            <img src={showFullImage} alt="Full size" />
          </div>
        </div>
      )}
    </>
  );
};

export default IssueDetailModal;
