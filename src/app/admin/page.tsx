"use client";

import { useState, useEffect } from "react";
import { FileText, Users, CreditCard, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AdminStats {
  pendingRequests: number;
  totalUsers: number;
  totalCredits: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    pendingRequests: 0,
    totalUsers: 0,
    totalCredits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/stats", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            router.push("/auth/login");
            return;
          }
          throw new Error(`Failed to fetch admin stats: ${response.status}`);
        }

        const data = await response.json();
        setStats({
          pendingRequests: data.pendingRequests || 0,
          totalUsers: data.totalUsers || 0,
          totalCredits: data.totalCredits || 0,
        });
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load admin statistics. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading admin statistics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to the tuning portal admin area
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Pending Requests
                </p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.pendingRequests}
                </h4>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(stats.pendingRequests * 5, 100)}%`,
                }}
              ></div>
            </div>
            <div className="mt-4">
              <a
                href="/admin/tuning-requests"
                className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                View all requests
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Users
                </p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalUsers}
                </h4>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${Math.min(stats.totalUsers, 100)}%` }}
              ></div>
            </div>
            <div className="mt-4">
              <a
                href="/admin/users"
                className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
              >
                Manage users
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Credits
                </p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalCredits}
                </h4>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md">
                <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${Math.min((stats.totalCredits / 1000) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <div className="mt-4">
              <a
                href="/admin/credits"
                className="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
              >
                View credit history
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Admin Actions Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="/admin/tuning-requests"
                className="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
              >
                <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-800 mr-3">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                    Manage Requests
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Review pending tunes
                  </p>
                </div>
              </a>
              <a
                href="/admin/users"
                className="flex items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
              >
                <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-800 mr-3">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                    User Management
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Manage user accounts
                  </p>
                </div>
              </a>
              <a
                href="/admin/credits"
                className="flex items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
              >
                <div className="p-2 rounded-md bg-green-100 dark:bg-green-800 mr-3">
                  <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                    Credit Management
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Manage user credits
                  </p>
                </div>
              </a>
              <a
                href="/admin/security"
                className="flex items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
              >
                <div className="p-2 rounded-md bg-red-100 dark:bg-red-800 mr-3">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                    Security Center
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Monitor system security
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              System Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Server Load
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Normal
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "25%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Database
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Healthy
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: "15%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Storage
                  </span>
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    65% Used
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    API Requests
                  </span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Normal
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "40%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
