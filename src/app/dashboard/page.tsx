"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  BarChart3,
  Clock,
  LogOut,
  Upload,
  MessageSquare,
  CreditCard,
  X,
  BookOpen,
  Eye,
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { useTuningFiles, useUserProfile } from "@/lib/hooks/useDataFetching";
import OpeningHours from "@/components/OpeningHours";
import DynamicIsland from "@/components/DynamicIsland";
import { motion, AnimatePresence } from 'framer-motion';
import EcuUploadForm from '@/components/EcuUploadForm';
import RecentFiles from '@/components/RecentFiles';
import Link from "next/link";
import StatisticsAndActivityCard from "@/components/StatisticsAndActivityCard";

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
  const [recentFiles, setRecentFiles] = useState<TuningFile[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilOpen, setTimeUntilOpen] = useState("");
  const currentTimeRef = useRef(new Date());
  const [showUploadForm, setShowUploadForm] = useState(false);

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

  const handleNewUpload = () => {
    const dynamicIsland = document.querySelector('[data-dynamic-island]');
    if (dynamicIsland) {
      const newUploadButton = dynamicIsland.querySelector('[data-new-upload]');
      if (newUploadButton) {
        (newUploadButton as HTMLButtonElement).click();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Island */}
      <DynamicIsland variant="dashboard" />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* ECU Upload Card */}
          <div className="relative group/card">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl blur opacity-20 group-hover/card:opacity-30 transition duration-1000 group-hover/card:duration-200"></div>
            <div className="relative bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-800/10 p-6 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Upload className="w-5 h-5 text-indigo-500/80" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Upload ECU File</h2>
                </div>
                <button
                  onClick={handleNewUpload}
                  className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500/80 rounded-lg transition-colors"
                >
                  New Upload
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-blue-100/80">
                Upload your ECU file for tuning. We support most manufacturer formats.
              </p>
            </div>
          </div>

        

          {/* Recent Files Card */}
          <div className="relative group/card">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-20 group-hover/card:opacity-30 transition duration-1000 group-hover/card:duration-200"></div>
            <div className="relative bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-800/10 p-6 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-500/80" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Files</h2>
                </div>
              </div>

              {/* Recent Files List */}
              <div className="space-y-4">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 bg-white/5 dark:bg-gray-800/5 rounded-lg border border-white/10 dark:border-gray-800/10 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{file.file_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-blue-100/80">{file.vehicle_info}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            file.status
                          )}`}
                        >
                          {file.status}
                        </span>
                        <Link
                          href={`/dashboard/tuning-file/${file.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
                  {/* Statistics and Activity Card */}
          <StatisticsAndActivityCard />
        {/* Right Column - Opening Hours and Support */}
        <div className="space-y-6">
          {/* Opening Hours */}
          <OpeningHours />

          {/* Support Card */}
          <div className="relative group/card">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-20 group-hover/card:opacity-30 transition duration-1000 group-hover/card:duration-200"></div>
            <div className="relative bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-800/10 p-4 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-purple-500/80" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Need Help?</h4>
                  <p className="text-sm text-gray-600 dark:text-blue-100/80 mt-1">
                    Our support team is here to help with your tuning needs.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-purple-600 dark:text-purple-400/80">24/7 Support</span>
                <button
                  onClick={() => router.push('/support')}
                  className="relative group/btn"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur opacity-20 group-hover/btn:opacity-30 transition duration-1000 group-hover/btn:duration-200"></div>
                  <div className="relative px-3 py-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-500/80 text-sm font-medium rounded-lg hover:bg-purple-500/20 transition-colors">
                    Open Ticket
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
