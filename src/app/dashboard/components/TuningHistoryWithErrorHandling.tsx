"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTuningFiles } from "@/lib/hooks/useDataFetching";
import { queryKeys } from "@/lib/hooks/useDataFetching";
import QueryErrorBoundary from "@/components/QueryErrorBoundary";
import { FileText, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";

/**
 * Tuning History component with proper error handling using QueryErrorBoundary
 * This demonstrates how to use the QueryErrorBoundary with React Query
 */
export default function TuningHistoryWithErrorHandling() {
  return (
    <QueryErrorBoundary 
      message="We couldn't load your tuning history. Please try again or contact support if this persists."
    >
      {({ reportError }) => <TuningHistoryContent reportError={reportError} />}
    </QueryErrorBoundary>
  );
}

/**
 * Inner content component that handles data fetching
 */
function TuningHistoryContent({ 
  reportError 
}: { 
  reportError: (error: Error) => void 
}) {
  const { data: tuningFiles, isLoading, error } = useTuningFiles();
  
  // Report error to boundary if fetch fails
  if (error && error instanceof Error) {
    // Only report once to prevent infinite loops
    reportError(error);
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading tuning history...</span>
      </div>
    );
  }
  
  if (!tuningFiles || tuningFiles.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
          <FileText className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No tuning files yet</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Once you upload ECU files for tuning, they will appear here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Your Tuning History
      </h2>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tuningFiles.map((file: any) => (
          <div key={file.id} className="py-4">
            <div className="flex items-start">
              <div className={`p-2 rounded-md mr-3 ${
                file.status === 'completed' 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : file.status === 'rejected' 
                    ? 'bg-red-100 dark:bg-red-900/20'
                    : 'bg-blue-100 dark:bg-blue-900/20'
              }`}>
                {file.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : file.status === 'rejected' ? (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                ) : (
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                  {file.file_name}
                </h3>
                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(file.created_at).toLocaleDateString()}
                  <span className="mx-2">•</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    file.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : file.status === 'rejected' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 