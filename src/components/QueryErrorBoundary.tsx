"use client";

import { useState, useCallback, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type ReportErrorFunction = (error: Error) => void;

type RenderFunction = (props: { reportError: ReportErrorFunction }) => ReactNode;

interface QueryErrorBoundaryProps {
  children: ReactNode | RenderFunction;
  queryKey?: unknown[];
  title?: string;
  message?: string;
  className?: string;
  fallback?: ReactNode;
  onRetry?: () => void;
}

/**
 * A specialized error boundary for React Query errors
 * 
 * Features:
 * - Automatic invalidation of specified query keys on retry
 * - Custom retry handler option
 * - Seamless integration with React Query
 */
export default function QueryErrorBoundary({
  children,
  queryKey,
  title = "Data loading error",
  message = "We couldn't load the required data. Please try again.",
  className = "",
  fallback,
  onRetry,
}: QueryErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [key, setKey] = useState(0);
  const queryClient = useQueryClient();

  const handleRetry = useCallback(() => {
    // Reset error state
    setHasError(false);
    setError(null);
    
    // If query key is provided, invalidate it to trigger refetch
    if (queryKey) {
      queryClient.invalidateQueries({ queryKey });
    }
    
    // If custom retry handler is provided, call it
    if (onRetry) {
      onRetry();
    }
    
    // Force remount of children
    setKey(prev => prev + 1);
  }, [queryClient, queryKey, onRetry]);
  
  // Function to be called by children when an error occurs
  const reportError = useCallback((error: Error) => {
    console.error("Error reported to QueryErrorBoundary:", error);
    setError(error);
    setHasError(true);
  }, []);

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={`p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg ${className}`}>
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
          <h3 className="text-blue-800 dark:text-blue-300 font-medium">
            {title}
          </h3>
        </div>
        <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
          {error?.message || message}
        </p>
        <button
          onClick={handleRetry}
          className="mt-3 flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh data
        </button>
      </div>
    );
  }

  // Provide the reportError function to children
  return (
    <div key={key}>
      {typeof children === "function" 
        ? (children as RenderFunction)({ reportError }) 
        : children}
    </div>
  );
} 