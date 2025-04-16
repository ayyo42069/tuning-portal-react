import { Suspense } from 'react';
import { fetchAdminDashboardStats } from '@/lib/admin/actions';
import AdminDashboardClient from './AdminDashboardClient';
import LoadingSpinner from '@/components/LoadingSpinner';

// Stats widget with its own loading state
async function StatsWidget() {
  const stats = await fetchAdminDashboardStats();
  
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
}

// Recent activity widget with its own loading state
async function RecentActivityWidget() {
  const stats = await fetchAdminDashboardStats();
  
  return (
    <AdminDashboardClient.RecentActivity 
      activities={stats.recentActivities || []} 
    />
  );
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

      {/* Stats section with suspense boundary */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Overview
        </h2>
        <Suspense fallback={<LoadingSpinner />}>
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
