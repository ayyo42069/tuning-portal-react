"use client";

import { useState, useEffect } from 'react';
import AdminDashboardClient from './AdminDashboardClient';
import { AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { StatCard, RecentActivity, Charts } = AdminDashboardClient;
  const [dashboardData, setDashboardData] = useState({
    pendingRequests: 0,
    pendingRequestsChange: 0,
    activeUsers: 0,
    activeUsersChange: 0,
    creditsSold: 0,
    creditsSoldChange: 0,
    revenue: 0,
    revenueChange: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  useEffect(() => {
    // Main dashboard data fetching
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        
        if (response.ok) {
          if (data.success) {
            // Extract activities to handle separately
            const { recentActivities, ...rest } = data;
            setDashboardData(rest);
            
            // Handle activities separately
            fetchActivities();
          } else {
            console.error('Failed to fetch dashboard stats:', data.error);
            setError(data.error || 'Could not load dashboard statistics. Please try again later.');
          }
        } else {
          console.error('Failed to fetch dashboard stats:', data.error);
          setError('Could not load dashboard statistics. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError('Could not load dashboard statistics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    // Separate function to fetch activities
    async function fetchActivities() {
      try {
        setActivitiesLoading(true);
        setActivitiesError(null);

        const response = await fetch('/api/admin/activities');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setActivities(data.activities || []);
        } else {
          setActivitiesError(data.error || 'Could not load recent activity. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivitiesError('Could not load recent activity. Please try again later.');
      } finally {
        setActivitiesLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Mock activities as fallback if API fails
  const mockActivities = [
    {
      id: 1,
      type: "user",
      message: "New user registration",
      timestamp: "2024-04-17 12:00:00",
      user: "John Doe"
    },
    {
      id: 2,
      type: "system",
      message: "System update completed",
      timestamp: "2024-04-17 11:30:00"
    },
    {
      id: 3,
      type: "payment",
      message: "New subscription payment received",
      timestamp: "2024-04-17 10:15:00",
      user: "Jane Smith"
    }
  ];

  // Function to retry loading data
  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchDashboardData();
  };

  // Function to retry loading activities only
  const handleRetryActivities = () => {
    setActivitiesLoading(true);
    setActivitiesError(null);
    fetchActivities();
  };

  // Function to handle dashboard data fetching
  async function fetchDashboardData() {
    try {
      const response = await fetch('/api/admin/stats');
      
      // Check if response is valid JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received non-JSON response from server');
      }
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.success) {
          // Extract activities to handle separately
          const { recentActivities, ...rest } = data;
          setDashboardData(rest);
          
          // If we didn't fetch activities separately, use the ones from the stats endpoint
          if (!activities.length && recentActivities && recentActivities.length > 0) {
            setActivities(recentActivities);
            setActivitiesLoading(false);
            setActivitiesError(null);
          }
        } else {
          console.error('Failed to fetch dashboard stats:', data.error);
          setError(data.error || 'Could not load dashboard statistics. Please try again later.');
        }
      } else {
        console.error('Failed to fetch dashboard stats:', data.error);
        setError('Could not load dashboard statistics. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Could not load dashboard statistics. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  // Function to fetch activities
  async function fetchActivities() {
    try {
      setActivitiesLoading(true);
      
      // Try to get activities from the main stats endpoint first (for backward compatibility)
      const response = await fetch('/api/admin/stats');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.recentActivities) {
        setActivities(data.recentActivities || []);
      } else {
        // Fallback to mock activities if no real data available
        setActivities(mockActivities);
      }
      setActivitiesError(null);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivitiesError('Could not load recent activity. Please try again later.');
      // Use mock data as fallback
      setActivities(mockActivities);
    } finally {
      setActivitiesLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 mr-3 h-5 w-5" />
            <p className="text-red-700">{error}</p>
          </div>
          <button 
            onClick={handleRetry}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Users"
              value={dashboardData.activeUsers}
              change={dashboardData.activeUsersChange}
              icon="users"
              color="blue"
            />
            <StatCard
              title="Pending Requests"
              value={dashboardData.pendingRequests}
              change={dashboardData.pendingRequestsChange}
              icon="file-pending"
              color="amber"
            />
            <StatCard
              title="Credits Sold"
              value={dashboardData.creditsSold}
              change={dashboardData.creditsSoldChange}
              icon="credit"
              color="green"
            />
            <StatCard
              title="Total Revenue"
              value={`$${dashboardData.revenue}`}
              change={dashboardData.revenueChange}
              icon="dollars"
              color="purple"
            />
          </div>

          {/* Charts Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
            <Charts />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              {activitiesError && (
                <button 
                  onClick={handleRetryActivities}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Retry
                </button>
              )}
            </div>
            <RecentActivity 
              activities={activities}
              isLoading={activitiesLoading}
              error={activitiesError}
            />
          </div>
        </>
      )}
    </div>
  );
} 