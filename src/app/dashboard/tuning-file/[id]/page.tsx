"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

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
  tuning_options: TuningOption[];
}

export default function TuningFileDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [tuningFile, setTuningFile] = useState<TuningFileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  // Set the file ID from params in useEffect to avoid the sync access warning
  useEffect(() => {
    const getFileId = async () => {
      const resolvedParams = await params;
      if (resolvedParams && resolvedParams.id) {
        setFileId(resolvedParams.id);
      }
    };

    getFileId();
  }, [params]);

  // Define the fetch function outside useEffect so we can reuse it for polling
  const fetchTuningFileDetails = async () => {
    if (!fileId) return;

    try {
      const response = await fetch(`/api/tuning/file?id=${fileId}`, {
        credentials: "include",
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
    // Only fetch when fileId is available
    if (!fileId) return;

    fetchTuningFileDetails();

    // Set up polling interval - check for updates every 30 seconds
    // This is especially useful for files in 'pending' or 'processing' status
    const intervalId = setInterval(fetchTuningFileDetails, 30000);

    // Clean up interval on component unmount or when fileId changes
    return () => clearInterval(intervalId);
  }, [fileId, router]); // Use fileId in dependency array

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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading file details..." />
      </div>
    );
  }

  if (error || !tuningFile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Error
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/tuning-history"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to History
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
              <p>{error || "Tuning file not found"}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tuning File Details
          </h1>
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/tuning-history"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to History
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {tuningFile.file_name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Uploaded on {formatDate(tuningFile.created_at)}
                </p>
              </div>
              <span
                className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                  tuningFile.status
                )}`}
              >
                {tuningFile.status.charAt(0).toUpperCase() +
                  tuningFile.status.slice(1)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <dl>
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Vehicle Information
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                    {tuningFile.manufacturer_name} {tuningFile.model_name},
                    Year: {tuningFile.production_year}
                  </dd>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                    {tuningFile.status.charAt(0).toUpperCase() +
                      tuningFile.status.slice(1)}
                  </dd>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                    {formatDate(tuningFile.updated_at)}
                  </dd>
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Credits Used
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                    {tuningFile.credits_used}
                  </dd>
                </div>
                {tuningFile.admin_message && (
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Admin Message
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                      {tuningFile.admin_message}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Tuning Options */}
            <div className="px-4 py-5 sm:px-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Selected Tuning Options
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                The following tuning options were selected for this file
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {tuningFile.tuning_options.map((option) => (
                  <li key={option.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {option.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {option.description}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          {option.credit_cost} credits
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download section - only show if file is completed */}
            {tuningFile.status === "completed" &&
              tuningFile.processed_filename && (
                <div className="px-4 py-5 sm:px-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col items-center justify-center py-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Your tuned file is ready for download
                    </h3>
                    <a
                      href={`/api/tuning/download?id=${tuningFile.id}`}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Download Tuned File
                    </a>
                  </div>
                </div>
              )}
            {tuningFile.status === "processing" && (
              <div className="px-4 py-5 sm:px-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Your file is being processed
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This may take a few minutes. You can check back later.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
