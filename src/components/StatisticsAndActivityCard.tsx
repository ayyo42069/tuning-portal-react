"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Activity, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useDashboardStats } from "@/lib/hooks/useDashboardStats";

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

interface ActivityItem {
  id: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
  timestamp: string;
}

export default function StatisticsAndActivityCard() {
  const { data: stats, isLoading, error } = useDashboardStats();

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500/80" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500/80" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500/80" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500/80" />;
    }
  };

  if (isLoading) {
    return (
      <div className="relative group/card">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-20 group-hover/card:opacity-30 transition duration-1000 group-hover/card:duration-200"></div>
        <div className="relative bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-800/10 p-6 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative group/card">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl blur opacity-20 group-hover/card:opacity-30 transition duration-1000 group-hover/card:duration-200"></div>
        <div className="relative bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-800/10 p-6 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200">
          <div className="flex items-center justify-center h-48 text-red-500">
            Failed to load statistics
          </div>
        </div>
      </div>
    );
  }

  const statItems: StatItem[] = [
    {
      label: "Total Files",
      value: stats?.totalFiles || 0,
      icon: <BarChart3 className="w-5 h-5 text-blue-500/80" />,
      trend: "up"
    },
    {
      label: "Success Rate",
      value: `${stats?.successRate || 0}%`,
      icon: <Activity className="w-5 h-5 text-green-500/80" />,
      trend: "up"
    },
    {
      label: "Avg. Process Time",
      value: `${stats?.avgProcessTime || 0}h`,
      icon: <Clock className="w-5 h-5 text-purple-500/80" />,
      trend: "down"
    }
  ];

  return (
    <div className="relative group/card">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-20 group-hover/card:opacity-30 transition duration-1000 group-hover/card:duration-200"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm rounded-xl border border-white/10 dark:border-gray-800/10 p-6 hover:bg-white/10 dark:hover:bg-gray-800/10 transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-500/80" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Statistics & Activity</h2>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="p-4 bg-white/5 dark:bg-gray-800/5 rounded-lg border border-white/10 dark:border-gray-800/10"
            >
              <div className="flex items-center gap-2 mb-2">
                {stat.icon}
                <span className="text-sm text-gray-600 dark:text-blue-100/80">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</span>
                {stat.trend && (
                  <span className={`text-xs ${
                    stat.trend === "up" ? "text-green-500" : 
                    stat.trend === "down" ? "text-red-500" : 
                    "text-gray-500"
                  }`}>
                    {stat.trend === "up" ? "↑" : stat.trend === "down" ? "↓" : "→"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Activity</h3>
          <div className="space-y-3">
            {stats?.activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-white/5 dark:bg-gray-800/5 rounded-lg border border-white/10 dark:border-gray-800/10"
              >
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 