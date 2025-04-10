"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useNotifications as useNotificationsQuery } from "@/lib/hooks/useDataFetching";
// Keep the old provider for backward compatibility
import { useNotifications, Notification } from "@/lib/NotificationProvider";

// Define interface for notifications from React Query hook to match the legacy provider
interface QueryNotification {
  id: number;
  title: string;
  message: string;
  type: "file_status" | "admin_message" | "credit_transaction" | "system";
  referenceId?: number;
  referenceType?: string;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  // Use the React Query hook for notifications
  const {
    data: notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isLoading,
  } = useNotificationsQuery();
  // Fallback to legacy provider if needed
  const legacyNotifications = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use React Query data if available, otherwise fall back to legacy provider
  const notificationData = notifications || legacyNotifications.notifications;
  const notificationCount = unreadCount || legacyNotifications.unreadCount;
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (
    notification: QueryNotification | Notification
  ) => {
    await markAsRead(notification.id);

    // Navigate based on notification type and reference
    if (notification.referenceId) {
      if (notification.type === "file_status") {
        router.push(`/dashboard/tuning-file/${notification.referenceId}`);
      } else if (notification.type === "credit_transaction") {
        router.push("/dashboard/credits");
      } else if (notification.type === "admin_message") {
        // If it's an admin message with a reference to a file
        if (notification.referenceType === "ecu_file") {
          router.push(`/dashboard/tuning-file/${notification.referenceId}`);
        }
      }
    }

    setIsOpen(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "file_status":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      case "admin_message":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        );
      case "credit_transaction":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      style={{ position: "relative", zIndex: 9999 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-white/10 dark:hover:bg-gray-700/80 transition-all duration-200 relative backdrop-blur-sm"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-red-500/20 border border-white/20">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden z-[10000] max-h-[28rem] flex flex-col border border-white/20 dark:border-gray-700/30"
            style={{
              position: "fixed",
              top: "4rem",
              right: "1rem",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="p-3 border-b border-white/20 dark:border-gray-700/30 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/30 dark:to-purple-900/30">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 rounded-md hover:bg-white/10 dark:hover:bg-blue-900/30 transition-colors duration-200"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-grow">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification: QueryNotification) => (
                    <li
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 cursor-pointer transition-colors duration-200 ${
                        !notification.isRead
                          ? "bg-blue-50/80 dark:bg-blue-900/30 border-l-4 border-blue-500"
                          : "border-l-4 border-transparent"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-2 border-t border-white/20 dark:border-gray-700/30 text-center bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/30 dark:to-purple-900/30">
              <Link
                href="/dashboard/notifications"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 rounded-md hover:bg-white/10 dark:hover:bg-blue-900/30 transition-colors duration-200 inline-block"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
