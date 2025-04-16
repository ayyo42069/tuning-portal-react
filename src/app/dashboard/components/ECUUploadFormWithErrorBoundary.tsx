"use client";

import { useState } from "react";
import ErrorBoundary from "@/components/error-boundaries/RetryableErrorBoundary";
import ECUUploadForm from "./ECUUploadForm";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Custom fallback component specifically designed for the ECU Upload form
 */
function ECUUploadFormFallback() {
  const [resetKey, setResetKey] = useState(0);

  const handleRetry = () => {
    // Increment the key to force a remount of the form component
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg space-y-4">
      <div className="flex items-center">
        <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
          ECU Upload Error
        </h3>
      </div>
      
      <p className="text-red-700 dark:text-red-400">
        We encountered an issue with the ECU upload form. This could be due to a network issue or a problem processing your file.
      </p>
      
      <div className="pt-2">
        <button
          onClick={handleRetry}
          className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Upload
        </button>
      </div>
    </div>
  );
}

/**
 * ECUUploadForm with error boundary wrapper
 * This component wraps the ECU Upload form with an error boundary to catch and handle errors gracefully
 */
export default function ECUUploadFormWithErrorBoundary() {
  const [key, setKey] = useState(0);

  return (
    <ErrorBoundary
      fallback={<ECUUploadFormFallback />}
      key={key}
    >
      <ECUUploadForm />
    </ErrorBoundary>
  );
} 