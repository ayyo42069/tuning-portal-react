"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ErrorBoundary({
  children,
  fallback,
}: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Error caught by error boundary:", error);
      setError(error.error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("error", handleError);
    };
  }, []);

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-red-800 dark:text-red-300 font-medium">
            Something went wrong
          </h3>
        </div>
        <p className="mt-2 text-sm text-red-700 dark:text-red-400">
          {error?.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={() => setHasError(false)}
          className="mt-3 px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
        >
          Try again
        </button>
      </div>
    );
  }

  return <>{children}</>;
} 