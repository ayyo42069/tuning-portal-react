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
import NotificationBell from "@/components/NotificationBell";
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
                  <XMarkIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Center - Logo */}
          <motion.div
            layout
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            transition={spring}
          >
            <Link href="/" className="flex items-center">
              <motion.span 
                className="text-lg font-semibold text-gray-900 dark:text-white"
                layout
              >
                Tuning Portal
              </motion.span>
            </Link>
          </motion.div>

          {/* Right side - Actions */}
          <motion.div
            layout
            className="flex items-center space-x-4"
            transition={spring}
          >
            {variant === "dashboard" && (
              <>
                <motion.div 
                  layout
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-gray-800/10"
                >
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.credits || 0} Credits
                  </span>
                </motion.div>
                <motion.button
                  layout
                  onClick={() => {
                    setIsExpanded(true);
                    setShowNotifications(true);
                  }}
                  className="relative p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BellIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  {notificationCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-red-500/20 border border-white/20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </motion.span>
                  )}
                </motion.button>
              </>
            )}
            <motion.div layout>
              <ThemeToggle />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={spring}
              className="border-t border-white/10 dark:border-gray-800/10"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ ...spring, delay: 0.1 }}
                className="p-4"
              >
                {showNotifications ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                      {notificationCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 rounded-md hover:bg-white/10 dark:hover:bg-blue-900/30 transition-colors duration-200"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[28rem] overflow-y-auto">
                      {notificationData.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No notifications
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {notificationData.map((notification: any) => (
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
                    <div className="text-center">
                      <Link
                        href="/dashboard/notifications"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 rounded-md hover:bg-white/10 dark:hover:bg-blue-900/30 transition-colors duration-200 inline-block"
                        onClick={() => {
                          setIsExpanded(false);
                          setShowNotifications(false);
                        }}
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                ) : variant === "dashboard" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Profile */}
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring, delay: 0.2 }}
                      className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-800/10"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {user?.username || "User"}
                          </h3>
                          <p className={`text-sm ${
                            user?.role === "admin" ? "text-red-500" : "text-green-500"
                          }`}>
                            {user?.role}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Navigation */}
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring, delay: 0.3 }}
                      className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-800/10"
                    >
                      <nav className="space-y-2">
                        <Link
                          href="/dashboard"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/dashboard" ? "bg-white/10 dark:bg-gray-800/10" : "hover:bg-white/5 dark:hover:bg-gray-800/5"
                          }`}
                        >
                          <Home className="h-5 w-5 mr-3" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/tuning-history"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/dashboard/tuning-history" ? "bg-white/10 dark:bg-gray-800/10" : "hover:bg-white/5 dark:hover:bg-gray-800/5"
                          }`}
                        >
                          <History className="h-5 w-5 mr-3" />
                          Tuning History
                        </Link>
                        <Link
                          href="/dashboard/credits"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/dashboard/credits" ? "bg-white/10 dark:bg-gray-800/10" : "hover:bg-white/5 dark:hover:bg-gray-800/5"
                          }`}
                        >
                          <CreditCard className="h-5 w-5 mr-3" />
                          Credits
                        </Link>
                        <Link
                          href="/dashboard/feedback"
                          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                            pathname === "/dashboard/feedback" ? "bg-white/10 dark:bg-gray-800/10" : "hover:bg-white/5 dark:hover:bg-gray-800/5"
                          }`}
                        >
                          <BadgeAlertIcon className="h-5 w-5 mr-3" />
                          Feedback History
                        </Link>
                        {user?.role === "admin" && (
                          <Link
                            href="/admin"
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                              pathname.startsWith("/admin") ? "bg-white/10 dark:bg-gray-800/10" : "hover:bg-white/5 dark:hover:bg-gray-800/5"
                            }`}
                          >
                            <Settings className="h-5 w-5 mr-3" />
                            Admin Panel
                          </Link>
                        )}
                      </nav>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring, delay: 0.4 }}
                      className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-800/10"
                    >
                      <div className="space-y-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          Logout
                        </button>
                        <Link
                          href="/help"
                          className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                        >
                          <HelpCircle className="h-5 w-5 mr-3" />
                          Help & Support
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Landing Page Navigation */}
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring, delay: 0.2 }}
                      className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-800/10"
                    >
                      <nav className="space-y-2">
                        <Link
                          href="/#features"
                          className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                        >
                          <Search className="h-5 w-5 mr-3 text-blue-500" />
                          Features
                        </Link>
                        <Link
                          href="/#pricing"
                          className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                        >
                          <CreditCard className="h-5 w-5 mr-3 text-green-500" />
                          Pricing
                        </Link>
                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                        >
                          <Home className="h-5 w-5 mr-3 text-purple-500" />
                          Dashboard
                        </Link>
                      </nav>
                    </motion.div>

                    {/* Auth Actions */}
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...spring, delay: 0.3 }}
                      className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-800/10"
                    >
                      <div className="space-y-2">
                        <Link
                          href="/auth/login"
                          className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
                        >
                          Login
                        </Link>
                        <Link
                          href="/auth/register"
                          className="flex items-center justify-center px-4 py-2 rounded-lg border border-white/20 dark:border-gray-800/20 hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                        >
                          Register
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 