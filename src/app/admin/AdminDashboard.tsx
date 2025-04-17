"use client";

import { useState, useEffect } from 'react';
import AdminDashboardClient from './AdminDashboardClient';

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
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        
        if (response.ok) {
          if (data.success) {
            setDashboardData(data);
            setError(null);
          } else {
            setError(data.error || 'Failed to fetch dashboard statistics');
          }
        } else {
          setError(data.error || 'Failed to fetch dashboard statistics');
        }
      } catch (error) {
        setError('Could not load dashboard statistics. Please try again later.');
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
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
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <RecentActivity 
              activities={dashboardData.recentActivities?.length > 0 
                ? dashboardData.recentActivities 
                : mockActivities} 
            />
          </div>
        </>
      )}
    </div>
  );
} 