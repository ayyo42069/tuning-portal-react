"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, LogIn, HelpCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { executeQuery } from "@/lib/db";

export default function TerminatedSession() {
  const router = useRouter();

  // Clear all authentication cookies when the terminated page loads
  useEffect(() => {
    // Clear auth cookies by setting their expiration to the past
    document.cookie =
      "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict";
    document.cookie =
      "session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict";
    document.cookie =
      "auth_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict";

    // Also clear from localStorage if any auth state is stored there
    localStorage.removeItem("auth_state");
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
