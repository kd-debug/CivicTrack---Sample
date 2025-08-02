import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './NotificationToast.css';

const NotificationToast = () => {
  const { state, actions } = useApp();
  const { user } = state;
  const notifications = user.notifications || [];

  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    const timeouts = notifications.map(notification => {
      if (notification.autoRemove !== false) {
        return setTimeout(() => {
          actions.removeNotification(notification.id);
        }, 5000);
      }
      return null;
    }).filter(Boolean);

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [notifications.length, actions]); // Only depend on length to avoid infinite re-renders

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      default:
        return 'toast-info';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.slice(0, 3).map((notification) => (
        <div
          key={notification.id}
          className={`notification-toast ${getTypeClass(notification.type)}`}
        >
          <div className="toast-icon">
            {getIcon(notification.type)}
          </div>
          <div className="toast-content">
            <div className="toast-title">{notification.title}</div>
            <div className="toast-message">{notification.message}</div>
          </div>
          <button
            className="toast-close"
            onClick={() => actions.removeNotification(notification.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
