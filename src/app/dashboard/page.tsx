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
  X,
  BookOpen,
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
    <div className="space-y-8">
      {/* Main ECU Upload Card */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-800/20 p-6 transition-all duration-300 hover:bg-white/15 dark:hover:bg-gray-900/15">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Upload ECU File</h2>
                <p className="text-blue-100 mt-1">
                  Upload your ECU file for tuning. Our experts will optimize your vehicle's performance.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowUploadForm(true)}
              className="relative group/btn"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-30 group-hover/btn:opacity-50 transition duration-1000 group-hover/btn:duration-200"></div>
              <div className="relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Start Upload
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completed Tunes */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-800/20 p-6 transition-all duration-300 hover:bg-white/15 dark:hover:bg-gray-900/15">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-100">Completed Tunes</p>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-500 mt-1">
                  {recentFiles.filter((file) => file.status === "completed").length}
                </h3>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <BarChart3 className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 w-full bg-white/10 dark:bg-gray-800/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-600 h-2 rounded-full"
                style={{ width: "64%" }}
              />
            </div>
          </div>
        </div>

        {/* Processing */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-800/20 p-6 transition-all duration-300 hover:bg-white/15 dark:hover:bg-gray-900/15">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-100">Processing</p>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-500 mt-1">
                  {recentFiles.filter((file) => file.status === "processing").length}
                </h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 w-full bg-white/10 dark:bg-gray-800/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-indigo-600 h-2 rounded-full"
                style={{ width: "47%" }}
              />
            </div>
          </div>
        </div>

        {/* Available Credits */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-800/20 p-6 transition-all duration-300 hover:bg-white/15 dark:hover:bg-gray-900/15">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-100">Available Credits</p>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-500 mt-1">
                  {user?.credits ?? 0}
                </h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <CreditCard className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 w-full bg-white/10 dark:bg-gray-800/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-600 h-2 rounded-full"
                style={{ width: "35%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-800/20 p-6 transition-all duration-300 hover:bg-white/15 dark:hover:bg-gray-900/15">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <BarChart3 className="w-6 h-6 text-cyan-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          </div>

          {recentFiles.length > 0 ? (
            <div className="space-y-4">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-lg border border-white/10 dark:border-gray-800/10 p-4 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-white truncate max-w-[180px]">
                        {file.file_name}
                      </div>
                      <div className="text-sm text-blue-100">
                        {file.vehicle_info}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full ${
                            file.status === "completed"
                              ? "bg-green-500/10 text-green-500"
                              : file.status === "processing"
                              ? "bg-blue-500/10 text-blue-500"
                              : file.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                        </span>
                        <span className="text-xs text-blue-100">
                          {new Date(file.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/dashboard/tuning-file/${file.id}`)}
                      className="relative group/btn"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-30 group-hover/btn:opacity-50 transition duration-1000 group-hover/btn:duration-200"></div>
                      <div className="relative px-4 py-2 bg-cyan-500/10 text-cyan-500 text-sm font-medium rounded-lg hover:bg-cyan-500/20 transition-colors">
                        View
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-blue-100">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Support Section */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-800/20 p-6 transition-all duration-300 hover:bg-white/15 dark:hover:bg-gray-900/15">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative p-3 bg-purple-500/10 rounded-xl">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">Need Help?</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Support Card */}
            <div className="relative group/card">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover/card:opacity-50 transition duration-1000 group-hover/card:duration-200"></div>
              <div className="relative bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-800/10 p-4 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Quick Support</h4>
                    <p className="text-sm text-blue-100 mt-1">
                      Get instant help with your tuning files or account questions.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-purple-400">Available 24/7</span>
                  <button className="relative group/btn">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover/btn:opacity-50 transition duration-1000 group-hover/btn:duration-200"></div>
                    <div className="relative px-3 py-1.5 bg-purple-500/10 text-purple-500 text-sm font-medium rounded-lg hover:bg-purple-500/20 transition-colors">
                      Open Ticket
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Knowledge Base Card */}
            <div className="relative group/card">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover/card:opacity-50 transition duration-1000 group-hover/card:duration-200"></div>
              <div className="relative bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-800/10 p-4 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Knowledge Base</h4>
                    <p className="text-sm text-blue-100 mt-1">
                      Browse our guides and tutorials for self-help resources.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-purple-400">Self-Service</span>
                  <button className="relative group/btn">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover/btn:opacity-50 transition duration-1000 group-hover/btn:duration-200"></div>
                    <div className="relative px-3 py-1.5 bg-purple-500/10 text-purple-500 text-sm font-medium rounded-lg hover:bg-purple-500/20 transition-colors">
                      Browse Articles
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 dark:border-gray-800/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-blue-100">
                  Average response time: <span className="text-purple-400">15 minutes</span>
                </p>
                <p className="text-xs text-blue-100/80 mt-1">
                  Our support team is ready to help you with any questions or issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ECU Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center">
          <div className="relative w-full max-w-4xl mx-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-800/20 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                      <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Upload ECU File</h3>
                  </div>
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
                <ECUUploadFormWithErrorBoundary />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
