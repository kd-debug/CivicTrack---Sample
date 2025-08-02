import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { isWithinVisibilityRadius } from '../utils';

/**
 * Hook to get filtered issues based on user location and filters
 */
export const useFilteredIssues = () => {
    const { state } = useApp();
    const { issues, filters, user } = state;

    const filteredIssues = issues.filter(issue => {
        // Check if issue is hidden due to flags
        if (issue.isHidden) return false;

        // Check location visibility
        if (user.location && issue.location) {
            const isVisible = isWithinVisibilityRadius(
                user.location,
                issue.location,
                filters.distance
            );
            if (!isVisible) return false;
        }

        // Filter by status
        if (filters.status && issue.status !== filters.status) {
            return false;
        }

        // Filter by category
        if (filters.category && issue.category !== filters.category) {
            return false;
        }

        return true;
    });

    return filteredIssues;
};

/**
 * Hook to manage geolocation
 */
export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getCurrentPosition = () => {
        setLoading(true);
        setError(null);

        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                const error = 'Geolocation is not supported';
                setError(error);
                setLoading(false);
                reject(new Error(error));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        // Also keep the old format for compatibility
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    console.log('📍 Geolocation success:', locationData);
                    setLocation(locationData);
                    setLoading(false);
                    resolve(locationData);
                },
                (error) => {
                    console.error('📍 Geolocation error:', error);
                    setError(error.message);
                    setLoading(false);
                    reject(error);
                }, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    };

    return {
        location,
        error,
        loading,
        getCurrentPosition
    };
};

/**
 * Hook to manage file uploads with validation
 */
export const useFileUpload = (maxFiles = 3, maxSizeMB = 5) => {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [errors, setErrors] = useState([]);

    const addFile = (file) => {
        // Validate file
        if (!file.type.startsWith('image/')) {
            setErrors(prev => [...prev, 'Please select image files only']);
            return false;
        }

        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setErrors(prev => [...prev, `File size must be less than ${maxSizeMB}MB`]);
            return false;
        }

        if (files.length >= maxFiles) {
            setErrors(prev => [...prev, `Maximum ${maxFiles} files allowed`]);
            return false;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviews(prev => [...prev, {
                id: Date.now() + Math.random(),
                url: e.target.result,
                name: file.name
            }]);
        };
        reader.readAsDataURL(file);

        setFiles(prev => [...prev, file]);
        return true;
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const clearFiles = () => {
        setFiles([]);
        setPreviews([]);
        setErrors([]);
    };

    const clearErrors = () => {
        setErrors([]);
    };

    return {
        files,
        previews,
        errors,
        addFile,
        removeFile,
        clearFiles,
        clearErrors
    };
};

/**
 * Hook to manage local storage
 */
export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};

/**
 * Hook to manage notifications
 */
export const useNotifications = () => {
    const { state, actions } = useApp();
    const [permission, setPermission] = useState(Notification.permission);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async() => {
        if ('Notification' in window && permission === 'default') {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        }
        return permission;
    };

    const showNotification = (title, options = {}) => {
        if (permission === 'granted') {
            return new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });
        }
    };

    return {
        permission,
        notifications: state.user.notifications,
        requestPermission,
        showNotification,
        addNotification: actions.addNotification,
        removeNotification: actions.removeNotification
    };
};