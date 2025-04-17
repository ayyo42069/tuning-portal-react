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

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDashboardData(data);
          } else {
            console.error('Failed to fetch dashboard stats:', data.error);
          }
        } else {
          console.error('Failed to fetch dashboard stats');
        }
      } catch (error) {
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