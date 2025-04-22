"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

interface StatsProps {
  inView: boolean;
}

interface StatsData {
  users: number;
  files: number;
  satisfaction: number;
  manufacturers: number;
  models: number;
  completedFiles: number;
  avgProcessingTime: number;
  topManufacturers: Array<{
    name: string;
    file_count: number;
  }>;
  lastUpdated: string;
}

export const Stats = ({ inView }: StatsProps) => {
  const [count, setCount] = useState({
    users: 0,
    files: 0,
    satisfaction: 0,
    manufacturers: 0,
    models: 0,
    completedFiles: 0,
    avgProcessingTime: 0,
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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
        const response = await fetch("/api/landing/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }

        const data = await response.json();
        console.log("Landing Stats API response:", data); // Debug logging

        // Ensure we have valid numbers
        const validatedData = {
          users: Math.max(1, Number(data.users) || 0),
          files: Math.max(1, Number(data.files) || 0),
          satisfaction: Math.max(1, Number(data.satisfaction) || 0),
          manufacturers: Math.max(1, Number(data.manufacturers) || 0),
          models: Math.max(1, Number(data.models) || 0),
          completedFiles: Math.max(1, Number(data.completedFiles) || 0),
          avgProcessingTime: Math.max(1, Number(data.avgProcessingTime) || 0),
          topManufacturers: data.topManufacturers || [],
          lastUpdated: data.lastUpdated || new Date().toISOString(),
        };

        setStatsData(validatedData);
        setLastUpdated(validatedData.lastUpdated);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics");
        // Use fallback data if fetch fails
        setStatsData({
          users: 10,
          files: 25,
          satisfaction: 98,
          manufacturers: 5,
          models: 20,
          completedFiles: 15,
          avgProcessingTime: 24,
          topManufacturers: [
            { name: "VW", file_count: 10 },
            { name: "BMW", file_count: 8 },
            { name: "Audi", file_count: 7 },
          ],
          lastUpdated: new Date().toISOString(),
        });
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
          manufacturers: statsData.manufacturers,
          models: statsData.models,
          completedFiles: statsData.completedFiles,
          avgProcessingTime: statsData.avgProcessingTime,
        });
      } else {
        setCount({
          users: 0,
          files: 0,
          satisfaction: 0,
          manufacturers: 0,
          models: 0,
          completedFiles: 0,
          avgProcessingTime: 0,
        });
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
          manufacturers: Math.floor(progress * statsData.manufacturers),
          models: Math.floor(progress * statsData.models),
          completedFiles: Math.floor(progress * statsData.completedFiles),
          avgProcessingTime: Math.floor(progress * statsData.avgProcessingTime),
        });

        if (step >= steps) {
          // Ensure final values match exactly with the API data
          setCount({
            users: statsData.users,
            files: statsData.files,
            satisfaction: statsData.satisfaction,
            manufacturers: statsData.manufacturers,
            models: statsData.models,
            completedFiles: statsData.completedFiles,
            avgProcessingTime: statsData.avgProcessingTime,
          });
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [inView, hasAnimated, statsData]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0 bg-background z-0"></div>
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
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Our Impact by the Numbers
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto"></div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {formatDate(lastUpdated)}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
          <motion.div
            variants={itemVariants}
            className="p-8 bg-card rounded-xl shadow-lg border border-border"
          >
            <div className="mb-4 flex justify-center">
              <svg
                className="w-12 h-12 text-primary"
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
            <div className="text-muted-foreground text-lg">
              Active Users
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-8 bg-card rounded-xl shadow-lg border border-border"
          >
            <div className="mb-4 flex justify-center">
              <svg
                className="w-12 h-12 text-primary"
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
            <div className="text-muted-foreground text-lg">
              Tuning Files Created
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-8 bg-card rounded-xl shadow-lg border border-border"
          >
            <div className="mb-4 flex justify-center">
              <svg
                className="w-12 h-12 text-primary"
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
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-2">
              {count.satisfaction}%
            </div>
            <div className="text-muted-foreground text-lg">
              Customer Satisfaction
            </div>
          </motion.div>
        </div>

        {/* Additional stats section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card rounded-xl shadow-md border border-border"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-1">
              {count.manufacturers}
            </div>
            <div className="text-muted-foreground text-sm">
              Vehicle Manufacturers
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-6 bg-card rounded-xl shadow-md border border-border"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-1">
              {count.models}
            </div>
            <div className="text-muted-foreground text-sm">
              Vehicle Models Supported
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-6 bg-card rounded-xl shadow-md border border-border"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-1">
              {count.completedFiles.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-sm">
              Successfully Tuned Files
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-6 bg-card rounded-xl shadow-md border border-border"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent mb-1">
              {count.avgProcessingTime}
            </div>
            <div className="text-muted-foreground text-sm">
              Avg. Processing Hours
            </div>
          </motion.div>
        </div>

        {/* Top manufacturers section */}
        {statsData?.topManufacturers && statsData.topManufacturers.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Top Supported Manufacturers
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {statsData.topManufacturers.map((manufacturer, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                >
                  <div className="text-2xl font-bold text-cyan-500 dark:text-cyan-400 mb-1">
                    {manufacturer.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {manufacturer.file_count.toLocaleString()} files
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Decorative elements */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl"></div>
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"></div>
      </motion.div>
    </section>
  );
};
