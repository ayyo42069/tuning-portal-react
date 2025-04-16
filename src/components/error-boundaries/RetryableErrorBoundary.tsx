"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface RetryableErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  message?: string;
  className?: string;
  onError?: (error: Error) => void;
}

/**
 * A reusable error boundary component with retry functionality
 * 
 * Features:
 * - Custom error messages and titles
 * - Retry functionality to remount children
 * - Error logging callback
 * - Customizable styling
 */
export default function RetryableErrorBoundary({
  children,
  fallback,
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  className = "",
  onError,
}: RetryableErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Prevent handling the same error multiple times
      if (hasError) return;
      
      console.error("Error caught by retryable error boundary:", event.error);
      setError(event.error);
      setHasError(true);
      
      // Call the error callback if provided
      if (onError && event.error instanceof Error) {
        onError(event.error);
      }
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, [hasError, onError]);

  const handleRetry = () => {
    setHasError(false);
    setError(null);
    
    // Increment key to force a remount of children
    setKey(prev => prev + 1);
  };

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <h3 className="text-red-800 dark:text-red-300 font-medium">
            {title}
          </h3>
        </div>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">
          {error?.message || message}
        </p>
        <button
          onClick={handleRetry}
          className="mt-3 flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Try again
        </button>
      </div>
    );
  }

  return <div key={key}>{children}</div>;
} 