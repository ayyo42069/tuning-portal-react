"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import OpeningHours from "@/components/OpeningHours";
import { useAuth, useSessionTerminationCheck } from "@/lib/AuthProvider";

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
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();

  // Use the session termination check hook to detect terminated sessions in real-time
  //useSessionTerminationCheck();

  // Check if user is authenticated, redirect if not
  useEffect(() => {
    if (!isLoading && !user) {
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
  // No need to fetch user data separately as it's now provided by the AuthProvider

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col md:flex-row">
        {/* Mobile menu button */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Sidebar */}
        <div
          id="sidebar"
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:static z-40 w-72 min-h-screen bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out`}
        >
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tuning Portal
              </h2>
            </div>

            {/* User Profile Section */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    {user?.username}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.credits} Credits
                  </div>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
              >
                <Home className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/tuning-history"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
              >
                <History className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Tuning History
              </Link>
              <Link
                href="/dashboard/credits"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
              >
                <CreditCard className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Credits
              </Link>
              <Link
                href="/dashboard/notifications"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
              >
                <Bell className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Notifications
              </Link>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  onClick={() =>
                    window.innerWidth < 768 && setSidebarOpen(false)
                  }
                >
                  <Settings className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  Admin Portal
                </Link>
              )}
            </nav>

            {/* Opening Hours Component */}
            <OpeningHours />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-0 w-full">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow pt-16 md:pt-0">
            <div className="max-w-7xl mx-auto py-4 md:py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="hidden md:flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold mr-3">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Welcome,{" "}
                        <span className="text-blue-600 dark:text-blue-400">
                          {user?.username}
                        </span>
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg flex items-center">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {user?.credits ?? 0} Credits
                    </span>
                  </div>
                  <NotificationBell />
                  <ThemeToggle />
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </header>
          <div className="p-4 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
