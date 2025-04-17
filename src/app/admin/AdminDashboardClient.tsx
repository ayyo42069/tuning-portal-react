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
  const [chartType, setChartType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Sample data fallbacks for different periods
  const getSampleDataForPeriod = (period: 'daily' | 'weekly' | 'monthly') => {
    if (period === 'daily') {
      return [
        { label: 'Mon', users: 120, files: 45, revenue: 1200 },
        { label: 'Tue', users: 132, files: 52, revenue: 1350 },
        { label: 'Wed', users: 101, files: 49, revenue: 1100 },
        { label: 'Thu', users: 134, files: 62, revenue: 1450 },
        { label: 'Fri', users: 190, files: 73, revenue: 2100 },
        { label: 'Sat', users: 121, files: 34, revenue: 980 },
        { label: 'Sun', users: 89, files: 25, revenue: 820 }
      ];
    } else if (period === 'weekly') {
      return [
        { label: 'Week 1', users: 543, files: 210, revenue: 6800 },
        { label: 'Week 2', users: 590, files: 245, revenue: 7200 },
        { label: 'Week 3', users: 620, files: 260, revenue: 7900 },
        { label: 'Week 4', users: 680, files: 290, revenue: 8400 }
      ];
    } else {
      return [
        { label: 'Jan', users: 2100, files: 890, revenue: 28000 },
        { label: 'Feb', users: 2300, files: 920, revenue: 30000 },
        { label: 'Mar', users: 2500, files: 980, revenue: 32000 },
        { label: 'Apr', users: 2700, files: 1050, revenue: 35000 },
        { label: 'May', users: 2900, files: 1120, revenue: 38000 },
        { label: 'Jun', users: 3100, files: 1200, revenue: 41000 }
      ];
    }
  };

  useEffect(() => {
    // Set initial data from sample data
    setChartData(getSampleDataForPeriod(chartType));
    
    // Only fetch data on the client side
    if (typeof window !== 'undefined') {
      async function fetchData() {
        setIsLoading(true);
        setError(null);
        try {
          // Using the built-in Next.js API route at /api/admin/stats/analytics
          const response = await fetch(`/api/admin/stats/analytics?period=${chartType}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          
          if (response.ok) {
            if (data.success && data.data) {
              setChartData(data.data);
            } else {
              setError(data.error || 'Failed to fetch analytics data');
            }
          } else {
            setError(data.error || 'Failed to fetch analytics data');
          }
        } catch (error) {
          setError('Could not load analytics data. Please try again later.');
          console.error('Error fetching analytics data:', error);
        } finally {
          setIsLoading(false);
        }
      }
      
      fetchData();
    } else {
      // On server-side, just set loading to false
      setIsLoading(false);
    }
  }, [chartType]);
  
  // Normalize data for visualization
  const maxUsers = Math.max(...chartData.map(d => d.users));
  const maxFiles = Math.max(...chartData.map(d => d.files));
  const maxRevenue = Math.max(...chartData.map(d => d.revenue));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance Analytics</h3>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setChartType('daily')}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'daily'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setChartType('weekly')}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setChartType('monthly')}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="h-[300px] flex flex-col items-center justify-center">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error}
                </h3>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing sample data for demonstration purposes
          </div>
        </div>
      ) : (
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
                    {/* Users bar */}
                    <div 
                      className="w-3 bg-blue-500 rounded-t-sm" 
                      style={{ height: `${maxUsers > 0 ? (point.users / maxUsers) * 100 : 0}%` }}
                      title={`${point.users} users`}
                    ></div>
                    
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
              <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
              <span className="text-xs text-gray-600 dark:text-gray-300">Users</span>
            </div>
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
      )}
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