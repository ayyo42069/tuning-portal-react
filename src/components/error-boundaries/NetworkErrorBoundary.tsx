"use client";

import { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface NetworkErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * A specialized error boundary for network-related errors
 * Provides useful troubleshooting suggestions for connection issues
 */
export default function NetworkErrorBoundary({
  children,
  fallback,
  onError,
  className = "",
}: NetworkErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [key, setKey] = useState(0);
  const router = useRouter();

  // Handle window online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listen for network errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Only catch network-related errors
      const errorMessage = event.error?.message || event.message;
      const isNetworkError = errorMessage?.includes("network") || 
                            errorMessage?.includes("fetch") || 
                            errorMessage?.includes("connect") ||
                            errorMessage?.includes("ECONNREFUSED") ||
                            errorMessage?.includes("Failed to fetch");
      
      if (!isNetworkError) return;
      
      console.error("Network error caught by boundary:", event.error);
      setError(event.error || new Error(errorMessage));
      setHasError(true);
      
      if (onError && event.error instanceof Error) {
        onError(event.error);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", (event) => {
      handleError({ error: event.reason } as ErrorEvent);
    });

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", (event) => {
        handleError({ error: event.reason } as ErrorEvent);
      });
    };
  }, [onError]);

  // Check connection and retry
  const handleRetry = () => {
    setHasError(false);
    setError(null);
    setKey(prev => prev + 1);
  };

  // Refresh page function using router instead of window.location
  const refreshPage = useCallback(() => {
    // Refresh current page by re-navigating to current route
    const currentPath = window.location.pathname;
    router.refresh(); // Use router.refresh() which is safer than full reload
  }, [router]);

  if (hasError || !isOnline) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={`p-5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg ${className}`}>
        <div className="flex items-center">
          {isOnline ? (
            <Wifi className="h-6 w-6 text-yellow-500 mr-3" />
          ) : (
            <WifiOff className="h-6 w-6 text-yellow-500 mr-3" />
          )}
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300">
            {isOnline ? "Connection Issue" : "You're Offline"}
          </h3>
        </div>
        <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
          {isOnline 
            ? "We couldn't connect to our servers. This might be temporary." 
            : "Please check your internet connection and try again."}
        </p>
        
        <div className="mt-4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-md">
          <h4 className="text-sm font-medium flex items-center text-yellow-800 dark:text-yellow-300 mb-2">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Troubleshooting
          </h4>
          <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 ml-5 list-disc">
            <li>Check your internet connection</li>
            <li>Verify your network firewall settings</li>
            <li>Try refreshing the page</li>
            <li>Clear your browser cache and cookies</li>
            {error?.message && (
              <li className="mt-2 font-mono text-yellow-600 dark:text-yellow-500 break-all">
                Error: {error.message.slice(0, 100)}
                {error.message.length > 100 ? "..." : ""}
              </li>
            )}
          </ul>
        </div>
        
        <div className="flex mt-4">
          <button
            onClick={handleRetry}
            className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors mr-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
          <button
            onClick={refreshPage}
            className="flex items-center px-4 py-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800/40 rounded-md transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <div key={key}>{children}</div>;
} 