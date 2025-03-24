"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface StatsProps {
  inView: boolean;
}

interface StatsData {
  users: number;
  files: number;
  satisfaction: number;
}

export const Stats = ({ inView }: StatsProps) => {
  const [count, setCount] = useState({ users: 0, files: 0, satisfaction: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  // Fetch stats data from API
  useEffect(() => {
    const fetchStats = async () => {
      if (!inView) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }

        const data = await response.json();
        console.log("Stats API response:", data); // Debug logging

        // Ensure we have valid numbers
        const validatedData = {
          users: Math.max(1, Number(data.users) || 0),
          files: Math.max(1, Number(data.files) || 0),
          satisfaction: Math.max(1, Number(data.satisfaction) || 0),
        };

        setStatsData(validatedData);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics");
        // Use fallback data if fetch fails
        setStatsData({ users: 10, files: 25, satisfaction: 98 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [inView]);

  // Initialize count when statsData is loaded
  useEffect(() => {
    if (statsData) {
      // If we haven't animated yet, start with zeros
      // If we've already animated or are not in view, just set to final values
      if (!inView || hasAnimated) {
        setCount({
          users: statsData.users,
          files: statsData.files,
          satisfaction: statsData.satisfaction,
        });
      } else {
        setCount({ users: 0, files: 0, satisfaction: 0 });
      }
    }
  }, [statsData, inView, hasAnimated]);

  // Animate counting effect
  useEffect(() => {
    if (inView && !hasAnimated && statsData) {
      setHasAnimated(true);

      const duration = 2000;
      const interval = 20;
      const steps = duration / interval;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        setCount({
          users: Math.floor(progress * statsData.users),
          files: Math.floor(progress * statsData.files),
          satisfaction: Math.floor(progress * statsData.satisfaction),
        });

        if (step >= steps) {
          // Ensure final values match exactly with the API data
          setCount({
            users: statsData.users,
            files: statsData.files,
            satisfaction: statsData.satisfaction,
          });
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [inView, hasAnimated, statsData]);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-white dark:bg-gray-800 z-0"></div>
      <div className="absolute inset-0 opacity-5 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/hexagons.svg')",
            backgroundSize: "30px",
          }}
        ></div>
      </div>

      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="container mx-auto px-4 relative z-10"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Our Impact by the Numbers
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <motion.div
            variants={itemVariants}
            className="p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="mb-4 flex justify-center">
              <svg
                className="w-12 h-12 text-cyan-500 dark:text-cyan-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="9"
                  cy="7"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
              {count.users.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-lg">
              Active Users
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="mb-4 flex justify-center">
              <svg
                className="w-12 h-12 text-cyan-500 dark:text-cyan-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
              {count.files.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-lg">
              Tuning Files Created
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
          >
            <div className="mb-4 flex justify-center">
              <svg
                className="w-12 h-12 text-cyan-500 dark:text-cyan-400"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
              {count.satisfaction.toLocaleString()}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-lg">
              Customer Satisfaction
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl"></div>
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"></div>
      </motion.div>
    </section>
  );
};
