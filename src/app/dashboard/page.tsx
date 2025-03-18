"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ECUUploadForm from "./components/ECUUploadForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import TicketSystemWrapper from "@/components/TicketSystem";
import { BarChart3, Clock, LogOut, Upload, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";

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

  const fetchTuningFiles = async () => {
    try {
      if (!user) {
        return;
      }

      // Fetch recent tuning files
      const filesResponse = await fetch("/api/tuning/history", {
        credentials: "include",
      });

      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        setRecentFiles(filesData.tuningFiles.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching tuning files:", error);
    } finally {
      setLoading(false);
    }
  };

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

    // Only fetch files if user is authenticated
    if (user) {
      fetchTuningFiles();
      const intervalId = setInterval(fetchTuningFiles, 30000);
      return () => clearInterval(intervalId);
    }
  }, [user, router, loading]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2 text-blue-500" />
              Recent Activity
            </h3>

            {recentFiles.length > 0 ? (
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div
                          className="font-medium text-gray-800 dark:text-gray-200 truncate"
                          style={{ maxWidth: "180px" }}
                        >
                          {file.file_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {file.vehicle_info}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(file.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs leading-4 font-semibold rounded-full ${getStatusBadgeClass(
                          file.status
                        )}`}
                      >
                        {file.status.charAt(0).toUpperCase() +
                          file.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">
                  No recent activity found.
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Chat Box */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-green-500" />
              Chat Support
            </h3>
            <TicketSystemWrapper />
          </div>
        </div>
      </div>

      {/* ECU Upload Form */}
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        onClick={() => setShowUploadForm(true)}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <Upload className="w-6 h-6 mr-2 text-blue-500" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Upload ECU File
            </h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Click to upload
          </span>
        </div>
      </div>

      {/* ECU Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto">
          <div className="relative w-full max-w-4xl mx-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                    <Upload className="w-6 h-6 mr-2 text-blue-500" />
                    Upload ECU File
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUploadForm(false);
                    }}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
                  >
                    <svg
                      className="h-6 w-6"
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
                <ECUUploadForm />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Opening Hours Card has been removed and moved to the sidebar */}
    </div>
  );
}
