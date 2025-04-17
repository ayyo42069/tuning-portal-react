"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

// Mock data for build time
const mockDashboardData: {
  pendingRequests: number;
  pendingRequestsChange: number;
  activeUsers: number;
  activeUsersChange: number;
  creditsSold: number;
  creditsSoldChange: number;
  revenue: number;
  revenueChange: number;
  recentActivities: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
    user: string;
  }>;
} = {
  pendingRequests: 0,
  pendingRequestsChange: 0,
  activeUsers: 0,
  activeUsersChange: 0,
  creditsSold: 0,
  creditsSoldChange: 0,
  revenue: 0,
  revenueChange: 0,
  recentActivities: []
};

// Mock activities for build time
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

// Dynamically import the client components to ensure they're client-side only
const StatCard = dynamic(() => import('./AdminDashboardClient').then(mod => mod.StatCard), { ssr: false });
const RecentActivity = dynamic(() => import('./AdminDashboardClient').then(mod => mod.RecentActivity), { ssr: false });
const Charts = dynamic(() => import('./AdminDashboardClient').then(mod => mod.Charts), { ssr: false });

// Server-side function to fetch dashboard data
async function getDashboardData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    // Get pending requests count and change
    const pendingRequestsResult = await executeQuery<any[]>(
      `SELECT COUNT(*) as count FROM ecu_files WHERE status = 'pending'`
    );
    const pendingRequests = pendingRequestsResult[0]?.count || 0;

    const pendingRequestsChangeResult = await executeQuery<any[]>(
      `SELECT 
        (COUNT(*) - (
          SELECT COUNT(*) FROM ecu_files 
          WHERE status = 'pending' 
          AND created_at < NOW() - INTERVAL 7 DAY
        )) / NULLIF((
          SELECT COUNT(*) FROM ecu_files 
          WHERE status = 'pending' 
          AND created_at < NOW() - INTERVAL 7 DAY
        ), 0) * 100 as change_percent
      FROM ecu_files 
      WHERE status = 'pending'`
    );
    const pendingRequestsChange = Math.round(pendingRequestsChangeResult[0]?.change_percent || 0);

    // Get active users count and change
    const activeUsersResult = await executeQuery<any[]>(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM user_sessions 
       WHERE last_activity > NOW() - INTERVAL 30 DAY`
    );
    const activeUsers = activeUsersResult[0]?.count || 0;

    const activeUsersChangeResult = await executeQuery<any[]>(
      `SELECT 
        (COUNT(DISTINCT user_id) - (
          SELECT COUNT(DISTINCT user_id) 
          FROM user_sessions 
          WHERE last_activity > NOW() - INTERVAL 60 DAY 
          AND last_activity < NOW() - INTERVAL 30 DAY
        )) / NULLIF((
          SELECT COUNT(DISTINCT user_id) 
          FROM user_sessions 
          WHERE last_activity > NOW() - INTERVAL 60 DAY 
          AND last_activity < NOW() - INTERVAL 30 DAY
        ), 0) * 100 as change_percent
      FROM user_sessions 
      WHERE last_activity > NOW() - INTERVAL 30 DAY`
    );
    const activeUsersChange = Math.round(activeUsersChangeResult[0]?.change_percent || 0);

    // Get credits sold and change
    const creditsSoldResult = await executeQuery<any[]>(
      `SELECT SUM(amount) as total FROM credit_transactions WHERE type = 'purchase'`
    );
    const creditsSold = creditsSoldResult[0]?.total || 0;

    const creditsSoldChangeResult = await executeQuery<any[]>(
      `SELECT 
        (SUM(amount) - (
          SELECT SUM(amount) 
          FROM credit_transactions 
          WHERE type = 'purchase' 
          AND created_at < NOW() - INTERVAL 30 DAY
        )) / NULLIF((
          SELECT SUM(amount) 
          FROM credit_transactions 
          WHERE type = 'purchase' 
          AND created_at < NOW() - INTERVAL 30 DAY
        ), 0) * 100 as change_percent
      FROM credit_transactions 
      WHERE type = 'purchase' 
      AND created_at > NOW() - INTERVAL 30 DAY`
    );
    const creditsSoldChange = Math.round(creditsSoldChangeResult[0]?.change_percent || 0);

    // Get revenue and change
    const revenueResult = await executeQuery<any[]>(
      `SELECT SUM(amount) as total FROM payments WHERE status = 'completed'`
    );
    const revenue = revenueResult[0]?.total || 0;

    const revenueChangeResult = await executeQuery<any[]>(
      `SELECT 
        (SUM(amount) - (
          SELECT SUM(amount) 
          FROM payments 
          WHERE status = 'completed' 
          AND created_at < NOW() - INTERVAL 30 DAY
        )) / NULLIF((
          SELECT SUM(amount) 
          FROM payments 
          WHERE status = 'completed' 
          AND created_at < NOW() - INTERVAL 30 DAY
        ), 0) * 100 as change_percent
      FROM payments 
      WHERE status = 'completed' 
      AND created_at > NOW() - INTERVAL 30 DAY`
    );
    const revenueChange = Math.round(revenueChangeResult[0]?.change_percent || 0);

    // Get recent activities
    const recentActivitiesResult = await executeQuery<any[]>(
      `SELECT 
        id,
        type,
        message,
        created_at as timestamp,
        user_id
      FROM activities 
      ORDER BY created_at DESC 
      LIMIT 10`
    );

    const recentActivities = recentActivitiesResult.map(activity => ({
      id: activity.id,
      type: activity.type,
      message: activity.message,
      timestamp: activity.timestamp,
      user: activity.user_id
    }));

    return {
      pendingRequests,
      pendingRequestsChange,
      activeUsers,
      activeUsersChange,
      creditsSold,
      creditsSoldChange,
      revenue,
      revenueChange,
      recentActivities
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

export default async function AdminDashboard() {
  let dashboardData = mockDashboardData;
  let error = null;

  try {
    dashboardData = await getDashboardData();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch dashboard statistics';
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {error ? (
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