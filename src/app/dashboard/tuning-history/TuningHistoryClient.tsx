"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  PlusSquare,
  Filter,
  SortAsc,
  RefreshCw,
  Download,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import RetryableErrorBoundary from "@/components/error-boundaries/RetryableErrorBoundary";

interface TuningFile {
  id: number;
  file_name: string;
  vehicle_info: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  credits_used: number;
  tuning_options: string;
}

interface TuningHistoryClientProps {
  initialData?: {
    tuningFiles: TuningFile[];
  };
}

export default function TuningHistoryClient({ initialData }: TuningHistoryClientProps) {
  const router = useRouter();
  const [tuningFiles, setTuningFiles] = useState<TuningFile[]>(initialData?.tuningFiles || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTuningHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tuning/history", {
        credentials: "include",
        cache: "no-store"
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }
        throw new Error(`Failed to fetch tuning history: ${response.status}`);
      }

      const data = await response.json();
      setTuningFiles(data.tuningFiles);
    } catch (error) {
      console.error("Error fetching tuning history:", error);
      setError("Failed to load tuning history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch data immediately on mount
    fetchTuningHistory();

    // Set up automatic refresh every 30 seconds
    const intervalId = setInterval(fetchTuningHistory, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-100/80 to-amber-100/80 text-yellow-800 dark:from-yellow-800/30 dark:to-amber-800/30 dark:text-yellow-100 backdrop-blur-sm";
      case "processing":
        return "bg-gradient-to-r from-blue-100/80 to-indigo-100/80 text-blue-800 dark:from-blue-800/30 dark:to-indigo-800/30 dark:text-blue-100 backdrop-blur-sm";
      case "completed":
        return "bg-gradient-to-r from-green-100/80 to-emerald-100/80 text-green-800 dark:from-green-800/30 dark:to-emerald-800/30 dark:text-green-100 backdrop-blur-sm";
      case "failed":
        return "bg-gradient-to-r from-red-100/80 to-rose-100/80 text-red-800 dark:from-red-800/30 dark:to-rose-800/30 dark:text-red-100 backdrop-blur-sm";
      default:
        return "bg-gradient-to-r from-gray-100/80 to-slate-100/80 text-gray-800 dark:from-gray-800/30 dark:to-slate-800/30 dark:text-gray-100 backdrop-blur-sm";
    }
  };

  // Show loading spinner only when there's no data and we're loading
  if (loading && tuningFiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading tuning history..." />
      </div>
    );
  }

  return (
    <RetryableErrorBoundary onRetry={fetchTuningHistory}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm shadow-xl overflow-hidden sm:rounded-xl border border-white/10 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300">
            <div className="px-6 py-5 border-b border-white/10 dark:border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg mr-3">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl leading-6 font-medium text-gray-900 dark:text-white">
                      Your Tuning Files
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                      View and manage your tuning file history
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={fetchTuningHistory}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <PlusSquare className="-ml-1 mr-2 h-5 w-5" />
                    New Upload
                  </Link>
                </div>
              </div>
            </div>

            {error && (
              <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-800/30">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tuningFiles.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="p-4 bg-gray-100/50 dark:bg-gray-700/50 rounded-full inline-flex items-center justify-center mb-4">
                  <PlusSquare className="h-12 w-12 text-blue-500 dark:text-blue-400" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                  No tuning files
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Get started by uploading a new ECU file for tuning.
                </p>
                <div className="mt-6">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <PlusSquare className="-ml-1 mr-2 h-5 w-5" />
                    Upload a File
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tuningFiles.map((file) => (
                    <div
                      key={file.id}
                      className="relative bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-xl overflow-hidden shadow-md border border-white/10 dark:border-gray-700/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
                    >
                      {/* Status indicator - top right corner */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                            file.status
                          )}`}
                        >
                          {file.status === "pending" && (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {file.status === "processing" && (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          )}
                          {file.status === "completed" && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {file.status === "failed" && (
                            <AlertCircle className="w-3 h-3 mr-1" />
                          )}
                          {file.status.charAt(0).toUpperCase() +
                            file.status.slice(1)}
                        </span>
                      </div>

                      {/* Card content */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            {file.file_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {file.vehicle_info}
                          </p>
                        </div>

                        {/* Tuning options */}
                        <div className="mb-4">
                          <h4 className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-1">
                            Tuning Options
                          </h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {file.tuning_options || "None"}
                          </p>
                        </div>

                        {/* Date and credits */}
                        <div className="flex justify-between items-center mb-4 text-xs text-gray-500 dark:text-gray-400">
                          <div>
                            <span className="block font-medium uppercase">
                              Date
                            </span>
                            <span>
                              {new Date(file.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block font-medium uppercase">
                              Credits
                            </span>
                            <span>{file.credits_used || 0}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center">
                          <Link
                            href={`/dashboard/tuning-file/${file.id}`}
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Details
                          </Link>
                          {file.status === "completed" && (
                            <a
                              href={`/api/tuning/download?id=${file.id}`}
                              className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors duration-200"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </RetryableErrorBoundary>
  );
} 