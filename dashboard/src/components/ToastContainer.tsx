import { useEffect } from 'react';

import {
  useNotificationStore,
  type Notification,
} from '../stores/notification.store';

import './ToastContainer.css';

function ToastItem({
  notification,
}: {
  notification: Notification;
}) {
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification,
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [notification.id, removeNotification]);

  const icon = {
    success: '✓',
    error: '!',
    info: 'i',
  }[notification.type];

  return (
    <div
      className={`toast toast-${notification.type}`}
      role={notification.type === 'error' ? 'alert' : 'status'}
    >
      <span className="toast-icon" aria-hidden="true">
        {icon}
      </span>

      <p className="toast-message">
        {notification.message}
      </p>

      <button
        type="button"
        className="toast-close"
        aria-label="Dismiss notification"
        onClick={() => removeNotification(notification.id)}
      >
        ×
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const notifications = useNotificationStore(
    (state) => state.notifications,
  );

  return (
    <div className="toast-container" aria-label="Notifications">
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
}