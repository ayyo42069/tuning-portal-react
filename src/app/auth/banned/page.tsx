"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogIn, HelpCircle, Calendar } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";

export default function BannedAccount() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Format ban expiry date if available
  const formatExpiryDate = (dateString: string | undefined) => {
    if (!dateString) return "Permanent";

    const expiryDate = new Date(dateString);
    const now = new Date();

    // Check if ban has expired
    if (expiryDate < now) {
      return "Expired";
    }

    // Format the date
    return expiryDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate time remaining until ban expires
  const getTimeRemaining = (dateString: string | undefined) => {
    if (!dateString) return "";

    const expiryDate = new Date(dateString);
    const now = new Date();

    // Check if ban has expired
    if (expiryDate < now) {
      return "";
    }

    const diffMs = expiryDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (diffDays > 0) {
      return `${diffDays} day${
        diffDays !== 1 ? "s" : ""
      } and ${diffHours} hour${diffHours !== 1 ? "s" : ""} remaining`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} remaining`;
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  // Redirect if user is not banned
  useEffect(() => {
    if (user && !user.is_banned) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-extrabold text-gray-900 dark:text-white">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            Account Banned
          </div>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {user?.ban_reason ? (
              <>
                Reason: {user.ban_reason}
                <br />
                {user.ban_expires_at ? (
                  <>
                    Your ban will expire on:{" "}
                    {new Date(user.ban_expires_at).toLocaleString()}
                  </>
                ) : (
                  "This is a permanent ban."
                )}
              </>
            ) : (
              "Your account has been banned from the platform."
            )}
          </p>

          {user && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="font-medium text-red-800 dark:text-red-200">
                Reason: {user.ban_reason || "Violation of terms of service"}
              </p>

              <div className="mt-2 flex items-center justify-center text-sm text-red-700 dark:text-red-300">
                <Calendar className="h-4 w-4 mr-1" />
                Ban expires: {formatExpiryDate(user.ban_expires_at)}
              </div>

              {user.ban_expires_at &&
                new Date(user.ban_expires_at) > new Date() && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {getTimeRemaining(user.ban_expires_at)}
                  </p>
                )}
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you believe this was done in error, please contact our support
            team.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md flex items-center transition-colors"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Return to Login
          </button>
          <button
            onClick={() => router.push("/support")}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded-md flex items-center transition-colors"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
