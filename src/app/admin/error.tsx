'use client';

import { useEffect } from 'react';
import RetryableErrorBoundary from '@/components/error-boundaries/RetryableErrorBoundary';
import { AlertTriangle } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to admin error monitoring service
    console.error('Admin section error:', error);
  }, [error]);

  // Override the error message for admin section
  const adminError = new Error("An error occurred in the admin section. This has been reported to the system administrators.");

  return (
    <RetryableErrorBoundary 
      errorType="server"
      onRetry={reset}
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm shadow-xl rounded-xl border border-white/10 dark:border-gray-700/30 p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-100/80 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
              Admin Section Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {adminError.message}
            </p>
            <div className="flex justify-center">
              <button
                onClick={reset}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      }
    >
      {null}
    </RetryableErrorBoundary>
  );
} 