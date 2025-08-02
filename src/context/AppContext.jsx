import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getCurrentLocation, generateId } from '../utils';
import { ISSUE_STATUS, USER_ROLES } from '../constants';
import { databaseService, initializeSampleData } from '../services/databaseService';
import { authService } from '../services/authService';

// Initial state
const initialState = {
  // User state
  user: {
    id: null,
    email: null,
    name: null,
    role: USER_ROLES.CITIZEN,
    isAuthenticated: false,
    location: null,
    notifications: []
  },
  
  // Issues state
  issues: [],
  selectedIssue: null,
  filters: {
    status: '',
    category: '',
    distance: 5
  },
  
  // UI state
  loading: false,
  error: null,
  mapView: false,
  sidebarOpen: false,
  currentPage: 'home', // 'home', 'my-reports'
  
  // App settings
  theme: 'light'
};

// Action types
const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USER_LOCATION: 'SET_USER_LOCATION',
  SET_USER: 'SET_USER',
  SET_USER_AUTH: 'SET_USER_AUTH',
  LOGOUT_USER: 'LOGOUT_USER',
  ADD_ISSUE: 'ADD_ISSUE',
  UPDATE_ISSUE: 'UPDATE_ISSUE',
  DELETE_ISSUE: 'DELETE_ISSUE',
  SET_ISSUES: 'SET_ISSUES',
  SET_SELECTED_ISSUE: 'SET_SELECTED_ISSUE',
  SET_FILTERS: 'SET_FILTERS',
  TOGGLE_MAP_VIEW: 'TOGGLE_MAP_VIEW',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_THEME: 'SET_THEME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTION_TYPES.SET_USER_LOCATION:
      return {
        ...state,
        user: { ...state.user, location: action.payload }
      };
    
    case ACTION_TYPES.SET_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    case ACTION_TYPES.SET_USER_AUTH:
      return {
        ...state,
        user: {
          ...state.user,
          id: action.payload.id,
          email: action.payload.email,
          name: action.payload.name,
          role: action.payload.role || USER_ROLES.CITIZEN,
          isAuthenticated: true
        }
      };
    
    case ACTION_TYPES.LOGOUT_USER:
      return {
        ...state,
        user: {
          ...initialState.user,
          location: state.user.location // Keep location
        }
      };
    
    case ACTION_TYPES.ADD_ISSUE:
      return {
        ...state,
        issues: [action.payload, ...state.issues]
      };
    
    case ACTION_TYPES.UPDATE_ISSUE:
      return {
        ...state,
        issues: state.issues.map(issue =>
          issue.id === action.payload.id ? { ...issue, ...action.payload } : issue
        ),
        selectedIssue: state.selectedIssue?.id === action.payload.id 
          ? { ...state.selectedIssue, ...action.payload } 
          : state.selectedIssue
      };
    
    case ACTION_TYPES.DELETE_ISSUE:
      return {
        ...state,
        issues: state.issues.filter(issue => issue.id !== action.payload),
        selectedIssue: state.selectedIssue?.id === action.payload ? null : state.selectedIssue
      };
    
    case ACTION_TYPES.SET_ISSUES:
      return { ...state, issues: action.payload };
    
    case ACTION_TYPES.SET_SELECTED_ISSUE:
      return { ...state, selectedIssue: action.payload };
    
    case ACTION_TYPES.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case ACTION_TYPES.TOGGLE_MAP_VIEW:
      return { ...state, mapView: !state.mapView };
    
    case ACTION_TYPES.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };
    
    case ACTION_TYPES.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    
    case ACTION_TYPES.SET_THEME:
      return { ...state, theme: action.payload };
    
    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        user: {
          ...state.user,
          notifications: [action.payload, ...state.user.notifications]
        }
      };
    
    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return {
        ...state,
        user: {
          ...state.user,
          notifications: state.user.notifications.filter(n => n.id !== action.payload)
        }
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    setLoading: (loading) => dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error }),
    
    setUserLocation: (location) => dispatch({ type: ACTION_TYPES.SET_USER_LOCATION, payload: location }),
    
    setUser: (user) => dispatch({ type: ACTION_TYPES.SET_USER, payload: user }),
    
    // Authentication actions
    setUserAuth: (authData) => dispatch({ type: ACTION_TYPES.SET_USER_AUTH, payload: authData }),
    
    logout: async () => {
      try {
        await authService.signOut();
        dispatch({ type: ACTION_TYPES.LOGOUT_USER });
        actions.addNotification({
          id: generateId(),
          type: 'info',
          title: 'Signed Out',
          message: 'You have been successfully signed out',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        actions.addNotification({
          id: generateId(),
          type: 'error',
          title: 'Error',
          message: 'Failed to sign out',
          timestamp: new Date().toISOString()
        });
      }
    },
    
    // Load issues from database
    loadIssues: async () => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        
        console.log('🔄 Loading issues with current state:', {
          userLocation: state.user.location,
          filters: state.filters
        });
        
        const filters = {
          ...state.filters,
          userLocation: state.user.location
        };
        
        console.log('🔍 Calling database service with filters:', filters);
        const issues = await databaseService.getIssues(filters);
        
        console.log('📊 Loaded issues:', {
          count: issues?.length || 0,
          issues: issues?.slice(0, 3).map(i => ({ id: i.id, title: i.title, category: i.category, status: i.status }))
        });
        
        dispatch({ type: ACTION_TYPES.SET_ISSUES, payload: issues || [] });
      } catch (error) {
        console.error('❌ Failed to load issues:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    
    addIssue: async (issueData) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        
        console.log('🚀 Creating issue with data:', {
          title: issueData.title,
          category: issueData.category,
          hasLocation: !!issueData.location,
          locationData: issueData.location,
          hasPhotoFiles: !!issueData.photoFiles?.length,
          photoFilesCount: issueData.photoFiles?.length || 0,
          hasPhotos: !!issueData.photos?.length
        });
        
        // Add user information to issue data
        const enrichedIssueData = {
          ...issueData,
          reporterName: state.user.isAuthenticated 
            ? state.user.name 
            : (issueData.reporterName || 'Anonymous'),
          reporter_id: state.user.isAuthenticated ? state.user.id : null,
          isAnonymous: !state.user.isAuthenticated || issueData.isAnonymous
        };
        
        console.log('📤 Sending enriched data to database service...');
        console.log('📍 Location data being sent:', {
          originalLocation: issueData.location,
          enrichedLocation: enrichedIssueData.location,
          locationExists: !!enrichedIssueData.location,
          locationKeys: enrichedIssueData.location ? Object.keys(enrichedIssueData.location) : 'none'
        });
        
        const newIssue = await databaseService.createIssue(enrichedIssueData);
        console.log('✅ Issue created successfully:', newIssue);
        
        dispatch({ type: ACTION_TYPES.ADD_ISSUE, payload: newIssue });
        
        actions.addNotification({
          id: generateId(),
          type: 'success',
          title: 'Issue Reported',
          message: 'Your issue has been successfully reported',
          timestamp: new Date().toISOString()
        });
        
        return newIssue;
      } catch (error) {
        console.error('❌ Failed to create issue:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        actions.addNotification({
          id: generateId(),
          type: 'error',
          title: 'Error',
          message: 'Failed to report issue: ' + error.message,
          timestamp: new Date().toISOString()
        });
        throw error;
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    
    updateIssue: (issueUpdate) => {
      const updatedIssue = {
        ...issueUpdate,
        updatedAt: new Date().toISOString()
      };
      dispatch({ type: ACTION_TYPES.UPDATE_ISSUE, payload: updatedIssue });
    },
    
    updateIssueStatus: async (issueId, newStatus, note = '') => {
      // Check if user has admin privileges
      if (state.user.role !== USER_ROLES.ADMIN) {
        actions.addNotification({
          id: generateId(),
          type: 'error',
          title: 'Access Denied',
          message: 'Only administrators can update issue status',
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        const updatedIssue = await databaseService.updateIssueStatus(issueId, newStatus, note);
        dispatch({ type: ACTION_TYPES.UPDATE_ISSUE, payload: updatedIssue });
        
        // Add notification for status change
        actions.addNotification({
          id: generateId(),
          type: 'status_update',
          title: 'Issue Status Updated',
          message: `Issue status has been changed to ${newStatus.replace('_', ' ')}`,
          issueId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        actions.addNotification({
          id: generateId(),
          type: 'error',
          title: 'Error',
          message: 'Failed to update issue status',
          timestamp: new Date().toISOString()
        });
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    
    deleteIssue: (issueId) => dispatch({ type: ACTION_TYPES.DELETE_ISSUE, payload: issueId }),
    
    setIssues: (issues) => dispatch({ type: ACTION_TYPES.SET_ISSUES, payload: issues }),
    
    setSelectedIssue: async (issueId) => {
      if (!issueId) {
        dispatch({ type: ACTION_TYPES.SET_SELECTED_ISSUE, payload: null });
        return;
      }
      
      try {
        const issue = await databaseService.getIssueById(issueId);
        dispatch({ type: ACTION_TYPES.SET_SELECTED_ISSUE, payload: issue });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    },
    
    setFilters: async (filters) => {
      console.log('🎛️ Setting new filters:', filters);
      dispatch({ type: ACTION_TYPES.SET_FILTERS, payload: filters });
      
      // Reload issues with new filters
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        const filterParams = {
          ...state.filters,
          ...filters,
          userLocation: state.user.location
        };
        
        console.log('🔍 Fetching issues with new filters:', filterParams);
        const issues = await databaseService.getIssues(filterParams);
        
        console.log('📊 Filtered issues result:', {
          count: issues?.length || 0,
          filterParams,
          sampleIssues: issues?.slice(0, 2).map(i => ({ 
            id: i.id, 
            title: i.title, 
            category: i.category, 
            status: i.status,
            location: i.latitude && i.longitude ? `${i.latitude},${i.longitude}` : 'No location'
          }))
        });
        
        dispatch({ type: ACTION_TYPES.SET_ISSUES, payload: issues || [] });
      } catch (error) {
        console.error('❌ Failed to load filtered issues:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },
    
    toggleMapView: () => dispatch({ type: ACTION_TYPES.TOGGLE_MAP_VIEW }),
    
    toggleSidebar: () => dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR }),
    
    setCurrentPage: (page) => dispatch({ type: ACTION_TYPES.SET_CURRENT_PAGE, payload: page }),
    
    setTheme: (theme) => dispatch({ type: ACTION_TYPES.SET_THEME, payload: theme }),
    
    addNotification: (notification) => dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: notification }),
    
    removeNotification: (notificationId) => dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: notificationId }),
    
    flagIssue: async (issueId, reason) => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        const updatedIssue = await databaseService.flagIssue(issueId, reason);
        dispatch({ type: ACTION_TYPES.UPDATE_ISSUE, payload: updatedIssue });
        
        actions.addNotification({
          id: generateId(),
          type: 'info',
          title: 'Issue Flagged',
          message: 'Thank you for reporting this issue',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
        actions.addNotification({
          id: generateId(),
          type: 'error',
          title: 'Error',
          message: 'Failed to flag issue',
          timestamp: new Date().toISOString()
        });
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    },

    addComment: async (issueId, comment) => {
      try {
        const commentData = {
          ...comment,
          authorName: state.user.isAuthenticated 
            ? state.user.name 
            : (comment.authorName || 'Anonymous'),
          author_id: state.user.isAuthenticated ? state.user.id : null
        };
        
        await databaseService.addComment(issueId, commentData);
        // Reload the selected issue to get updated comments
        if (state.selectedIssue?.id === issueId) {
          const updatedIssue = await databaseService.getIssueById(issueId);
          dispatch({ type: ACTION_TYPES.SET_SELECTED_ISSUE, payload: updatedIssue });
        }
        
        actions.addNotification({
          id: generateId(),
          type: 'success',
          title: 'Comment Added',
          message: 'Your comment has been posted',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        actions.addNotification({
          id: generateId(),
          type: 'error',
          title: 'Error',
          message: 'Failed to add comment',
          timestamp: new Date().toISOString()
        });
      }
    }
  };

  // Initialize authentication and user location on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
        
        // Check for existing session
        const { user, profile } = await authService.getCurrentUser();
        if (user && profile) {
          dispatch({ 
            type: ACTION_TYPES.SET_USER_AUTH, 
            payload: {
              id: user.id,
              email: user.email,
              name: profile.name,
              role: profile.role
            }
          });
        }
        
        // Get user location
        try {
          const location = await getCurrentLocation();
          dispatch({ type: ACTION_TYPES.SET_USER_LOCATION, payload: location });
        } catch (error) {
          console.warn('Could not get user location:', error.message);
          // Set default location (Delhi) if geolocation fails
          dispatch({ 
            type: ACTION_TYPES.SET_USER_LOCATION, 
            payload: { lat: 28.6139, lng: 77.2090 } 
          });
        }
      } catch (error) {
        console.warn('Authentication check failed:', error);
      } finally {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { profile } = await authService.getCurrentUser();
        dispatch({ 
          type: ACTION_TYPES.SET_USER_AUTH, 
          payload: {
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || 'User',
            role: profile?.role || USER_ROLES.CITIZEN
          }
        });
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: ACTION_TYPES.LOGOUT_USER });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Initialize sample data and load issues when location is available
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize sample data if needed
        await initializeSampleData();
        
        // Load issues if we have location
        if (state.user.location) {
          const filters = {
            ...state.filters,
            userLocation: state.user.location
          };
          const issues = await databaseService.getIssues(filters);
          dispatch({ type: ACTION_TYPES.SET_ISSUES, payload: issues });
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
      }
    };

    if (state.user.location) {
      initializeApp();
    }
  }, [state.user.location]);

  const value = {
    state,
    actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
