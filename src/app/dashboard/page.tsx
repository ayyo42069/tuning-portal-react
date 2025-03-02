"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ECUUploadForm from "./components/ECUUploadForm";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import { PlusCircle, ChevronRight, History, CreditCard, BarChart3, Clock, LogOut, Upload } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  credits?: number;
}

interface TuningFile {
  id: number;
  file_name: string;
  vehicle_info: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  tuning_options: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [recentFiles, setRecentFiles] = useState<TuningFile[]>([]);

  useEffect(() => {
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        console.log("Fetching user profile data...");
        const response = await fetch("/api/user/profile", {
          // Include credentials to ensure cookies are sent
          credentials: "include",
        });

        console.log("Profile API response status:", response.status);

        if (!response.ok) {
          // If not authenticated, redirect to login
          if (response.status === 401) {
            console.log("Authentication failed (401), redirecting to login");
            router.push("/auth/login");
            return;
          }
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const data = await response.json();
        console.log("User data retrieved successfully");
        setUser(data.user);

        // Fetch recent tuning files
        const filesResponse = await fetch("/api/tuning/history", {
          credentials: "include",
        });

        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          setRecentFiles(filesData.tuningFiles.slice(0, 5)); // Get only the 5 most recent files
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Redirect to login on error instead of using mock data
        console.log("Redirecting to login due to error");
        router.push("/auth/login");
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300">
              Welcome, {user?.username}
            </span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Credits: {user?.credits || 0}
            </span>
            <NotificationBell />
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <PlusCircle className="w-6 h-6 mr-2 text-blue-500" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowUploadForm(!showUploadForm)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                  >
                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                      {showUploadForm
                        ? "Hide Upload Form"
                        : "Upload New ECU File"}
                    </span>
                    <ChevronRight className="w-5 h-5 text-blue-500" />
                  </button>

                  <Link
                    href="/dashboard/tuning-history"
                    className="w-full flex items-center justify-between px-4 py-3 bg-green-50 dark:bg-green-900/50 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                  >
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      View Tuning History
                    </span>
                    <History className="w-5 h-5 text-green-500" />
                  </Link>

                  <Link
                    href="/dashboard/credits"
                    className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors duration-200"
                  >
                    <span className="text-purple-700 dark:text-purple-300 font-medium">
                      Manage Credits
                    </span>
                    <CreditCard className="w-5 h-5 text-purple-500" />
                  </Link>

                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="w-full flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/50 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200"
                    >
                      <span className="text-red-700 dark:text-red-300 font-medium">
                        Admin Panel
                      </span>
                      <ChevronRight className="w-5 h-5 text-red-500" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-indigo-500" />
                  Your Stats
                </h3>
                <div className="space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/50 rounded-lg p-4">
                    <div className="text-sm text-indigo-600 dark:text-indigo-300">
                      Available Credits
                    </div>
                    <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-200">
                      {user?.credits || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-yellow-500" />
                  Recent Activity
                </h3>
                {recentFiles.length > 0 ? (
                  <div className="space-y-3">
                    {recentFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div
                              className="font-medium text-gray-800 dark:text-gray-200 truncate"
                              style={{ maxWidth: "180px" }}
                            >
                              {file.file_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {file.vehicle_info}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(file.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs leading-4 font-semibold rounded-full ${getStatusBadgeClass(
                              file.status
                            )}`}
                          >
                            {file.status.charAt(0).toUpperCase() +
                              file.status.slice(1)}
                          </span>
                        </div>
                        {file.tuning_options && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Options:</span>{" "}
                            {file.tuning_options}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="text-center mt-4">
                      <Link
                        href="/dashboard/tuning-history"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                      >
                        View All Activity
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400">
                      No recent activity found.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ECU Upload Form - Conditionally rendered */}
          {showUploadForm && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Upload className="w-6 h-6 mr-2 text-blue-500" />
                  Upload ECU File
                </h3>
                <ECUUploadForm />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
