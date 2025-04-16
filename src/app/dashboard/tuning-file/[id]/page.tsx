"use client";

import { useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ECUFileDetailedProgress from "@/components/ECUFileDetailedProgress";
import ECUFileComments from "@/components/ECUFileComments";

interface TuningOption {
  id: number;
  name: string;
  description: string;
  credit_cost: number;
}

interface TuningFileDetails {
  id: number;
  file_name: string;
  original_filename: string;
  stored_filename: string;
  processed_filename: string | null;
  vehicle_info: string;
  manufacturer_name: string;
  model_name: string;
  production_year: number;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  credits_used: number;
  admin_message: string | null;
  priority: number;
  tuning_options: TuningOption[];
  user_id: number;
}

export default function TuningFileDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const [tuningFile, setTuningFile] = useState<TuningFileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);

  // Set the file ID from params in useEffect to avoid the sync access warning
  useEffect(() => {
    // Add validation to ensure id is a valid number
    if (!params || !params.id || !/^\d+$/.test(params.id)) {
      notFound(); // Redirect to 404 if ID is invalid
      return;
    }
    
    setFileId(params.id);
  }, [params]);

  // Remove the redundant validation useEffect and keep the fetch function
  const fetchTuningFileDetails = async () => {
    if (!fileId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tuning/file?id=${fileId}`, {
        credentials: "include",
        cache: "no-store" // Add cache option to get fresh data
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }
        throw new Error(
          `Failed to fetch tuning file details: ${response.status}`
        );
      }

      const data = await response.json();
      setTuningFile(data.tuningFile);
    } catch (error) {
      console.error("Error fetching tuning file details:", error);
      setError("Failed to load tuning file details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTuningFileDetails();
  }, [fileId, router]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900 relative overflow-hidden flex items-center justify-center">
        {/* SVG Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/patterns/hexagons.svg')",
              backgroundSize: "30px",
              filter: "blur(0.5px)",
            }}
          ></div>
        </div>

        {/* Circuit board pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/patterns/circuit-board.svg')",
              backgroundSize: "300px",
            }}
          ></div>
        </div>

        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md p-8 rounded-xl shadow-xl border border-white/20 dark:border-gray-700/30 relative z-10">
          <LoadingSpinner size="lg" message="Loading file details..." />
        </div>
      </div>
    );
  }

  if (error || !tuningFile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900 relative overflow-hidden">
        {/* SVG Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/patterns/hexagons.svg')",
              backgroundSize: "30px",
              filter: "blur(0.5px)",
            }}
          ></div>
        </div>

        {/* Circuit board pattern overlay */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/patterns/circuit-board.svg')",
              backgroundSize: "300px",
            }}
          ></div>
        </div>

        <header className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border-b border-white/20 dark:border-gray-700/30 shadow-lg relative z-10">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Error</h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/tuning-history"
                className="px-4 py-2 border border-white/30 text-sm font-medium rounded-lg text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Back to History
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-4 p-6 bg-red-900/20 border border-red-500/30 text-red-300 rounded-md shadow-md backdrop-blur-sm relative z-10">
              <p>{error || "Tuning file not found"}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 dark:from-blue-950 dark:to-blue-900 relative overflow-hidden">
      {/* SVG Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/hexagons.svg')",
            backgroundSize: "30px",
            filter: "blur(0.5px)",
          }}
        ></div>
      </div>

      {/* Circuit board pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/circuit-board.svg')",
            backgroundSize: "300px",
          }}
        ></div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl overflow-hidden sm:rounded-xl border border-white/20 dark:border-gray-700/30 hover:shadow-2xl transition-all duration-300">
            <div className="px-6 py-6 sm:px-8 flex justify-between items-center border-b border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/30 dark:to-cyan-900/30 backdrop-blur-sm">
              <div>
                <h3 className="text-xl leading-6 font-medium text-gray-900 dark:text-white">
                  {tuningFile.file_name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                  Uploaded on {formatDate(tuningFile.created_at)}
                </p>
              </div>
              <span
                className={`px-4 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm backdrop-blur-sm ${getStatusBadgeClass(
                  tuningFile.status
                )}`}
              >
                {tuningFile.status.charAt(0).toUpperCase() +
                  tuningFile.status.slice(1)}
              </span>
            </div>
            <div className="border-t border-white/20 dark:border-gray-700/30">
              <dl className="divide-y divide-white/20 dark:divide-gray-700/30">
                <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 backdrop-blur-sm bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-200">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Vehicle Information
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 font-medium">
                    {tuningFile.manufacturer_name} {tuningFile.model_name},
                    Year: {tuningFile.production_year}
                  </dd>
                </div>
                <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 hover:bg-white/15 dark:hover:bg-gray-700/40 transition-all duration-200">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 font-medium">
                    {tuningFile.status.charAt(0).toUpperCase() +
                      tuningFile.status.slice(1)}
                  </dd>
                </div>
                <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 backdrop-blur-sm bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-200">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 font-medium">
                    {formatDate(tuningFile.updated_at)}
                  </dd>
                </div>
                <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 hover:bg-white/15 dark:hover:bg-gray-700/40 transition-all duration-200">
                  <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Credits Used
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 font-medium">
                    {tuningFile.credits_used}
                  </dd>
                </div>
                {tuningFile.admin_message && (
                  <div className="px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-8 backdrop-blur-sm bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-200">
                    <dt className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Admin Message
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 font-medium">
                      {tuningFile.admin_message}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Tuning Options */}
            <div className="px-6 py-6 sm:px-8 border-t border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/30 dark:to-purple-900/30 backdrop-blur-sm">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Selected Tuning Options
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
                The following tuning options were selected for this file
              </p>
            </div>
            <div className="border-t border-white/20 dark:border-gray-700/30">
              <ul className="divide-y divide-white/20 dark:divide-gray-700/30">
                {tuningFile.tuning_options.map((option) => (
                  <li
                    key={option.id}
                    className="px-6 py-4 sm:px-8 backdrop-blur-sm bg-white/5 dark:bg-gray-800/20 hover:bg-white/10 dark:hover:bg-gray-700/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {option.description}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100/80 text-green-800 dark:bg-green-800/80 dark:text-green-100 shadow-sm backdrop-blur-sm">
                          {option.credit_cost} credits
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Progress */}
            <div className="px-6 py-6 sm:px-8 border-t border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-900/30 dark:to-blue-900/30 backdrop-blur-sm">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Processing Status
              </h3>
              <ECUFileDetailedProgress
                currentStatus={tuningFile.status}
                createdAt={tuningFile.created_at}
                updatedAt={tuningFile.updated_at}
                priority={tuningFile.priority}
                showRefreshButton={true}
                onRefresh={fetchTuningFileDetails}
                estimatedCompletionTime={
                  tuningFile.status === "processing" ? "1-2 hours" : undefined
                }
              />
            </div>

            {/* Download section - only show if file is completed */}
            {tuningFile.status === "completed" &&
              tuningFile.processed_filename && (
                <div className="px-6 py-6 sm:px-8 border-t border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm">
                  <div className="flex flex-col items-center justify-center py-6">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                      Your tuned file is ready for download
                    </h3>
                    <a
                      href={`/api/tuning/download?id=${tuningFile.id}`}
                      className="px-6 py-3 border border-green-300/30 dark:border-green-700/30 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                    >
                      Download Tuned File
                    </a>
                  </div>
                </div>
              )}

            {/* Comments Section */}
            <div className="px-6 py-6 sm:px-8 border-t border-white/20 dark:border-gray-700/30 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-sm">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Comments & Questions
              </h3>
              <ECUFileComments
                fileId={tuningFile.id}
                currentUserId={tuningFile.user_id}
                currentUserRole="user"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
