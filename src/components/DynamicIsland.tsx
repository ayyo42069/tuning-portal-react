"use client";

import { useState, useEffect, useRef } from "react";
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
  BadgeAlertIcon,
  FileText,
  MessageSquare,
  Shield,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import EcuUploadForm from "./EcuUploadForm";
import { useDynamicIsland } from "@/lib/context/DynamicIslandContext";
import { useAuth } from "@/lib/AuthProvider";
import { useNotifications as useNotificationsQuery } from "@/lib/hooks/useDataFetching";
import { useFeedback } from "@/contexts/FeedbackContext";
import { useRouter } from "next/navigation";
import { 
  BellIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  CurrencyDollarIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

// Animation constants
const spring = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 1
};

const hoverSpring = {
  type: "spring",
  stiffness: 400,
  damping: 25,
  mass: 0.8
};

const scaleSpring = {
  type: "spring",
  stiffness: 300,
  damping: 20,
  mass: 0.5
};

interface DynamicIslandProps {
  variant?: "dashboard" | "landing" | "auth" | "default";
  status?: "idle" | "loading" | "success" | "error";
  progress?: number;
  message?: string;
  children?: React.ReactNode;
  onExpand?: () => void;
  isExpanded?: boolean;
}

export default function DynamicIsland({
  variant = "default",
  status = "idle",
  progress = 0,
  message = "",
  children,
  onExpand,
  isExpanded = false
}: DynamicIslandProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [localIsExpanded, setLocalIsExpanded] = useState(isExpanded);
  const islandRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsQuery();
  const { showFeedback } = useFeedback();
  const { state, actions, showUploadForm, closeUploadForm } = useDynamicIsland();
  const router = useRouter();

  // Update local state when prop changes
  useEffect(() => {
    setLocalIsExpanded(isExpanded);
  }, [isExpanded]);

  // Reset expanded state on pathname change
  useEffect(() => {
    setLocalIsExpanded(false);
    setShowNotifications(false);
    if (pathname === "/dashboard") {
      showFeedback("Welcome to your dashboard", "info");
    }
  }, [pathname, showFeedback]);

  // Handle scroll for glassmorphic effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(event.target as Node)) {
        setLocalIsExpanded(false);
        setShowNotifications(false);
        closeUploadForm();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeUploadForm]);

  const handleLogout = async () => {
    try {
      await logout();
      showFeedback("Successfully logged out", "success");
      router.push("/auth/login");
    } catch (error) {
      showFeedback("Failed to log out", "error");
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark as read
      await markAsRead(notification.id);
      showFeedback("Notification marked as read", "success");
      
      // Navigate to the relevant page
      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      showFeedback("Failed to mark notification as read", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showFeedback("All notifications marked as read", "success");
    } catch (error) {
      showFeedback("Failed to mark all notifications as read", "error");
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

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "success":
        return <Check className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "loading":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Auth variant
  if (variant === "auth") {
    return (
      <motion.div
        layout
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50"
        transition={spring}
        data-dynamic-island
      >
        <motion.div
          layout
          style={{
            borderRadius: localIsExpanded ? "24px" : "9999px",
            overflow: "hidden"
          }}
          className={`w-full h-full border border-white/20 dark:border-gray-800/20 shadow-lg ${
            isScrolled 
              ? "backdrop-blur-xl bg-white/10 dark:bg-gray-900/10" 
              : "backdrop-blur-md bg-white/5 dark:bg-gray-900/5"
          }`}
          transition={spring}
        >
          {/* Header - Always visible */}
          <motion.div
            layout
            className="h-16 relative flex items-center justify-between px-4"
            transition={spring}
          >
            {/* Left side - Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-white">Tuning Portal</span>
            </Link>

            {/* Right side - Navigation */}
            <div className="flex items-center space-x-4">
              <Link
                href="/about"
                className="text-white/70 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-white/70 hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-white/70 hover:text-white transition-colors"
              >
                Terms
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Landing page variant
  if (variant === "landing") {
    return (
      <motion.div
        layout
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50"
        transition={spring}
        data-dynamic-island
      >
        <motion.div
          layout
          style={{
            borderRadius: localIsExpanded ? "24px" : "9999px",
            overflow: "hidden"
          }}
          className={`w-full h-full border border-white/20 dark:border-gray-800/20 shadow-lg ${
            isScrolled 
              ? "backdrop-blur-xl bg-white/10 dark:bg-gray-900/10" 
              : "backdrop-blur-md bg-white/5 dark:bg-gray-900/5"
          }`}
          transition={spring}
        >
          {/* Header - Always visible */}
          <motion.div
            layout
            className="h-16 relative flex items-center justify-between px-4"
            transition={spring}
          >
            {/* Left side - Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Tuning Portal</span>
            </Link>

            {/* Right side - Navigation */}
            <div className="flex items-center space-x-4">
              <Link
                href="/about"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Terms
              </Link>
              <ThemeToggle />
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  // Dashboard variant
  return (
    <motion.div
      ref={islandRef}
      layout
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50"
      transition={spring}
      data-dynamic-island
    >
      <motion.div
        layout
        style={{
          borderRadius: localIsExpanded ? "24px" : "9999px",
          overflow: "hidden"
        }}
        className={`w-full h-full border border-white/20 dark:border-gray-800/20 shadow-lg ${
          isScrolled 
            ? "backdrop-blur-xl bg-white/10 dark:bg-gray-900/10" 
            : "backdrop-blur-md bg-white/5 dark:bg-gray-900/5"
        }`}
        transition={spring}
      >
        {/* Header - Always visible */}
        <motion.div
          layout
          className="h-16 relative flex items-center justify-between px-4"
          transition={spring}
        >
          {/* Left side - Menu button and Progress */}
          <div className="flex items-center space-x-4">
            <motion.button
              layout
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={hoverSpring}
              onClick={() => {
                setLocalIsExpanded(!localIsExpanded);
                setShowNotifications(false);
                if (showUploadForm) {
                  closeUploadForm();
                }
              }}
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
            >
              {localIsExpanded ? (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 180 }}
                  transition={spring}
                >
                  <X className="h-6 w-6 text-gray-900 dark:text-white" />
                </motion.div>
              ) : (
                <Menu className="h-6 w-6 text-gray-900 dark:text-white" />
              )}
            </motion.button>
          </div>

          {/* Center - Title */}
          <motion.div
            layout
            className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2"
            transition={spring}
          >
            <motion.span
              key={showUploadForm ? "upload" : showNotifications ? "notifications" : "dashboard"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring}
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {showUploadForm ? "Upload ECU File" : showNotifications ? "Notifications" : "Dashboard"}
            </motion.span>
          </motion.div>

          {/* Right side - Actions */}
          <motion.div
            layout
            className="flex items-center space-x-2"
            transition={spring}
          >
            <ThemeToggle />
            {/* Context-aware actions */}
            {actions.map((action, index) => (
              action.condition ? action.condition() && (
                <motion.button
                  key={index}
                  layout
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={hoverSpring}
                  onClick={() => {
                    action.action();
                    if (action.label === "New Upload") {
                      setLocalIsExpanded(true);
                    }
                  }}
                  className={`p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors ${action.color}`}
                  title={action.tooltip}
                >
                  {action.icon}
                </motion.button>
              ) : (
                <motion.button
                  key={index}
                  layout
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={hoverSpring}
                  onClick={() => {
                    action.action();
                    if (action.label === "New Upload") {
                      setLocalIsExpanded(true);
                    }
                  }}
                  className={`p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors ${action.color}`}
                  title={action.tooltip}
                >
                  {action.icon}
                </motion.button>
              )
            ))}
            <motion.button
              layout
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={hoverSpring}
              onClick={() => {
                if (showNotifications) {
                  setShowNotifications(false);
                  setLocalIsExpanded(false);
                } else {
                  setLocalIsExpanded(true);
                  setShowNotifications(true);
                  if (showUploadForm) {
                    closeUploadForm();
                  }
                }
              }}
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors relative"
            >
              <Bell className="h-6 w-6 text-gray-900 dark:text-white" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={scaleSpring}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Expanded content */}
        <AnimatePresence mode="wait">
          {localIsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={spring}
              className="overflow-hidden"
            >
              {showUploadForm ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={spring}
                  className="p-4"
                >
                  <EcuUploadForm onClose={() => {
                    closeUploadForm();
                    setLocalIsExpanded(false);
                  }} />
                </motion.div>
              ) : showNotifications ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={spring}
                  className="p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  {notifications && notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification: any) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-lg ${
                            notification.is_read
                              ? "bg-gray-50 dark:bg-gray-800"
                              : "bg-blue-50 dark:bg-blue-900/20"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!notification.is_read && (
                                <button
                                  onClick={() => handleNotificationClick(notification)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                  title="Mark as read"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                              )}
                              {notification.type === "file_status" && notification.reference_id && (
                                <button
                                  onClick={() => handleNotificationClick(notification)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                  title="View details"
                                >
                                  <FileText className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No notifications
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={spring}
                  className="p-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {/* User Profile Section */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={hoverSpring}
                      className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-800/10"
                    >
                      <div className="flex items-center space-x-4 mb-4">
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
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Credits</span>
                          <span className="font-medium text-gray-900 dark:text-white">{user?.credits || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Email</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
                            {user?.email_verified ? (
                              <span className="text-green-500">✓</span>
                            ) : (
                              <span className="text-yellow-500">!</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Last Login</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user?.last_login_date ? new Date(user.last_login_date).toLocaleDateString() : "Never"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Member Since</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user?.registration_date ? new Date(user.registration_date).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Quick Actions Section */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={hoverSpring}
                      className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-800/10"
                    >
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Actions</h3>
                      <div className="space-y-2">
                        {actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              action.action();
                              if (action.label === "New Upload") {
                                setLocalIsExpanded(true);
                              }
                            }}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors w-full"
                          >
                            <span className={action.color}>{action.icon}</span>
                            <span className="text-gray-900 dark:text-white">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Navigation Section */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={hoverSpring}
                      className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-800/10"
                    >
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Navigation</h3>
                      <nav className="space-y-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                        >
                          <Home className="h-5 w-5 text-blue-500" />
                          <span className="text-gray-900 dark:text-white">Dashboard</span>
                        </Link>
                        <Link
                          href="/dashboard/tuning-history"
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-purple-500" />
                          <span className="text-gray-900 dark:text-white">My Files</span>
                        </Link>
                        <Link
                          href="/dashboard/credits"
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                        >
                          <CreditCard className="h-5 w-5 text-green-500" />
                          <span className="text-gray-900 dark:text-white">Credits</span>
                        </Link>
                        <Link
                          href="/dashboard/feedback"
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                        >
                          <MessageSquare className="h-5 w-5 text-orange-500" />
                          <span className="text-gray-900 dark:text-white">Feedback</span>
                        </Link>
                        {user?.role === "admin" && (
                          <Link
                            href="/admin"
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                          >
                            <Shield className="h-5 w-5 text-indigo-500" />
                            <span className="text-gray-900 dark:text-white">Admin Panel</span>
                          </Link>
                        )}
                      </nav>
                    </motion.div>

                    {/* Account Section */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={hoverSpring}
                      className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm border border-white/10 dark:border-gray-800/10"
                    >
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Account</h3>
                      <div className="space-y-2">
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
                        >
                          <User className="h-5 w-5 text-cyan-500" />
                          <span className="text-gray-900 dark:text-white">Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-colors w-full"
                        >
                          <LogOut className="h-5 w-5 text-red-500" />
                          <span className="text-red-500">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 