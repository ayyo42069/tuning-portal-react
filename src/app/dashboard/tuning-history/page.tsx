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

export default function TuningHistoryPage() {
  const router = useRouter();
  const [tuningFiles, setTuningFiles] = useState<TuningFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTuningHistory = async () => {
    try {
      const response = await fetch("/api/tuning/history", {
        credentials: "include",
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
    fetchTuningHistory();

    // Set up automatic refresh every 30 seconds
    const intervalId = setInterval(fetchTuningHistory, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [router]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-800/70 dark:to-amber-800/70 dark:text-yellow-100";
      case "processing":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-800/70 dark:to-indigo-800/70 dark:text-blue-100";
      case "completed":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-800/70 dark:to-emerald-800/70 dark:text-green-100";
      case "failed":
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-800/70 dark:to-rose-800/70 dark:text-red-100";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-800/70 dark:to-slate-800/70 dark:text-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading tuning history..." />
      </div>
    );
  }

  return (
    <main className="relative">
      {/* Background gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 dark:from-blue-900/20 dark:to-purple-900/20 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5 dark:opacity-10"
          style={{
            backgroundImage: "url('/patterns/hexagons.svg')",
            backgroundSize: "300px",
          }}
        ></div>
      </div>

      <div className="space-y-6 p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 backdrop-blur-sm border-l-4 border-red-400 text-red-700 dark:text-red-300 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <div className="px-6 py-5 border-b border-gray-200/70 dark:border-gray-700/70">
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchTuningHistory}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 bg-gray-100/80 dark:bg-gray-700/80 rounded-lg hover:bg-gray-200/80 dark:hover:bg-gray-600/80"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 bg-gray-100/80 dark:bg-gray-700/80 rounded-lg hover:bg-gray-200/80 dark:hover:bg-gray-600/80"
                  title="Filter"
                >
                  <Filter className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 bg-gray-100/80 dark:bg-gray-700/80 rounded-lg hover:bg-gray-200/80 dark:hover:bg-gray-600/80"
                  title="Sort"
                >
                  <SortAsc className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

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
                    className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-md border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
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
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
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
  );
}
