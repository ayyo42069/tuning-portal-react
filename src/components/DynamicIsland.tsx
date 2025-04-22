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

  // Reset expanded state on pathname change
  useEffect(() => {
    setIsExpanded(false);
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
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      },
    },
    expanded: {
      height: "auto",
      borderRadius: "24px",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      },
    },
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }
    },
  };

  return (
    <motion.div
      key={variant}
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 ${
        isScrolled ? "backdrop-blur-xl bg-white/10 dark:bg-gray-900/10" : "backdrop-blur-md bg-white/5 dark:bg-gray-900/5"
      }`}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={containerVariants}
    >
      <motion.div
        className="w-full h-full border border-white/20 dark:border-gray-800/20 shadow-lg"
        initial={{ borderRadius: "9999px" }}
        animate={isExpanded ? { borderRadius: "24px" } : { borderRadius: "9999px" }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.8,
        }}
      >
        {/* Header */}
        <motion.div 
          className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} p-4 relative`}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left side - Menu button and Logo */}
          <motion.div 
            className={`flex items-center space-x-4 ${isExpanded ? '' : 'absolute left-4'}`}
          >
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? (
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </motion.button>
          </motion.div>

          {/* Center - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <motion.span 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 0.8,
                }}
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                Tuning Portal
              </motion.span>
            </Link>
          </div>

          {/* Right side - Actions */}
          <motion.div 
            className={`flex items-center space-x-4 ${isExpanded ? '' : 'absolute right-4'}`}
          >
            {variant === "dashboard" && (
              <>
                <motion.div 
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-gray-800/10"
                  variants={itemVariants}
                >
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user?.credits || 0} Credits
                  </span>
                </motion.div>
                <motion.div 
                  className="relative"
                  variants={itemVariants}
                >
                  <NotificationBell />
                </motion.div>
              </>
            )}
            <motion.button 
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-gray-800/10 transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ThemeToggle />
            </motion.button>
          </motion.div>
        </motion.div>

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
                  <motion.div 
                    className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5"
                    variants={itemVariants}
                  >
                    <nav className="space-y-2">
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/#features"
                          className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                        >
                          <Search className="h-5 w-5 mr-3 text-blue-500" />
                          Features
                        </Link>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/#pricing"
                          className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                        >
                          <CreditCard className="h-5 w-5 mr-3 text-green-500" />
                          Pricing
                        </Link>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-2 rounded-lg hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                        >
                          <Home className="h-5 w-5 mr-3 text-purple-500" />
                          Dashboard
                        </Link>
                      </motion.div>
                    </nav>
                  </motion.div>

                  {/* Auth Actions */}
                  <motion.div 
                    className="p-4 rounded-xl bg-white/5 dark:bg-gray-800/5"
                    variants={itemVariants}
                  >
                    <div className="space-y-2">
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/auth/login"
                          className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
                        >
                          Login
                        </Link>
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Link
                          href="/auth/register"
                          className="flex items-center justify-center px-4 py-2 rounded-lg border border-white/20 dark:border-gray-800/20 hover:bg-white/5 dark:hover:bg-gray-800/5 transition-colors"
                        >
                          Register
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 