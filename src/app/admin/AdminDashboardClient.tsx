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
import { format } from "date-fns";

// Mock data for Overview
const mockOverviewData = {
  pendingRequests: 12,
  pendingRequestsChange: 8.5,
  activeUsers: 156,
  activeUsersChange: 12.3,
  creditsSold: 2450,
  creditsSoldChange: 15.7,
  revenue: 12250,
  revenueChange: 18.2
};

// Mock data for Recent Activity
const mockRecentActivity = [
  {
    id: 1,
    type: "file",
    message: "New ECU file uploaded",
    timestamp: new Date(),
    user: "John Doe"
  },
  {
    id: 2,
    type: "credit",
    message: "Credit purchase completed",
    timestamp: new Date(Date.now() - 3600000),
    user: "Jane Smith"
  },
  {
    id: 3,
    type: "file",
    message: "ECU file processed successfully",
    timestamp: new Date(Date.now() - 7200000),
    user: "Mike Johnson"
  },
  {
    id: 4,
    type: "system",
    message: "System maintenance completed",
    timestamp: new Date(Date.now() - 10800000)
  },
  {
    id: 5,
    type: "credit",
    message: "New credit package added",
    timestamp: new Date(Date.now() - 14400000),
    user: "Admin"
  }
];

// Stat card component
export function StatCard({ 
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
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="h-5 w-5" />;
      case 'file-pending':
        return <FileText className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      case 'dollars':
        return <DollarSign className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'amber':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'green':
        return 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'purple':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${getColorClasses()}`}>
          {getIcon()}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {change >= 0 ? (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
        <span className={`ml-1 text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(change)}%
        </span>
        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">vs last period</span>
      </div>
    </div>
  );
}

// Recent activity component
export function RecentActivity({ activities = mockRecentActivity }: { activities?: typeof mockRecentActivity }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        <Link href="/admin/activity" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <div className="flex-shrink-0">
              {activity.type === 'file' && (
                <FileCheck className="h-5 w-5 text-green-500" />
              )}
              {activity.type === 'credit' && (
                <CreditCard className="h-5 w-5 text-blue-500" />
              )}
              {activity.type === 'system' && (
                <Activity className="h-5 w-5 text-purple-500" />
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                {activity.message}
                {activity.user && (
                  <span className="text-gray-500 dark:text-gray-400"> by {activity.user}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {format(
                  typeof activity.timestamp === 'string' 
                    ? new Date(activity.timestamp) 
                    : activity.timestamp, 
                  'MMM d, h:mm a'
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Charts component
export function Charts() {
  const [chartType, setChartType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Sample data fallbacks for different periods
  const getSampleDataForPeriod = (period: 'daily' | 'weekly' | 'monthly') => {
    if (period === 'daily') {
      return [
        { label: 'Mon', files: 45, revenue: 1200 },
        { label: 'Tue', files: 52, revenue: 1350 },
        { label: 'Wed', files: 49, revenue: 1100 },
        { label: 'Thu', files: 62, revenue: 1450 },
        { label: 'Fri', files: 73, revenue: 2100 },
        { label: 'Sat', files: 34, revenue: 980 },
        { label: 'Sun', files: 25, revenue: 820 }
      ];
    } else if (period === 'weekly') {
      return [
        { label: 'Week 1', files: 210, revenue: 6800 },
        { label: 'Week 2', files: 245, revenue: 7200 },
        { label: 'Week 3', files: 260, revenue: 7900 },
        { label: 'Week 4', files: 290, revenue: 8400 }
      ];
    } else {
      return [
        { label: 'Jan', files: 890, revenue: 28000 },
        { label: 'Feb', files: 920, revenue: 30000 },
        { label: 'Mar', files: 980, revenue: 32000 },
        { label: 'Apr', files: 1050, revenue: 35000 },
        { label: 'May', files: 1120, revenue: 38000 },
        { label: 'Jun', files: 1200, revenue: 41000 }
      ];
    }
  };

  // Set initial data
  useEffect(() => {
    setChartData(getSampleDataForPeriod(chartType));
  }, [chartType]);

  // Normalize data for visualization
  const maxFiles = Math.max(...chartData.map(d => d.files));
  const maxRevenue = Math.max(...chartData.map(d => d.revenue));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Analytics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('daily')}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'daily'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setChartType('weekly')}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'weekly'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setChartType('monthly')}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'monthly'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <div className="h-[300px]">
        <div className="flex h-full">
          {/* Y-axis labels */}
          <div className="w-10 h-full flex flex-col justify-between text-xs text-gray-500 pr-2 pt-1 pb-6">
            <span>Max</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0</span>
          </div>
          
          {/* Chart bars */}
          <div className="flex-1 flex items-end justify-between">
            {chartData.map((point, i) => (
              <div key={i} className="flex flex-col items-center w-full">
                <div className="w-full flex justify-center space-x-1 mb-1 h-[250px] items-end">
                  {/* Files bar */}
                  <div 
                    className="w-3 bg-green-500 rounded-t-sm" 
                    style={{ height: `${maxFiles > 0 ? (point.files / maxFiles) * 100 : 0}%` }}
                    title={`${point.files} files`}
                  ></div>
                  
                  {/* Revenue bar */}
                  <div 
                    className="w-3 bg-purple-500 rounded-t-sm" 
                    style={{ height: `${maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0}%` }}
                    title={`$${point.revenue} revenue`}
                  ></div>
                </div>
                
                {/* X-axis label */}
                <span className="text-xs text-gray-500 mt-1">{point.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Files Processed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-sm mr-2"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">Revenue ($)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview component
export function Overview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Users"
        value={mockOverviewData.activeUsers}
        change={mockOverviewData.activeUsersChange}
        icon="users"
        color="blue"
      />
      <StatCard
        title="Pending Requests"
        value={mockOverviewData.pendingRequests}
        change={mockOverviewData.pendingRequestsChange}
        icon="file-pending"
        color="amber"
      />
      <StatCard
        title="Credits Sold"
        value={mockOverviewData.creditsSold}
        change={mockOverviewData.creditsSoldChange}
        icon="credit"
        color="green"
      />
      <StatCard
        title="Total Revenue"
        value={`$${mockOverviewData.revenue.toLocaleString()}`}
        change={mockOverviewData.revenueChange}
        icon="dollars"
        color="purple"
      />
    </div>
  );
}

// Export all components
export const AdminDashboardClient = {
  StatCard,
  RecentActivity,
  Charts,
  Overview
};

export default AdminDashboardClient; 