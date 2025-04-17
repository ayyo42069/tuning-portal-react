"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  Users, 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileCheck, 
  Activity,
  ChevronRight
} from "lucide-react";

// Stat card component
export function StatCard({ 
  title, 
  value, 
  change = 0, 
  icon = "activity", 
  color = "blue" 
}: { 
  title: string; 
  value: number | string; 
  change?: number; 
  icon?: string; 
  color?: string;
}) {
  const iconMap = {
    "file-pending": <FileText />,
    "users": <Users />,
    "credit": <CreditCard />,
    "dollars": <DollarSign />,
    "file-check": <FileCheck />,
    "activity": <Activity />
  };

  const colorMap = {
    "blue": "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    "green": "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    "purple": "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    "amber": "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    "red": "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
  };

  const selectedIcon = iconMap[icon as keyof typeof iconMap] || <Activity />;
  const selectedColor = colorMap[color as keyof typeof colorMap] || colorMap.blue;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {value}
            </h4>
          </div>
          <div className={`p-2 rounded-md ${selectedColor}`}>
            {selectedIcon}
          </div>
        </div>
        
        {change !== undefined && (
          <div className="flex items-center mt-2">
            {change > 0 ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">+{change}%</span>
              </div>
            ) : change < 0 ? (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">{change}%</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="text-xs font-medium">No change</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Recent activity component
export function RecentActivity({ 
  activities = [] 
}: { 
  activities?: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
    user?: string;
  }> 
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-shrink-0">
                <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Charts component
export function Charts() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Charts will be implemented here
        </p>
      </div>
    </div>
  );
}

// Export all components
export const AdminDashboardClient = {
  StatCard,
  RecentActivity,
  Charts
};

export default AdminDashboardClient; 