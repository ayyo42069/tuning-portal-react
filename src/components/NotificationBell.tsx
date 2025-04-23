"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications as useNotificationsQuery } from "@/lib/hooks/useDataFetching";
// Keep the old provider for backward compatibility
import { useNotifications, Notification } from "@/lib/NotificationProvider";
import { 
  BellIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  CurrencyDollarIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

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
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case "admin_message":
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500" />;
      case "credit_transaction":
        return <CurrencyDollarIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-700/80 transition-all duration-200 backdrop-blur-sm"
        aria-label="Notifications"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <BellIcon className="w-5 h-5" />
        </motion.div>

        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-red-500/20 border border-white/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 mt-2 w-80 bg-white/10 dark:bg-gray-900/20 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden z-50 border border-white/20 dark:border-gray-700/30"
          >
            <div className="p-4 border-b border-white/20 dark:border-gray-700/30 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/30 dark:to-purple-900/30">
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

            <div className="max-h-[28rem] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification: QueryNotification) => (
                    <motion.li
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className={`p-4 hover:bg-gray-50/80 dark:hover:bg-gray-700/80 cursor-pointer transition-colors duration-200 ${
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
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 border-t border-white/20 dark:border-gray-700/30 text-center bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-900/30 dark:to-purple-900/30">
              <Link
                href="/dashboard/notifications"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 rounded-md hover:bg-white/10 dark:hover:bg-blue-900/30 transition-colors duration-200 inline-block"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
