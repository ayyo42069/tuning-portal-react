'use client';

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
import OpeningHours from "@/components/OpeningHours";
import { useAuth } from "@/lib/AuthProvider";
import FloatingTicketButton from "@/components/FloatingTicketButton";
import DashboardDebug from "./components/DashboardDebug";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  credits: number;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check if user is authenticated, redirect if not
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("[DashboardLayout] No user found, redirecting to login");
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Debug component */}
      <DashboardDebug />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Menu */}
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link href="/dashboard" className="ml-4 flex items-center">
                <img src="/images/logo.png" alt="Tuning Portal Logo" className="h-8 w-8" />
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Tuning Portal</span>
              </Link>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.credits || 0} Credits
                </span>
              </div>
              
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Notifications"
              >
                <NotificationBell />
              </button>
              
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle theme"
              >
                <ThemeToggle />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          id="sidebar"
          className={`fixed md:static z-40 w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* User info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="ml-4">
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
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                pathname === "/dashboard"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/tuning-history"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                pathname === "/dashboard/tuning-history"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <History className="h-5 w-5 mr-3" />
              Tuning History
            </Link>
            <Link
              href="/dashboard/credits"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                pathname === "/dashboard/credits"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <CreditCard className="h-5 w-5 mr-3" />
              Credits
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Admin Panel
              </Link>
            )}
            <div className="px-4 py-3">
              <OpeningHours />
            </div>
          </nav>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* Floating ticket button */}
      <FloatingTicketButton />
    </div>
  );
} 