import React, { useState } from 'react';
import { Menu, MapPin, Bell, Settings, Map, List, User, LogOut, LogIn, FileText, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../hooks';
import AuthModal from './AuthModal';
import './Header.css';

const Header = () => {
  const { state, actions } = useApp();
  const { mapView, user } = state;
  const { notifications } = useNotifications();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Debug: Log user information to help with admin role checking
  React.useEffect(() => {
    if (user.isAuthenticated) {
      console.log('🔍 Current user info for admin check:', {
        isAuthenticated: user.isAuthenticated,
        role: user.role,
        email: user.email,
        name: user.name,
        id: user.id
      });
    }
  }, [user]);

  const handleToggleView = () => {
    actions.toggleMapView();
  };

  const handleToggleSidebar = () => {
    actions.toggleSidebar();
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    actions.addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Welcome!',
      message: `Successfully signed ${authMode === 'login' ? 'in' : 'up'}`,
      timestamp: new Date().toISOString()
    });
  };

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignup = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="icon-button"
            onClick={handleToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          
          <button 
            className="logo-button"
            onClick={() => actions.setCurrentPage('home')}
            aria-label="Go to home page"
            title="Go to home page"
          >
            <div className="logo">
              <MapPin className="logo-icon" size={28} />
              <h1 className="logo-text">CivicTrack</h1>
            </div>
          </button>
        </div>

        <div className="header-center">
          <div className="page-indicator">
            <button 
              className={`page-nav-button ${state.currentPage === 'home' ? 'active' : ''}`}
              onClick={() => actions.setCurrentPage('home')}
              aria-label="Go to home page"
            >
              <Map size={16} />
              <span>Home</span>
            </button>
            {user.isAuthenticated && (
              <button 
                className={`page-nav-button ${state.currentPage === 'my-reports' ? 'active' : ''}`}
                onClick={() => actions.setCurrentPage('my-reports')}
                aria-label="Go to my reports"
              >
                <FileText size={16} />
                <span>My Reports</span>
              </button>
            )}
            {user.isAuthenticated && (
              <button 
                className={`page-nav-button ${state.currentPage === 'profile' ? 'active' : ''}`}
                onClick={() => actions.setCurrentPage('profile')}
                aria-label="Go to profile"
              >
                <User size={16} />
                <span>Profile</span>
              </button>
            )}
            {user.isAuthenticated && user.role === 'admin' && (
                <button
                    className={`page-nav-button ${state.currentPage === 'admin' ? 'active' : ''}`}
                    onClick={() => actions.setCurrentPage('admin')}
                    aria-label="Go to admin dashboard"
                >
                    <Shield size={16} />
                    <span>Admin</span>
                </button>
            )}
          </div>
          
          {user.location && (
            <div className="location-indicator">
              <MapPin size={16} />
              <span className="location-text">
                {user.location.lat.toFixed(4)}, {user.location.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>

        <div className="header-right">
          <button
            className={`toggle-view-button ${mapView ? 'map-active' : 'list-active'}`}
            onClick={handleToggleView}
            aria-label={mapView ? 'Switch to list view' : 'Switch to map view'}
          >
            {mapView ? <List size={20} /> : <Map size={20} />}
            <span className="view-label">
              {mapView ? 'List' : 'Map'}
            </span>
          </button>

          <div className="notification-container">
            <button 
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="notification-badge">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Authentication Section */}
          {user.isAuthenticated ? (
            <div className="user-menu">
              <div className="user-info">
                <User size={16} />
                <span className="user-name">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="admin-badge">Admin</span>
                )}
              </div>
              <button 
                className="icon-button logout-button"
                onClick={actions.logout}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                className="auth-button login-button"
                onClick={handleLogin}
              >
                <LogIn size={16} />
                Sign In
              </button>
              <button 
                className="auth-button signup-button"
                onClick={handleSignup}
              >
                <User size={16} />
                Sign Up
              </button>
            </div>
          )}

          <button 
            className="icon-button"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        mode={authMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </header>
  );
};

export default Header;
