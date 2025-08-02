import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
    size = 'medium', 
    color = 'primary', 
    text = 'Loading...', 
    fullScreen = false,
    className = '' 
}) => {
    const spinnerClass = `loading-spinner ${size} ${color} ${fullScreen ? 'fullscreen' : ''} ${className}`;

    if (fullScreen) {
        return (
            <div className="loading-overlay">
                <div className="loading-content">
                    <Loader2 className="spinner-icon" />
                    <p className="loading-text">{text}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={spinnerClass}>
            <Loader2 className="spinner-icon" />
            {text && <span className="loading-text">{text}</span>}
        </div>
    );
};

export default LoadingSpinner;
