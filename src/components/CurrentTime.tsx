"use client";

import { useState, useEffect } from "react";

export default function CurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formattedTime, setFormattedTime] = useState("");
  
  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Format time for Budapest timezone
      try {
        const budapestTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }));
        
        // Format as digital clock display (HH:MM:SS)
        const hours = budapestTime.getHours().toString().padStart(2, '0');
        const minutes = budapestTime.getMinutes().toString().padStart(2, '0');
        const seconds = budapestTime.getSeconds().toString().padStart(2, '0');
        
        setFormattedTime(`${hours}:${minutes}:${seconds}`);
      } catch (error) {
        console.error("Error formatting Budapest time:", error);
        setFormattedTime("Error");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get current day of week
  const getDayOfWeek = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const budapestTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Europe/Budapest' }));
    return days[budapestTime.getDay()];
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg shadow-inner">
      <div className="text-center">
        <div className="flex justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-1">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
            <span key={day} className={day === getDayOfWeek() ? 'text-blue-500 font-bold' : ''}>{day}</span>
          ))}
        </div>
        <div className="text-4xl font-mono font-bold text-gray-800 dark:text-gray-200">
          {formattedTime}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          PM
        </div>
      </div>
    </div>
  );
}