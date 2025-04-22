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

  const spring = {
    type: "spring",
    stiffness: 500,
    damping: 30,
    mass: 1
  };

  return (
    <motion.div
      layout
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 ${
        isScrolled ? "backdrop-blur-xl bg-white/10 dark:bg-gray-900/10" : "backdrop-blur-md bg-white/5 dark:bg-gray-900/5"
      }`}
      transition={spring}
    >
      <motion.div
        layout
        className="w-full h-full border border-white/20 dark:border-gray-800/20 shadow-lg overflow-hidden"
        style={{
          borderRadius: isExpanded ? "24px" : "9999px",
        }}
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
            onClick={() => setIsExpanded(!isExpanded)}
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
                  <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
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
                <motion.div layout>
                  <NotificationBell />
                </motion.div>
              </>
            )}
            <motion.div layout>
              <ThemeToggle />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Expanded Content */}
        <AnimatePresence mode="sync">
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
                {/* Rest of the expanded content */}
                {children}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 