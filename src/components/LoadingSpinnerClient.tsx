"use client";

import { useEffect, useState } from "react";

interface LoadingSpinnerClientProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export default function LoadingSpinnerClient({
  size = "md",
  message,
}: LoadingSpinnerClientProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 5) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Wheel glow effect */}
        <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-pulse blur-xl" />

        {/* Car Wheel SVG */}
        <svg
          className={`${sizeClasses[size]} transform`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Tire */}
          <circle
            cx="50"
            cy="50"
            r="45"
            className="fill-gray-800 dark:fill-gray-600"
          />

          {/* Rim */}
          <circle
            cx="50"
            cy="50"
            r="35"
            className="fill-gray-300 dark:fill-gray-400"
          />

          {/* Hub */}
          <circle
            cx="50"
            cy="50"
            r="10"
            className="fill-gray-500 dark:fill-gray-300"
          />

          {/* Spokes */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <rect
              key={angle}
              x="48"
              y="15"
              width="4"
              height="35"
              rx="2"
              className="fill-gray-600 dark:fill-gray-300"
              transform={`rotate(${angle}, 50, 50)`}
            />
          ))}

          {/* Tread pattern */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <path
              key={`tread-${angle}`}
              d="M 50 5 L 53 12 L 47 12 Z"
              className="fill-gray-700 dark:fill-gray-500"
              transform={`rotate(${angle}, 50, 50)`}
            />
          ))}
        </svg>
      </div>

      {message && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </p>
      )}
    </div>
  );
} 