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
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { useAuth } from "@/lib/AuthProvider";

interface DynamicIslandProps {
  variant?: "dashboard" | "landing";
  children?: React.ReactNode;
}

export default function DynamicIsland({ variant = "dashboard", children }: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const containerVariants = {
    collapsed: {
      height: "64px",
      borderRadius: "9999px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    expanded: {
      height: "auto",
      borderRadius: "24px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 ${
        isScrolled ? "backdrop-blur-xl bg-white/10 dark:bg-gray-900/10" : "backdrop-blur-md bg-white/5 dark:bg-gray-900/5"
      } border border-white/20 dark:border-gray-800/20 shadow-lg`}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={containerVariants}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">TP</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Tuning Portal</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {variant === "dashboard" && (
            <>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-gray-800/10">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.credits || 0} Credits
                </span>
              </div>
              <button className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors">
                <NotificationBell />
              </button>
            </>
          )}
          <button className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors">
            <ThemeToggle />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="p-4 border-t border-white/10 dark:border-gray-800/10"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={contentVariants}
          >
            {variant === "dashboard" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Profile */}
                <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5">
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
                </div>

                {/* Navigation */}
                <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5">
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
                </div>

                {/* Quick Actions */}
                <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5">
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
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Landing Page Navigation */}
                <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5">
                  <nav className="space-y-2">
                    <Link
                      href="/features"
                      className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                    >
                      Features
                    </Link>
                    <Link
                      href="/pricing"
                      className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                    >
                      Contact
                    </Link>
                  </nav>
                </div>

                {/* Auth Actions */}
                <div className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5">
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
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 