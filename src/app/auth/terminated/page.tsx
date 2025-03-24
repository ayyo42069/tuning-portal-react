"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, LogIn, HelpCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { executeQuery } from "@/lib/db";

export default function TerminatedSession() {
  const router = useRouter();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Clear all authentication state when the terminated page loads
  useEffect(() => {
    // Prevent redirect loops by checking if we've already attempted logout
    const hasAttemptedLogout = localStorage.getItem("logout_attempted");

    if (!hasAttemptedLogout) {
      // Set flag to prevent redirect loops
      localStorage.setItem("logout_attempted", "true");

      // Clear local storage auth state
      localStorage.removeItem("auth_state");

      // Use server-side logout to properly clear HttpOnly cookies
      const performServerLogout = async () => {
        setIsLoggingOut(true);
        try {
          const response = await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            console.error("Failed to logout properly");
          }
        } catch (error) {
          console.error("Error during logout:", error);
        } finally {
          setIsLoggingOut(false);
        }
      };

      performServerLogout();
    }

    // Clear the logout attempt flag after 10 minutes to allow future logout attempts
    const clearLogoutFlag = setTimeout(() => {
      localStorage.removeItem("logout_attempted");
    }, 10 * 60 * 1000);

    return () => clearTimeout(clearLogoutFlag);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-extrabold text-gray-900 dark:text-white">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
            Session Terminated
          </div>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Your session has been terminated by an administrator. This may
            happen for security reasons or due to system maintenance.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If you believe this was done in error, please contact our support
            team.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push("/auth/login")}
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
