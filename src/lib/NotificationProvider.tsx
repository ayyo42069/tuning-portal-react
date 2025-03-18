"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type NotificationType =
  | "file_status"
  | "admin_message"
  | "credit_transaction"
  | "system";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: number;
  referenceType?: string;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch notifications on component mount only if user is authenticated
  useEffect(() => {
    // Check if auth token exists before fetching notifications
    const checkAuthAndFetch = async () => {
      try {
        // Try to get current user info to verify authentication
        const authResponse = await fetch("/api/auth/me", {
          credentials: "include",
        });

        // Only fetch notifications if user is authenticated
        if (authResponse.ok) {
          fetchNotifications();

          // Set up polling for new notifications every 30 seconds
          const intervalId = setInterval(() => {
            fetchNotifications();
          }, 30000);

          return () => clearInterval(intervalId);
        }
        // Silently return for unauthenticated users without logging
      } catch (error) {
        // Only log critical errors
        console.error("Authentication check failed:", error);
      }
    };

    checkAuthAndFetch();
  }, []);

  // Calculate unread count whenever notifications change
  useEffect(() => {
    setUnreadCount(
      notifications.filter((notification) => !notification.isRead).length
    );
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined") return;

      // Attempt to fetch notifications
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      } else if (response.status === 401) {
        // User is not authenticated, clear any existing notifications
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Clear notifications on error to prevent showing stale data
      setNotifications([]);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Function to add a client-side notification (for real-time updates)
  const addNotification = (
    notification: Omit<Notification, "id" | "createdAt" | "isRead">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(), // Temporary ID until server sync
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
