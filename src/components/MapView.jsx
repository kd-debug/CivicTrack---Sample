import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Clock, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on issue status
const createCustomIcon = (status) => {
  const colors = {
    reported: '#f59e0b', // amber
    in_progress: '#3b82f6', // blue
    resolved: '#10b981', // green
    rejected: '#ef4444', // red
  };

  const color = colors[status] || colors.reported;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="color: white; font-size: 12px;">📍</div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Component to handle map center updates
const MapController = ({ center, issues }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [center, map]);

  useEffect(() => {
    if (issues.length > 0) {
      // Fit map to show all issues
      const bounds = L.latLngBounds(
        issues
          .filter(issue => issue.latitude && issue.longitude)
          .map(issue => [parseFloat(issue.latitude), parseFloat(issue.longitude)])
      );
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [issues, map]);

  return null;
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'reported':
      return <Clock size={16} className="status-icon reported" />;
    case 'in_progress':
      return <AlertTriangle size={16} className="status-icon in-progress" />;
    case 'resolved':
      return <CheckCircle size={16} className="status-icon resolved" />;
    default:
      return <MapPin size={16} className="status-icon" />;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const MapView = ({ issues, userLocation, onIssueClick }) => {
  const mapRef = useRef();
  
  // Default to Delhi if no user location
  const defaultCenter = { lat: 28.6139, lng: 77.2090 };
  const mapCenter = userLocation || defaultCenter;

  // Filter issues that have valid coordinates
  const mappableIssues = issues.filter(issue => 
    issue.latitude && 
    issue.longitude && 
    !isNaN(parseFloat(issue.latitude)) && 
    !isNaN(parseFloat(issue.longitude))
  );

  console.log('🗺️ MapView rendering:', {
    totalIssues: issues.length,
    mappableIssues: mappableIssues.length,
    userLocation,
    mapCenter
  });

  return (
    <div className="map-view">
      <div className="map-header">
        <h3>Issues Map View</h3>
        <p>{mappableIssues.length} issues shown on map</p>
      </div>
      
      <div className="map-container">
        <MapContainer
          ref={mapRef}
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController center={userLocation} issues={mappableIssues} />
          
          {/* User location marker */}
          {userLocation && (
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: `
                  <div style="
                    background-color: #3b82f6;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    animation: pulse 2s infinite;
                  "></div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            >
              <Popup>
                <div className="popup-content">
                  <strong>Your Location</strong>
                  <p>Current position</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Issue markers */}
          {mappableIssues.map((issue) => (
            <Marker
              key={issue.id}
              position={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
              icon={createCustomIcon(issue.status)}
              eventHandlers={{
                click: () => onIssueClick && onIssueClick(issue),
              }}
            >
              <Popup maxWidth={300}>
                <div className="issue-popup">
                  <div className="popup-header">
                    <h4 className="popup-title">{issue.title}</h4>
                    <div className="popup-status">
                      {getStatusIcon(issue.status)}
                      <span className={`status-text ${issue.status}`}>
                        {issue.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="popup-body">
                    <p className="popup-description">
                      {issue.description.length > 100 
                        ? `${issue.description.substring(0, 100)}...` 
                        : issue.description}
                    </p>
                    
                    <div className="popup-meta">
                      <div className="meta-row">
                        <span className="meta-label">Category:</span>
                        <span className="meta-value">{issue.category.replace('_', ' ')}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Reported:</span>
                        <span className="meta-value">{formatDate(issue.created_at)}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-label">Reporter:</span>
                        <span className="meta-value">{issue.reporter_name || 'Anonymous'}</span>
                      </div>
                      {issue.photos && issue.photos.length > 0 && (
                        <div className="meta-row">
                          <Camera size={14} />
                          <span className="meta-value">{issue.photos.length} photo(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="popup-footer">
                    <button 
                      className="view-details-btn"
                      onClick={() => onIssueClick && onIssueClick(issue)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Map Legend */}
        <div className="map-legend">
          <h4>Legend</h4>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-marker reported"></div>
              <span>Reported</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker in-progress"></div>
              <span>In Progress</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker resolved"></div>
              <span>Resolved</span>
            </div>
            <div className="legend-item">
              <div className="legend-marker user"></div>
              <span>Your Location</span>
            </div>
          </div>
        </div>
      </div>
      
      {mappableIssues.length === 0 && issues.length > 0 && (
        <div className="map-empty-state">
          <MapPin size={48} />
          <h4>No mappable issues found</h4>
          <p>Issues in your area don't have location coordinates.</p>
        </div>
      )}
    </div>
  );
};

export default MapView;
