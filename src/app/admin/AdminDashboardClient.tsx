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
function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color 
}: { 
  title: string; 
  value: number | string; 
  change: number; 
  icon: string; 
  color: string;
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
function RecentActivity({ 
  activities 
}: { 
  activities: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
    user?: string;
  }> 
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {activities.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.map((activity) => (
            <div key={activity.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3">
                    {activity.type === 'user' && (
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    {activity.type === 'tuning' && (
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    {activity.type === 'credit' && (
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{activity.message}</p>
                    <div className="flex items-center mt-1">
                      {activity.user && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                          {activity.user}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Charts component 
function Charts() {
  // In a real app, you would integrate a charting library here
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Tuning Requests
        </h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Chart would be displayed here</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Revenue
        </h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Chart would be displayed here</p>
        </div>
      </div>
    </div>
  );
}

const AdminDashboardClient = {
  StatCard,
  RecentActivity,
  Charts
};

export default AdminDashboardClient; 