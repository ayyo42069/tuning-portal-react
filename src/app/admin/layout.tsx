"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, FileText, Users, CreditCard, Bell, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  credits?: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          credentials: "include",
        });

        if (!response.ok) {
          router.push("/auth/login");
          return;
        }

        const data = await response.json();
        if (!data.user || data.user.role !== "admin") {
          router.push("/dashboard");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 min-h-screen bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Portal
              </h2>
            </div>

            {/* Back to dashboard button */}
            <Link
              href="/dashboard"
              className="flex items-center mb-8 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </Link>

            <nav className="space-y-1">
              <Link
                href="/admin"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <Home className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Dashboard
              </Link>
              <Link
                href="/admin/tuning-requests"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <FileText className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Tuning Requests
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <Users className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Users
              </Link>
              <Link
                href="/admin/credits"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <CreditCard className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Credits
              </Link>
              <Link
                href="/admin/notifications"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
              >
                <Bell className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                Notifications
              </Link>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Welcome,{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    {user?.username}
                  </span>
                </h1>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Credits:{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {user?.credits || 0}
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-4">
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
          </header>
          <div className="p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
