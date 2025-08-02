import React, { useState, useEffect } from 'react';
import { X, MapPin, Camera, Upload, Shield, UserX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFileUpload, useGeolocation } from '../hooks';
import { ISSUE_CATEGORIES, ISSUE_CATEGORY_LABELS } from '../constants';
import './ReportIssueModal.css';

const ReportIssueModal = ({ isOpen, onClose }) => {
  const { state, actions } = useApp();
  const { user } = state;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isAnonymous: false,
    useCurrentLocation: true,
    manualAddress: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { files, previews, errors, addFile, removeFile, clearFiles, clearErrors } = useFileUpload(3, 5);
  const { location, getCurrentPosition, loading: locationLoading } = useGeolocation();

  // Update anonymous setting based on authentication status
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        isAnonymous: !user.isAuthenticated
      }));
    }
  }, [isOpen, user.isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    console.log('Files selected for upload:', newFiles.length);
    
    clearErrors();
    newFiles.forEach((file, index) => {
      console.log(`Processing file ${index + 1}:`, file.name, file.size, file.type);
      addFile(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate form
      if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
        alert('Please fill in all required fields');
        return;
      }

      // Check if trying to submit verified report without authentication
      if (!formData.isAnonymous && !user.isAuthenticated) {
        alert('Please sign in to submit a verified report, or select anonymous reporting.');
        return;
      }

      // Use current location or manual address
      let issueLocation = null;
      let addressText = formData.manualAddress;
      
      if (formData.useCurrentLocation) {
        console.log('🗺️ Getting current location...');
        console.log('User location from context:', user.location);
        console.log('Location from hook:', location);
        
        issueLocation = user.location || location;
        if (!issueLocation || !issueLocation.latitude || !issueLocation.longitude) {
          console.log('No valid cached location, requesting fresh position...');
          try {
            const position = await getCurrentPosition();
            console.log('Fresh position received:', position);
            issueLocation = position;
          } catch (locationError) {
            console.error('Failed to get current position:', locationError);
            alert('Failed to get your location. Please try again or enter a manual address.');
            return;
          }
        }
        
        console.log('Final issue location:', issueLocation);
        
        // Validate location data
        if (!issueLocation || !issueLocation.latitude || !issueLocation.longitude) {
          console.error('❌ Location validation failed:', issueLocation);
          alert('Unable to get valid location. Please try again.');
          return;
        }
        
        // If we have coordinates, try to reverse geocode to get address
        if (issueLocation && issueLocation.latitude && issueLocation.longitude) {
          try {
            // For now, use a default address with coordinates
            addressText = `Location: ${issueLocation.latitude.toFixed(6)}, ${issueLocation.longitude.toFixed(6)}`;
            console.log('Generated address text:', addressText);
          } catch (error) {
            console.warn('Failed to get address from coordinates:', error);
            addressText = 'Current Location';
          }
        } else {
          console.warn('Location data incomplete:', issueLocation);
          addressText = 'Current Location';
        }
      }

      console.log('Submitting issue with location:', issueLocation);
      console.log('Files to upload:', files);

      // Create new issue
      const newIssue = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: issueLocation,
        address: addressText,
        photoFiles: files, // Pass actual files for Storage upload
        reporterName: formData.isAnonymous ? 'Anonymous' : (user.isAuthenticated ? user.name : 'Anonymous'),
        isAnonymous: formData.isAnonymous || !user.isAuthenticated
      };

      actions.addIssue(newIssue);
      
      // Show success notification
      actions.addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Issue Reported Successfully',
        message: 'Your civic issue has been reported and is now visible to others in your area.',
        timestamp: new Date().toISOString()
      });

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        category: '',
        isAnonymous: false,
        useCurrentLocation: true,
        manualAddress: ''
      });
      clearFiles();
      onClose();
    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Failed to submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Report Civic Issue</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="title">Issue Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Brief description of the issue"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {Object.entries(ISSUE_CATEGORIES).map(([key, value]) => (
                <option key={value} value={value}>
                  {ISSUE_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the issue..."
              required
              rows={4}
              maxLength={500}
            />
            <div className="char-count">
              {formData.description.length}/500 characters
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <div className="location-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="useCurrentLocation"
                  checked={formData.useCurrentLocation}
                  onChange={handleInputChange}
                />
                <span>Use current location</span>
              </label>
              {user.location && (
                <div className="current-location">
                  <MapPin size={16} />
                  <span>{user.location.lat.toFixed(4)}, {user.location.lng.toFixed(4)}</span>
                </div>
              )}
            </div>
            
            {!formData.useCurrentLocation && (
              <input
                type="text"
                name="manualAddress"
                value={formData.manualAddress}
                onChange={handleInputChange}
                placeholder="Enter address or landmark"
                className="address-input"
              />
            )}
          </div>

          <div className="form-group">
            <label>Photos (Optional)</label>
            <div className="photo-upload">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="file-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="upload-button">
                <Upload size={20} />
                Upload Photos ({files.length}/3)
              </label>
            </div>
            
            {errors.length > 0 && (
              <div className="error-messages">
                {errors.map((error, index) => (
                  <div key={index} className="error-message">{error}</div>
                ))}
              </div>
            )}

            {previews.length > 0 && (
              <div className="photo-previews">
                {previews.map((preview, index) => (
                  <div key={preview.id} className="photo-preview">
                    <img src={preview.url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-photo"
                      onClick={() => removeFile(index)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group reporting-type">
            <label>Report Type</label>
            <div className="report-type-options">
              <div 
                className={`report-type-card ${!formData.isAnonymous ? 'selected' : ''} ${!user.isAuthenticated ? 'disabled' : ''}`}
                onClick={() => user.isAuthenticated && setFormData(prev => ({...prev, isAnonymous: false}))}
              >
                <div className="report-type-header">
                  <Shield size={20} />
                  <span className="report-type-title">Verified Report</span>
                  {!user.isAuthenticated && <span className="auth-required">Sign in required</span>}
                </div>
                <ul className="report-type-benefits">
                  <li>✓ Your name will be attached</li>
                  <li>✓ Higher credibility and priority</li>
                  <li>✓ Receive status updates</li>
                  <li>✓ Help build community trust</li>
                </ul>
                {!user.isAuthenticated && (
                  <p className="auth-prompt">Please sign in to submit verified reports</p>
                )}
              </div>
              
              <div 
                className={`report-type-card ${formData.isAnonymous ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({...prev, isAnonymous: true}))}
              >
                <div className="report-type-header">
                  <UserX size={20} />
                  <span className="report-type-title">Anonymous Report</span>
                </div>
                <ul className="report-type-benefits">
                  <li>✓ Complete privacy protection</li>
                  <li>✓ No account required</li>
                  <li>✓ Quick and easy submission</li>
                  <li>• Lower priority than verified reports</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Report Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIssueModal;
