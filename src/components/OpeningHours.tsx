"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { motion } from 'framer-motion';

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

export default function OpeningHours() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilOpen, setTimeUntilOpen] = useState("");
  const currentTimeRef = useRef(new Date());

  const openingHours: OpeningHoursType = {
    Monday: { open: "17:00", close: "24:00" },
    Tuesday: { open: "17:00", close: "24:00" },
    Wednesday: { open: "17:00", close: "24:00" },
    Thursday: { open: "17:00", close: "24:00" },
    Friday: { open: "17:00", close: "24:00" },
    Saturday: { open: "08:00", close: "24:00" },
    Sunday: { open: null, close: null },
  };

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      currentTimeRef.current = new Date();
      setCurrentTime(currentTimeRef.current);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

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

      setTimeUntilOpen(`${hours}h ${minutes.toString().padStart(2, "0")}m`);
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60000); // Update every minute instead of every second
    return () => clearInterval(intervalId);
  }, []);

  const isCurrentlyOpen = () => {
    const budapestTime = new Date(
      currentTime.toLocaleString("en-US", { timeZone: "Europe/Budapest" })
    );
    const day = budapestTime.toLocaleDateString("en-US", {
      weekday: "long",
    }) as DayOfWeek;
    const hours = budapestTime.getHours();
    const minutes = budapestTime.getMinutes();
    const currentTimeMinutes = hours * 60 + minutes;

    const todayHours = openingHours[day];
    if (!todayHours.open || !todayHours.close) return false;

    const openTime = todayHours.open.split(":").map(Number);
    const closeTime = todayHours.close.split(":").map(Number);
    const openTimeMinutes = openTime[0] * 60 + openTime[1];
    const closeTimeMinutes = closeTime[0] * 60 + closeTime[1];

    return (
      currentTimeMinutes >= openTimeMinutes &&
      currentTimeMinutes <= closeTimeMinutes
    );
  };

  // Get today's day name
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  }) as DayOfWeek;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-md bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-800/20 rounded-lg p-6 shadow-lg"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Opening Hours</h2>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-white/80">Monday - Friday</span>
          <span className="text-gray-900 dark:text-white">9:00 AM - 6:00 PM</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-white/80">Saturday</span>
          <span className="text-gray-900 dark:text-white">10:00 AM - 4:00 PM</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-white/80">Sunday</span>
          <span className="text-gray-900 dark:text-white">Closed</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 dark:border-gray-700/30 flex items-center justify-between">
        <span className="text-sm text-blue-100/70">Status:</span>
        <span
          className={`px-2 py-0.5 rounded-full text-sm ${
            isCurrentlyOpen()
              ? "bg-green-500/20 text-green-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {isCurrentlyOpen() ? "Open" : "Closed"}
        </span>
      </div>

      {!isCurrentlyOpen() && (
        <div className="mt-2 text-sm text-center text-blue-300">
          Opens in: {timeUntilOpen}
        </div>
      )}
    </motion.div>
  );
}
