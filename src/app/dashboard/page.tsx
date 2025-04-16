"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ECUUploadFormWithErrorBoundary from "./components/ECUUploadFormWithErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
// Ticket system now available via floating button
import {
  BarChart3,
  Clock,
  LogOut,
  Upload,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { useTuningFiles, useUserProfile } from "@/lib/hooks/useDataFetching";

interface User {
  id: number;
  username: string;
  email: string;
  role: "user" | "admin";
  credits?: number;
}

interface TuningFile {
  id: number;
  file_name: string;
  vehicle_info: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  tuning_options: string;
}

type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface HoursInfo {
  open: string | null;
  close: string | null;
}

type OpeningHoursType = {
  [key in DayOfWeek]: HoursInfo;
};

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [recentFiles, setRecentFiles] = useState<TuningFile[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilOpen, setTimeUntilOpen] = useState("");
  const currentTimeRef = useRef(new Date());

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      currentTimeRef.current = new Date();
      setCurrentTime(currentTimeRef.current);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const openingHours: OpeningHoursType = {
    Monday: { open: "17:00", close: "24:00" },
    Tuesday: { open: "17:00", close: "24:00" },
    Wednesday: { open: "17:00", close: "24:00" },
    Thursday: { open: "17:00", close: "24:00" },
    Friday: { open: "17:00", close: "24:00" },
    Saturday: { open: "08:00", close: "24:00" },
    Sunday: { open: null, close: null },
  };

  const getNextOpeningTime = () => {
    const budapestTime = new Date(
      currentTime.toLocaleString("en-US", { timeZone: "Europe/Budapest" })
    );
    const currentDay = budapestTime.toLocaleDateString("en-US", {
      weekday: "long",
    }) as DayOfWeek;
    const currentHours = budapestTime.getHours();
    const currentMinutes = budapestTime.getMinutes();
    const currentTimeMinutes = currentHours * 60 + currentMinutes;

    // Check current day's opening hours
    const todayHours = openingHours[currentDay];
    if (todayHours.open) {
      const [openHour, openMinute] = todayHours.open.split(":").map(Number);
      const openTimeMinutes = openHour * 60 + openMinute;

      if (currentTimeMinutes < openTimeMinutes) {
        // Opens later today
        return new Date(budapestTime.setHours(openHour, openMinute, 0, 0));
      }
    }

    // Find next opening day
    const daysOfWeek: DayOfWeek[] = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    let daysToAdd = 1;
    let nextDay = currentDay;
    let nextDayHours;

    do {
      const nextDayIndex =
        (daysOfWeek.indexOf(currentDay) + daysToAdd) % daysOfWeek.length;
      nextDay = daysOfWeek[nextDayIndex];
      nextDayHours = openingHours[nextDay];
      if (nextDayHours.open) break;
      daysToAdd++;
    } while (daysToAdd <= 7);

    if (nextDayHours?.open) {
      const [openHour, openMinute] = nextDayHours.open.split(":").map(Number);
      const nextDate = new Date(budapestTime);
      nextDate.setDate(nextDate.getDate() + daysToAdd);
      return new Date(nextDate.setHours(openHour, openMinute, 0, 0));
    }

    return null;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const nextOpenTime = getNextOpeningTime();
      if (!nextOpenTime) return;

      const now = new Date(
        currentTimeRef.current.toLocaleString("en-US", {
          timeZone: "Europe/Budapest",
        })
      );
      const diff = nextOpenTime.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilOpen(
        `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds
          .toString()
          .padStart(2, "0")}s`
      );
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, []); // Remove currentTime from dependencies

  // Use React Query for tuning files
  const { data: tuningFilesData, isLoading: tuningFilesLoading } =
    useTuningFiles();

  // Use React Query for user profile
  const { data: userProfileData, isLoading: userProfileLoading } =
    useUserProfile();

  useEffect(() => {
    // Only redirect if not authenticated AND loading is complete
    // This prevents redirect on initial load when user data is still being fetched
    if (user === null && !loading) {
      // Check if we're on a client-side navigation or a full page refresh
      const isClientNavigation =
        window.performance &&
        window.performance.navigation &&
        window.performance.navigation.type === 0;

      // Only redirect on client navigation, not on page refresh
      if (isClientNavigation) {
        router.push("/auth/login");
        return;
      }
    }
  }, [user, router, loading]);

  // Update recentFiles state when tuningFilesData changes
  useEffect(() => {
    if (tuningFilesData) {
      setRecentFiles(tuningFilesData.slice(0, 5));
      setLoading(false);
    }
  }, [tuningFilesData]);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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

  const isCurrentlyOpen = () => {
    const budapestTime = new Date(
      currentTime.toLocaleString("en-US", { timeZone: "Europe/Budapest" })
    );
    const day = budapestTime.toLocaleDateString("en-US", {
      weekday: "long",
    }) as DayOfWeek;
    const hours = budapestTime.getHours();
    const minutes = budapestTime.getMinutes();
    const currentTimeStr = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    const todayHours = openingHours[day];
    if (!todayHours.open || !todayHours.close) return false;

    const openTime = todayHours.open.split(":").map(Number);
    const closeTime = todayHours.close.split(":").map(Number);
    const currentTimeMinutes = hours * 60 + minutes;
    const openTimeMinutes = openTime[0] * 60 + openTime[1];
    const closeTimeMinutes = closeTime[0] * 60 + closeTime[1];

    return (
      currentTimeMinutes >= openTimeMinutes &&
      currentTimeMinutes <= closeTimeMinutes
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div>
      {/* Main ECU Upload Card - Featured prominently */}
      <div className="mb-8">
        <div
          className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-xl overflow-hidden cursor-pointer hover:bg-white/15 dark:hover:bg-gray-700/30 transition-all duration-300 border border-white/20 dark:border-blue-900/30 group"
          onClick={() => setShowUploadForm(true)}
        >
          <div className="p-8 flex flex-col items-center text-center relative overflow-hidden">
            {/* Background glow effect */}
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-all duration-500"></div>
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500"></div>

            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-all duration-300 z-10">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3 z-10">
              Upload ECU File
            </h3>
            <p className="text-blue-100 max-w-md mb-6 z-10">
              Upload your ECU file for tuning. Our experts will optimize your
              vehicle's performance.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center z-10">
              <Upload className="w-5 h-5 mr-2" />
              Start Upload
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/20 dark:border-gray-700/30 group hover:shadow-xl transition-all duration-300">
          <div className="p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -right-10 -top-10 w-20 h-20 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 transition-all duration-500"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-sm font-medium text-blue-100">
                  Completed Tunes
                </p>
                <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500 mt-1">
                  {
                    recentFiles.filter((file) => file.status === "completed")
                      .length
                  }
                </h4>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/20">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full bg-white/10 dark:bg-gray-700/50 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full"
                style={{ width: "64%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/20 dark:border-gray-700/30 group hover:shadow-xl transition-all duration-300">
          <div className="p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -right-10 -top-10 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-sm font-medium text-blue-100">Processing</p>
                <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500 mt-1">
                  {
                    recentFiles.filter((file) => file.status === "processing")
                      .length
                  }
                </h4>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full bg-white/10 dark:bg-gray-700/50 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full"
                style={{ width: "47%" }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/20 dark:border-gray-700/30 group hover:shadow-xl transition-all duration-300">
          <div className="p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -right-10 -top-10 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all duration-500"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-sm font-medium text-blue-100">
                  Available Credits
                </p>
                <h4 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-500 mt-1">
                  {user?.credits ?? 0}
                </h4>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="w-full bg-white/10 dark:bg-gray-700/50 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-purple-400 to-purple-600 h-2.5 rounded-full"
                style={{ width: "35%" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity Card */}
        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/20 dark:border-gray-700/30 group hover:shadow-xl transition-all duration-300">
          <div className="p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -right-10 -top-10 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500"></div>

            <h3 className="text-xl font-bold text-white mb-4 flex items-center relative z-10">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20 mr-3">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Recent Activity
            </h3>

            {recentFiles.length > 0 ? (
              <div className="space-y-3 relative z-10">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 bg-white/5 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg border border-white/10 dark:border-gray-600/30 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div
                          className="font-medium text-white truncate"
                          style={{ maxWidth: "180px" }}
                        >
                          {file.file_name}
                        </div>
                        <div className="text-sm text-blue-100">
                          {file.vehicle_info}
                        </div>
                        <div className="mt-2 flex items-center">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full ${getStatusBadgeClass(
                              file.status
                            )}`}
                          >
                            {file.status.charAt(0).toUpperCase() +
                              file.status.slice(1)}
                          </span>
                          <span className="text-xs text-blue-200/70 ml-2">
                            {new Date(file.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() =>
                            router.push(`/dashboard/tuning-file/${file.id}`)
                          }
                          className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 relative z-10">
                <p className="text-blue-100">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Support Card - Removed embedded ticket system in favor of floating button */}
        <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/20 dark:border-gray-700/30 group hover:shadow-xl transition-all duration-300">
          <div className="p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -left-10 -bottom-10 w-20 h-20 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all duration-500"></div>

            <h3 className="text-xl font-bold text-white mb-4 flex items-center relative z-10">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg shadow-purple-500/20 mr-3">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              Support
            </h3>
            <p className="text-blue-100 mb-4 relative z-10">
              Need help with your tuning files or have questions about our
              services?
            </p>
            <p className="text-blue-100 relative z-10">
              Click the support button{" "}
              <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full text-white shadow-lg shadow-purple-500/20">
                <MessageSquare className="w-3 h-3" />
              </span>{" "}
              in the bottom right corner to access our ticket system.
            </p>
          </div>
        </div>
      </div>

      {/* ECU Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center overflow-y-auto">
          <div className="relative w-full max-w-4xl mx-4">
            <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
              <div className="p-8 relative">
                {/* Background glow effects */}
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/20">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      Upload ECU File
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUploadForm(false);
                    }}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 border border-white/10"
                    aria-label="Close"
                  >
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="relative z-10">
                  <ECUUploadFormWithErrorBoundary />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opening Hours Card has been removed and moved to the sidebar */}
    </div>
  );
}
