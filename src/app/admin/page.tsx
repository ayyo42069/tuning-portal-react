import { Suspense } from 'react';
import { fetchAdminDashboardStats } from '@/lib/admin/actions';
import AdminDashboardClient from './AdminDashboardClient';
import LoadingSpinner from '@/components/LoadingSpinner';

// Stats widget with robust error handling for static builds
async function StatsWidget() {
  try {
    const stats = await fetchAdminDashboardStats();
    
    if (!stats || stats.error) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-md font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">Could not load dashboard statistics. Please try again later.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminDashboardClient.StatCard 
          title="Pending Requests"
          value={stats.pendingRequests || 0}
          change={stats.pendingRequestsChange || 0}
          icon="file-pending"
          color="blue"
        />
        <AdminDashboardClient.StatCard 
          title="Active Users"
          value={stats.activeUsers || 0}
          change={stats.activeUsersChange || 0}
          icon="users"
          color="green"
        />
        <AdminDashboardClient.StatCard 
          title="Credits Sold"
          value={stats.creditsSold || 0}
          change={stats.creditsSoldChange || 0}
          icon="credit"
          color="purple"
        />
        <AdminDashboardClient.StatCard 
          title="Revenue"
          value={`$${stats.revenue || 0}`}
          change={stats.revenueChange || 0}
          icon="dollars"
          color="amber"
        />
      </div>
    );
  } catch (error) {
    console.error("Error in StatsWidget:", error);
    
    // Always return a valid React element, never undefined
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-md font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">Could not load dashboard statistics. Please try again later.</p>
      </div>
    );
  }
}

// Guaranteed-to-render backup component
function BackupStatsWidget() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <AdminDashboardClient.StatCard 
        title="Pending Requests"
        value="--"
        change={0}
        icon="file-pending"
        color="blue"
      />
      <AdminDashboardClient.StatCard 
        title="Active Users"
        value="--"
        change={0}
        icon="users"
        color="green"
      />
      <AdminDashboardClient.StatCard 
        title="Credits Sold"
        value="--"
        change={0}
        icon="credit"
        color="purple"
      />
      <AdminDashboardClient.StatCard 
        title="Revenue"
        value="--"
        change={0}
        icon="dollars"
        color="amber"
      />
    </div>
  );
}

// Recent activity widget with robust error handling
async function RecentActivityWidget() {
  try {
    const stats = await fetchAdminDashboardStats();
    
    if (!stats || stats.error) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-md font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">Could not load recent activity. Please try again later.</p>
        </div>
      );
    }
    
    return (
      <AdminDashboardClient.RecentActivity 
        activities={stats.recentActivities || []} 
      />
    );
  } catch (error) {
    console.error("Error in RecentActivityWidget:", error);
    
    // Always return a valid React element, never undefined
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-md font-medium text-red-800 dark:text-red-200">Error Loading Data</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">Could not load recent activity. Please try again later.</p>
      </div>
    );
  }
}

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Welcome to the admin dashboard, manage your tuning portal here.
        </p>
      </div>

      {/* Stats section with suspense boundary and error fallback */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Overview
        </h2>
        <Suspense fallback={<BackupStatsWidget />}>
          <StatsWidget />
        </Suspense>
      </section>

      {/* Charts section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Analytics
        </h2>
        <Suspense fallback={<div className="h-[300px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow p-4"><LoadingSpinner /></div>}>
          <AdminDashboardClient.Charts />
        </Suspense>
      </section>

      {/* Recent activity section with suspense boundary */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <Suspense fallback={<div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 h-[300px]"><LoadingSpinner /></div>}>
          <RecentActivityWidget />
        </Suspense>
      </section>
    </div>
  );
}
