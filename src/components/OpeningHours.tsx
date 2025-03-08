"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

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
    <div className="mt-4 sm:mt-6 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-2 sm:mb-3">
        <Clock className="h-4 w-4 mr-2 text-yellow-500" />
        <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          Opening Hours
        </h4>
      </div>

      <div className="space-y-1 text-xs">
        {Object.entries(openingHours).map(([day, hours]) => (
          <div
            key={day}
            className={`flex justify-between items-center py-0.5 ${
              day === today
                ? "font-medium text-gray-800 dark:text-gray-200"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <span>{day.substring(0, 3)}</span>
            <span>
              {hours.open ? `${hours.open} - ${hours.close}` : "Closed"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">Status:</span>
        <span
          className={`px-2 py-0.5 rounded-full ${
            isCurrentlyOpen()
              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          }`}
        >
          {isCurrentlyOpen() ? "Open" : "Closed"}
        </span>
      </div>

      {!isCurrentlyOpen() && (
        <div className="mt-2 text-xs text-center text-blue-600 dark:text-blue-400">
          Opens in: {timeUntilOpen}
        </div>
      )}
    </div>
  );
}
