"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  History,
  CreditCard,
  Bell,
  Upload,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  HelpCircle,
  Search,
  ChevronDown,
  BadgeAlertIcon
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import EcuUploadForm from "./EcuUploadForm";

import { useAuth } from "@/lib/AuthProvider";
import { useNotifications as useNotificationsQuery } from "@/lib/hooks/useDataFetching";
import { useNotifications } from "@/lib/NotificationProvider";
import { 
  BellIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  CurrencyDollarIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useFeedback } from "@/lib/FeedbackProvider";

interface DynamicIslandProps {
  variant?: "dashboard" | "landing";
  children?: React.ReactNode;
}

export default function DynamicIsland({ variant = "dashboard", children }: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEcuUpload, setShowEcuUpload] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsQuery();
  const legacyNotifications = useNotifications();
  const { showFeedback } = useFeedback();

  const notificationData = notifications || legacyNotifications.notifications;
  const notificationCount = unreadCount || legacyNotifications.unreadCount;

  // Reset expanded state on pathname change
  useEffect(() => {
    setIsExpanded(false);
    setShowNotifications(false);
  }, [pathname]);

  // Handle scroll for glassmorphic effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showFeedback({
        type: "success",
        message: "Logged out successfully",
        duration: 3000
      });
    } catch (error) {
      console.error("Logout error:", error);
      showFeedback({
        type: "error",
        message: "Failed to logout. Please try again.",
        duration: 3000
      });
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      await markAsRead(notification.id);
      showFeedback({
        type: "success",
        message: "Notification marked as read",
        duration: 2000
      });
      setShowNotifications(false);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showFeedback({
        type: "error",
        message: "Failed to mark notification as read",
        duration: 3000
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showFeedback({
        type: "success",
        message: "All notifications marked as read",
        duration: 2000
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      showFeedback({
        type: "error",
        message: "Failed to mark all notifications as read",
        duration: 3000
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
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

  const spring = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 1
  };

  return (
    <motion.div
      layout
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50"
      transition={spring}
    >
      <motion.div
        layout
        style={{
          borderRadius: isExpanded ? "24px" : "9999px",
          overflow: "hidden"
        }}
        className={`w-full h-full border border-white/20 dark:border-gray-800/20 shadow-lg ${
          isScrolled ? "backdrop-blur-xl bg-white/10 dark:bg-gray-900/10" : "backdrop-blur-md bg-white/5 dark:bg-gray-900/5"
        }`}
        transition={spring}
      >
        {/* Header - Always visible */}
        <motion.div
          layout
          className="h-16 relative flex items-center justify-between px-4"
          transition={spring}
        >
          {/* Left side - Menu button */}
          <motion.button
            layout
            onClick={() => {
              setIsExpanded(!isExpanded);
              setShowNotifications(false);
            }}
            className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={spring}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isExpanded ? "close" : "menu"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isExpanded ? (
                  <X className="h-6 w-6 text-white" />
                ) : (
                  <Menu className="h-6 w-6 text-white" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Center - Title or children */}
          <motion.div
            layout
            className="flex-1 flex items-center justify-center"
            transition={spring}
          >
            {variant === "landing" ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowEcuUpload(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Upload ECU
                </button>
              </div>
            ) : (
              <motion.h1
                layout
                className="text-lg font-semibold text-white"
                transition={spring}
              >
                Dashboard
              </motion.h1>
            )}
          </motion.div>

          {/* Right side - Notifications */}
          <motion.div
            layout
            className="flex items-center gap-2"
            transition={spring}
          >
            {variant === "dashboard" && (
              <>
                <motion.button
                  layout
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setIsExpanded(false);
                  }}
                  className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={spring}
                >
                  <Bell className="h-6 w-6 text-white" />
                  {notificationCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {notificationCount}
                    </motion.div>
                  )}
                </motion.button>
                <ThemeToggle />
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={spring}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {variant === "dashboard" ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <Home className="h-5 w-5 text-white" />
                      <span className="text-white">Home</span>
                    </Link>
                    <Link
                      href="/dashboard/history"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <History className="h-5 w-5 text-white" />
                      <span className="text-white">History</span>
                    </Link>
                    <Link
                      href="/dashboard/credits"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <CreditCard className="h-5 w-5 text-white" />
                      <span className="text-white">Credits</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <Settings className="h-5 w-5 text-white" />
                      <span className="text-white">Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <LogOut className="h-5 w-5 text-white" />
                      <span className="text-white">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <Home className="h-5 w-5 text-white" />
                      <span className="text-white">Dashboard</span>
                    </Link>
                    <Link
                      href="/help"
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <HelpCircle className="h-5 w-5 text-white" />
                      <span className="text-white">Help</span>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications panel */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={spring}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  {notificationCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                {notificationData?.length > 0 ? (
                  <div className="space-y-2">
                    {notificationData.map((notification: any) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-3 rounded-lg ${
                          notification.read ? "bg-white/5" : "bg-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <p className="text-white">{notification.message}</p>
                            <p className="text-sm text-white/60">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={() => handleNotificationClick(notification)}
                              className="p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                              <CheckCircleIcon className="h-5 w-5 text-green-500" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-center py-4">No notifications</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ECU Upload Form */}
      <AnimatePresence>
        {showEcuUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-full max-w-md"
            >
              <EcuUploadForm onClose={() => setShowEcuUpload(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 