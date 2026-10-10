import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (
    type: NotificationType,
    message: string,
  ) => void;
  removeNotification: (id: number) => void;
}

let nextNotificationId = 1;

export const useNotificationStore =
  create<NotificationState>((set) => ({
    notifications: [],

    addNotification: (type, message) => {
      const id = nextNotificationId++;

      set((state) => ({
        notifications: [
          ...state.notifications,
          { id, type, message },
        ],
      }));
    },

    removeNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter(
          (notification) => notification.id !== id,
        ),
      }));
    },
  }));

// Allow pages and services to trigger notifications directly.
export const notify = {
  success: (message: string) =>
    useNotificationStore
      .getState()
      .addNotification('success', message),

  error: (message: string) =>
    useNotificationStore
      .getState()
      .addNotification('error', message),

  info: (message: string) =>
    useNotificationStore
      .getState()
      .addNotification('info', message),
};